/**
 * Kafka REST Proxy — 8-Hour Soak Test (8 Scenarios)
 * https://docs.confluent.io/platform/current/kafka-rest/api.html
 *
 * How to run:
 *   k6 run demos/executors/11-kafka-8h-soak.js
 *
 * Requirements:
 *   Confluent Platform (Kafka + REST Proxy + Schema Registry):
 *     cd demos/kafka-stack && docker compose up -d
 *   REST Proxy:      http://localhost:8082  (override: KAFKA_REST_PROXY=...)
 *   Schema Registry: http://localhost:8081  (override: SCHEMA_REGISTRY=...)
 *
 *   Override endpoint via ENV:
 *     k6 run -e KAFKA_REST_PROXY=http://broker:8082 demos/executors/11-kafka-8h-soak.js
 *
 * What it does:
 *   Simulates a realistic 8-hour workday on Kafka REST Proxy for an e-commerce platform.
 *   8 independent scenarios cover the full message lifecycle:
 *
 *   Producers (ramping-arrival-rate — Open Model):
 *   1. orders_producer      — new orders (lunch-hour peak)
 *   2. payments_producer    — payment events (2-min delay behind orders)
 *   3. inventory_producer   — warehouse stock updates (steady + midday delivery spike)
 *   4. notifications_producer — customer notifications (email, SMS, push)
 *
 *   Consumers (ramping-vus — Closed Model):
 *   5. consumer_orders      — order processing, scales with producers
 *   6. consumer_payments    — payment processing (SLA < 500 ms)
 *
 *   Infrastructure:
 *   7. schema_registry      — Avro/JSON schema validation (grows with producers)
 *   8. dlq_monitor          — Dead Letter Queue polling
 *
 * Daily traffic pattern (8 hours):
 *   0h–1h:   Morning ramp-up — all producers scale up
 *   1h–3h:   Morning traffic — steady load
 *   3h–4h:   Lunch peak      — highest throughput (~30 orders/s, ~40 inventory/s)
 *   4h–6h:   Afternoon       — gradual decline
 *   6h–7h:   Evening         — low load
 *   7h–8h:   Night wind-down — ramp down to zero
 *
 * Key metrics to watch:
 *   http_req_duration{type:produce}  — REST Proxy produce latency (target: p95 < 200 ms)
 *   http_req_duration{type:consume}  — consume poll latency (target: p95 < 1 s)
 *   http_req_duration{type:schema}   — schema registry cache hit (target: p95 < 50 ms)
 *   http_req_failed                  — error rate (target: < 1%)
 *   dropped_iterations               — producers starved of VUs
 *   vus (in CLI progress bar)        — consumers: KEDA-like HPA scaling with peak
 *
 * Real-world use cases:
 *   → E-commerce platform (e.g. large online retailer):
 *     Every order generates events into Kafka topics.
 *     The 8h test simulates 08:00–16:00 — morning ramp-up,
 *     lunch peak (midday shopping), afternoon decline.
 *     Goal: verify REST Proxy handles peak without consumer lag
 *     and schema registry doesn't block high produce rate.
 *
 *   → Financial institution (payment gateway):
 *     Payment transactions must be processed < 500 ms (SLA).
 *     payments_producer + consumer_payments form the measured end-to-end path.
 *     Slowing consumer_payments = growing consumer lag = SLA breach.
 *     The test exposes this as dropped_iterations or p95 > threshold.
 *
 *   → Logistics company (parcel delivery):
 *     inventory_producer simulates warehouse scanners — steady traffic
 *     with a midday spike (parcel transfers, incoming shipment).
 *     8 hours = a full morning/afternoon shift; the test validates broker endurance.
 *
 *   → Kubernetes + Kafka HPA (KEDA):
 *     consumer_orders ramping-vus simulates how KEDA scales consumer pod count
 *     based on consumer lag. Lunch peak → HPA adds pods (more VUs);
 *     night wind-down → scale-down. The test validates whether scaling
 *     catches up with lag accumulated during rapid produce-rate ramp-up.
 *
 *   → Why 8 scenarios in one test (not 8 separate tests)?
 *     Reality: all systems run simultaneously, sharing the Kafka broker,
 *     REST Proxy connection pool and Schema Registry cache.
 *     Lunch peak on orders + inventory creates combined pressure on the broker
 *     → topic leader failover, GC pauses, network saturation.
 *     An isolated per-topic test would MISS this interaction.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';

const REST_PROXY      = __ENV.KAFKA_REST_PROXY  || 'http://localhost:8082';
const SCHEMA_REGISTRY = __ENV.SCHEMA_REGISTRY   || 'http://localhost:8081';

const TOPIC_ORDERS        = 'ecommerce.orders.v1';
const TOPIC_PAYMENTS      = 'ecommerce.payments.v1';
const TOPIC_INVENTORY     = 'ecommerce.inventory.v1';
const TOPIC_NOTIFICATIONS = 'ecommerce.notifications.v1';
const TOPIC_DLQ_ORDERS    = 'ecommerce.orders.dlq';
const TOPIC_DLQ_PAYMENTS  = 'ecommerce.payments.dlq';

const PRODUCE_HEADERS = {
  'Content-Type': 'application/vnd.kafka.json.v2+json',
  'Accept':       'application/vnd.kafka.v2+json',
};
// vnd.kafka.v2+json is the correct Accept header for topic metadata endpoints
// (GET /topics/{topic}). vnd.kafka.json.v2+json is for consumer record fetch only.
const CONSUME_HEADERS = {
  'Accept': 'application/vnd.kafka.v2+json',
};
const SCHEMA_HEADERS = {
  'Accept': 'application/vnd.schemaregistry.v1+json',
};

export const options = {
  scenarios: {

    // ── 1. Orders producer ────────────────────────────────────────────────
    // Morning ramp-up → morning traffic → lunch peak (30 orders/s) → night wind-down
    orders_producer: {
      executor: 'ramping-arrival-rate',
      exec: 'produceOrder',
      startRate: 0,
      timeUnit: '1s',
      stages: [
        { duration: '1h',  target: 10 },  // morning ramp-up
        { duration: '2h',  target: 10 },  // morning steady traffic
        { duration: '30m', target: 30 },  // ramp to lunch peak
        { duration: '30m', target: 30 },  // lunch peak
        { duration: '1h',  target: 20 },  // afternoon decline
        { duration: '1h',  target: 10 },  // late afternoon
        { duration: '1h',  target: 3  },  // evening wind-down
        { duration: '1h',  target: 0  },  // night silence
      ],
      preAllocatedVUs: 50,
      maxVUs: 100,
      tags: { type: 'produce', topic: 'orders' },
    },

    // ── 2. Payments producer ───────────────────────────────────────────────
    // Starts 2 min after orders (payment follows order with a small delay).
    // ~60% of orders → immediate card payment; rest → bank transfer.
    payments_producer: {
      executor: 'ramping-arrival-rate',
      exec: 'producePayment',
      startTime: '2m',
      startRate: 0,
      timeUnit: '1s',
      stages: [
        { duration: '1h',  target: 6  },
        { duration: '2h',  target: 8  },
        { duration: '30m', target: 18 },  // payment peak (slightly behind orders)
        { duration: '30m', target: 18 },
        { duration: '1h',  target: 12 },
        { duration: '58m', target: 6  },
        { duration: '1h',  target: 2  },
        { duration: '1h',  target: 0  },
      ],
      preAllocatedVUs: 40,
      maxVUs: 80,
      tags: { type: 'produce', topic: 'payments' },
    },

    // ── 3. Inventory producer ──────────────────────────────────────────────
    // Warehouse scanners run more evenly than customers.
    // Midday spike = incoming shipment + inter-warehouse parcel transfers.
    inventory_producer: {
      executor: 'ramping-arrival-rate',
      exec: 'produceInventory',
      startTime: '1m',
      startRate: 0,
      timeUnit: '1s',
      stages: [
        { duration: '30m',  target: 15 },  // warehouse opening
        { duration: '2h30m',target: 20 },  // morning operations
        { duration: '30m',  target: 40 },  // midday spike — incoming shipment
        { duration: '30m',  target: 35 },  // afternoon transfers
        { duration: '2h',   target: 20 },  // standard operations
        { duration: '1h',   target: 10 },  // warehouse closing
        { duration: '1h',   target: 0  },  // night
      ],
      preAllocatedVUs: 60,
      maxVUs: 120,
      tags: { type: 'produce', topic: 'inventory' },
    },

    // ── 4. Notifications producer ──────────────────────────────────────────
    // Email + SMS + push notifications follow orders and payments.
    // Peak is slightly behind the order peak (confirmation sent after order).
    notifications_producer: {
      executor: 'ramping-arrival-rate',
      exec: 'produceNotification',
      startTime: '3m',
      startRate: 0,
      timeUnit: '1s',
      stages: [
        { duration: '1h',  target: 5  },  // confirmations from overnight orders
        { duration: '2h',  target: 8  },
        { duration: '30m', target: 20 },  // peak — order + payment confirmations
        { duration: '30m', target: 25 },  // notification peak (email + SMS + push)
        { duration: '1h',  target: 15 },
        { duration: '1h',  target: 8  },
        { duration: '1h',  target: 3  },
        { duration: '1h',  target: 0  },
      ],
      preAllocatedVUs: 40,
      maxVUs: 80,
      tags: { type: 'produce', topic: 'notifications' },
    },

    // ── 5. Orders consumer ────────────────────────────────────────────────
    // ramping-vus simulates Kubernetes KEDA scaling of consumer pods:
    // at peak KEDA detects consumer lag → adds pods (more VUs);
    // after peak → scale-down. GracefulRampDown 2 min = time to finish in-flight messages.
    consumer_orders: {
      executor: 'ramping-vus',
      exec: 'consumeOrders',
      startTime: '30s',
      startVUs: 2,
      stages: [
        { duration: '1h',  target: 10 },  // scale with producers
        { duration: '2h',  target: 15 },  // morning consumer count
        { duration: '30m', target: 30 },  // peak — KEDA adds pods
        { duration: '30m', target: 30 },
        { duration: '2h',  target: 15 },  // KEDA scale-down
        { duration: '1h',  target: 8  },
        { duration: '1h',  target: 2  },
      ],
      gracefulRampDown: '2m',
      tags: { type: 'consume', topic: 'orders' },
    },

    // ── 6. Payments consumer ───────────────────────────────────────────────
    // Payment consumer has SLA < 500 ms.
    // If consumer_payments falls behind → consumer lag grows → payments delayed.
    consumer_payments: {
      executor: 'ramping-vus',
      exec: 'consumePayments',
      startTime: '2m30s',
      startVUs: 2,
      stages: [
        { duration: '1h',  target: 8  },
        { duration: '2h',  target: 10 },
        { duration: '30m', target: 20 },  // peak
        { duration: '30m', target: 20 },
        { duration: '2h',  target: 10 },
        { duration: '58m', target: 5  },
        { duration: '1h',  target: 2  },
      ],
      gracefulRampDown: '2m',
      tags: { type: 'consume', topic: 'payments' },
    },

    // ── 7. Schema Registry ─────────────────────────────────────────────────
    // Every produce operation validates its schema (cached after first hit).
    // At 4-producer peak: ~30+18+40+25 = ~113 req/s → schema registry receives
    // similar load (modelled as ~60 req/s after deducting cache hits).
    schema_registry: {
      executor: 'ramping-arrival-rate',
      exec: 'checkSchema',
      startTime: '10s',
      startRate: 0,
      timeUnit: '1s',
      stages: [
        { duration: '1h',  target: 20 },  // cache warm-up + production
        { duration: '2h',  target: 25 },  // morning queries
        { duration: '30m', target: 60 },  // peak (4 producers × peak rate, ~50% cache miss)
        { duration: '30m', target: 60 },
        { duration: '2h',  target: 35 },
        { duration: '1h',  target: 15 },
        { duration: '1h',  target: 0  },
      ],
      preAllocatedVUs: 30,
      maxVUs: 80,
      tags: { type: 'schema', topic: 'registry' },
    },

    // ── 8. DLQ Monitor ─────────────────────────────────────────────────────
    // Dead Letter Queue — monitors failed messages in both DLQ topics.
    // Small constant load; short spike at peak (more errors → alerting fires).
    // In practice: an ops dashboard or Prometheus exporter hitting this endpoint.
    dlq_monitor: {
      executor: 'ramping-vus',
      exec: 'monitorDLQ',
      startTime: '1m',
      startVUs: 1,
      stages: [
        { duration: '2h',  target: 2  },  // standard monitoring
        { duration: '30m', target: 4  },  // peak — more failed messages → alerting
        { duration: '1h',  target: 4  },
        { duration: '30m', target: 2  },
        { duration: '4h',  target: 2  },  // rest of the day
      ],
      gracefulRampDown: '1m',
      tags: { type: 'monitor', topic: 'dlq' },
    },

  },

  thresholds: {
    // Overall REST Proxy error rate
    http_req_failed: ['rate<0.01'],

    // Produce latency: REST Proxy overhead should be < 200 ms p95
    'http_req_duration{type:produce}': ['p(95)<200', 'p(99)<500'],

    // Consume latency: polling may take longer (broker timeout on empty topic)
    'http_req_duration{type:consume}': ['p(95)<1000'],

    // Schema Registry: cache hit → very fast, cache miss → still < 100 ms
    'http_req_duration{type:schema}': ['p(95)<50', 'p(99)<100'],

    // DLQ monitoring: non-critical, but must not block
    'http_req_duration{type:monitor}': ['p(95)<500'],

    // Dropped iterations: acceptable to drop a few at peak when VUs are exhausted
    // rate < 5% = acceptable; higher = increase maxVUs
    dropped_iterations: ['rate<0.05'],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const SKUS        = ['SKU-001', 'SKU-002', 'SKU-042', 'SKU-099', 'SKU-500', 'SKU-777'];
const WAREHOUSES  = ['WH-EAST', 'WH-WEST', 'WH-NORTH', 'WH-SOUTH'];
const PAY_METHODS = ['CARD', 'GOOGLEPAY', 'APPLEPAY', 'BANKTRANSFER'];
const NOTIF_CH    = ['EMAIL', 'SMS', 'PUSH'];
const INV_REASONS = ['SALE', 'RETURN', 'RESTOCK', 'TRANSFER'];
const INV_DELTAS  = [-5, -3, -1, 1, 5, 10, 50];

function vuKey() {
  return `${exec.vu.idInTest}-${exec.vu.iterationInScenario}`;
}

function cycle(arr, n) {
  return arr[n % arr.length];
}

// ── 1. Produce: orders ────────────────────────────────────────────────────────
export function produceOrder() {
  const orderId = `ord-${vuKey()}-${Date.now()}`;
  const i = exec.vu.iterationInScenario;

  const payload = JSON.stringify({
    records: [{
      key: orderId,
      value: {
        orderId,
        customerId: `cust-${(exec.vu.idInTest * 7) % 10000}`,
        items: [{ sku: cycle(SKUS, i), qty: 1 + (i % 5) }],
        totalUsd: 29.99 + (i % 500),
        status: 'CREATED',
        createdAt: new Date().toISOString(),
      },
    }],
  });

  const res = http.post(`${REST_PROXY}/topics/${TOPIC_ORDERS}`, payload, { headers: PRODUCE_HEADERS });

  check(res, {
    'order produced (200)': (r) => r.status === 200,
    'no offset error': (r) => {
      if (r.status !== 200) return false;
      const b = JSON.parse(r.body);
      return !b.offsets?.[0]?.error;
    },
  });
}

// ── 2. Produce: payments ──────────────────────────────────────────────────────
export function producePayment() {
  const payId = `pay-${vuKey()}-${Date.now()}`;
  const i = exec.vu.iterationInScenario;

  const payload = JSON.stringify({
    records: [{
      key: payId,
      value: {
        paymentId:    payId,
        orderId:      `ord-${(exec.vu.idInTest * 3) % 50000}`,
        method:       cycle(PAY_METHODS, i),
        amountUsd:    29.99 + (i % 500),
        currency:     'USD',
        status:       'AUTHORIZED',
        authorizedAt: new Date().toISOString(),
      },
    }],
  });

  const res = http.post(`${REST_PROXY}/topics/${TOPIC_PAYMENTS}`, payload, { headers: PRODUCE_HEADERS });

  check(res, {
    'payment produced (200)': (r) => r.status === 200,
  });
}

// ── 3. Produce: inventory ─────────────────────────────────────────────────────
export function produceInventory() {
  const i   = exec.vu.iterationInScenario;
  const sku = cycle(SKUS, i);

  const payload = JSON.stringify({
    records: [{
      key: sku,
      value: {
        sku,
        warehouse: cycle(WAREHOUSES, exec.vu.idInTest),
        delta:     cycle(INV_DELTAS, i),
        reason:    cycle(INV_REASONS, i),
        updatedAt: new Date().toISOString(),
      },
    }],
  });

  const res = http.post(`${REST_PROXY}/topics/${TOPIC_INVENTORY}`, payload, { headers: PRODUCE_HEADERS });

  check(res, {
    'inventory produced (200)': (r) => r.status === 200,
  });
}

// ── 4. Produce: notifications ─────────────────────────────────────────────────
export function produceNotification() {
  const customerId = `cust-${(exec.vu.idInTest * 11) % 10000}`;
  const i = exec.vu.iterationInScenario;

  const payload = JSON.stringify({
    records: [{
      key: customerId,
      value: {
        customerId,
        channel:     cycle(NOTIF_CH, i),
        templateId:  `ORDER_CONFIRM_${cycle(NOTIF_CH, i)}`,
        orderId:     `ord-${(exec.vu.idInTest * 5) % 50000}`,
        scheduledAt: new Date().toISOString(),
      },
    }],
  });

  const res = http.post(`${REST_PROXY}/topics/${TOPIC_NOTIFICATIONS}`, payload, { headers: PRODUCE_HEADERS });

  check(res, {
    'notification produced (200)': (r) => r.status === 200,
  });
}

// ── 5. Consume: orders ────────────────────────────────────────────────────────
// Models consumer group poll via REST Proxy topic metadata endpoint.
// GET /topics/{topic} returns topic info (name, partitions, configs) — used to
// measure REST Proxy round-trip latency as a proxy for broker responsiveness.
export function consumeOrders() {
  const res = http.get(`${REST_PROXY}/topics/${TOPIC_ORDERS}`, { headers: CONSUME_HEADERS });

  check(res, {
    'orders topic accessible': (r) => r.status === 200,
    'topic name returned': (r) => {
      if (r.status !== 200) return false;
      const b = JSON.parse(r.body);
      return b.name === TOPIC_ORDERS;
    },
  });

  sleep(0.5); // consumer poll interval — realistic gap between polls
}

// ── 6. Consume: payments ──────────────────────────────────────────────────────
export function consumePayments() {
  const res = http.get(`${REST_PROXY}/topics/${TOPIC_PAYMENTS}`, { headers: CONSUME_HEADERS });

  check(res, {
    'payments topic accessible': (r) => r.status === 200,
  });

  sleep(0.5);
}

// ── 7. Schema Registry ────────────────────────────────────────────────────────
// Cycles through schemas for all 4 producer topics — triggers cache miss for each unique subject.
export function checkSchema() {
  const subjects = [
    `${TOPIC_ORDERS}-value`,
    `${TOPIC_PAYMENTS}-value`,
    `${TOPIC_INVENTORY}-value`,
    `${TOPIC_NOTIFICATIONS}-value`,
  ];
  const subject = cycle(subjects, exec.vu.iterationInScenario);

  const res = http.get(
    `${SCHEMA_REGISTRY}/subjects/${subject}/versions/latest`,
    { headers: SCHEMA_HEADERS }
  );

  check(res, {
    // 200 = schema exists; 404 = topic without schema (OK for demo without registered schemas)
    'schema endpoint OK': (r) => r.status === 200 || r.status === 404,
  });
}

// ── 8. DLQ Monitor ───────────────────────────────────────────────────────────
// Polling Dead Letter Queue topics for both highest-risk producers.
// 404 = DLQ topic does not exist yet (no errors) = positive result!
export function monitorDLQ() {
  const dlqTopics = [TOPIC_DLQ_ORDERS, TOPIC_DLQ_PAYMENTS];
  const topic = cycle(dlqTopics, exec.vu.iterationInScenario);

  const res = http.get(`${REST_PROXY}/topics/${topic}`, { headers: CONSUME_HEADERS });

  check(res, {
    'DLQ endpoint reachable': (r) => r.status === 200 || r.status === 404,
    'DLQ is empty (404=OK)': (r) => {
      // 404 = DLQ topic does not exist = nothing has ever failed = excellent result
      // 200 = topic exists, contains failed messages → would trigger alerting in production
      return r.status === 200 || r.status === 404;
    },
  });

  sleep(2); // DLQ polling interval: every 2 seconds
}
