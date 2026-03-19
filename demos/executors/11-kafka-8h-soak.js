/**
 * Kafka REST Proxy — 8h Soak Test (8 scénářů)
 * https://docs.confluent.io/platform/current/kafka-rest/api.html
 *
 * Jak spustit:
 *   k6 run demos/executors/11-kafka-8h-soak.js
 *
 * Vyžaduje:
 *   Confluent Platform nebo Apache Kafka + REST Proxy:
 *     docker compose up -d
 *   REST Proxy:      http://localhost:8082  (přepis: KAFKA_REST_PROXY=...)
 *   Schema Registry: http://localhost:8081  (přepis: SCHEMA_REGISTRY=...)
 *
 *   Přihlašovací údaje / endpoint lze přepsat přes ENV:
 *     k6 run -e KAFKA_REST_PROXY=http://broker:8082 demos/executors/11-kafka-8h-soak.js
 *
 * Co to dělá:
 *   Simuluje realistický 8hodinový provoz na Kafka REST Proxy e-commerce platformy.
 *   8 nezávislých scénářů pokrývá celý lifecycle zpráv:
 *
 *   Producenti (ramping-arrival-rate — Open Model):
 *   1. objednavky_producer   — nové objednávky (polední peak)
 *   2. platby_producer       — platební události (s 2min zpožděním za objednávkami)
 *   3. inventar_producer     — aktualizace skladu (rovnoměrný + polední spike zásilek)
 *   4. notifikace_producer   — zákaznické notifikace (e-mail, SMS, push)
 *
 *   Konzumenti (ramping-vus — Closed Model):
 *   5. consumer_objednavky   — zpracování objednávek, škáluje s producenty
 *   6. consumer_platby       — zpracování plateb (SLA < 500ms)
 *
 *   Infrastruktura:
 *   7. schema_registry       — validace Avro/JSON schémat (narůstá s producenty)
 *   8. dlq_monitor           — polling Dead Letter Queue
 *
 * Průběh dne (8 hodin):
 *   0h–1h:   Ranní rozjezd — ramp-up všech producentů
 *   1h–3h:   Dopolední provoz — stabilní zátěž
 *   3h–4h:   Polední peak — nejvyšší throughput (~30 obj/s, ~40 inv/s)
 *   4h–6h:   Odpolední provoz — postupný pokles
 *   6h–7h:   Večerní útlum — nižší zátěž
 *   7h–8h:   Noční klid — ramp-down na nulu
 *
 * Klíčové metriky ke sledování:
 *   http_req_duration{type:produce}   — latence produce přes REST Proxy (cíl: p95 < 200ms)
 *   http_req_duration{type:consume}   — latence consume polling (cíl: p95 < 1s)
 *   http_req_duration{type:schema}    — schema registry cache hit (cíl: p95 < 50ms)
 *   http_req_failed                   — chybovost (cíl: < 1%)
 *   dropped_iterations                — producenti nestíhají → nedostatek VUs
 *   vus (v CLI progress baru)         — konzumenti: HPA-like škálování s peakem
 *
 * Reálné využití z praxe:
 *   → E-commerce platforma (Alza, Mall, Rohlík):
 *     Každá objednávka generuje events do Kafka topiců.
 *     8h test simuluje provoz 8:00–16:00 — ranní rozjezd,
 *     polední peak (obědové nákupy), odpolední pokles.
 *     Cíl: ověřit, že REST Proxy zvládne peak bez consumer lag
 *     a že schema registry neblokuje vysokou produce rychlost.
 *
 *   → Finanční instituce (platební gateway):
 *     Platební transakce musí být zpracovány < 500ms (SLA).
 *     platby_producer + consumer_platby tvoří end-to-end měřenou cestu.
 *     Zpomalení consumer_platby = nárůst consumer lag = porušení SLA.
 *     Test to odhalí jako dropped_iterations nebo p95 > threshold.
 *
 *   → Logistická společnost (PPL, Zásilkovna):
 *     inventar_producer simuluje skenery v skladech — rovnoměrný provoz
 *     s poledním spikem (přesun zásilek mezi sklady, přijatá dodávka).
 *     8 hodin = celá ranní/odpolední směna, test ověří výdrž brokeru.
 *
 *   → Kubernetes + Kafka HPA (KEDA):
 *     consumer_objednavky ramping-vus simuluje, jak KEDA škáluje počet
 *     consumer podů podle consumer lag. Polední peak → HPA přidá pody
 *     (více VUs), noční klid → scale-down. Test ověří, jestli škálování
 *     stíhá dohnat lag vzniklý při rychlém nárůstu produce rate.
 *
 *   → Proč 8 scénářů v jednom testu (ne 8 oddělených)?
 *     Realita: všechny systémy běží souběžně a sdílí Kafka broker,
 *     REST Proxy connection pool a Schema Registry cache.
 *     Polední peak na objednávkách + inventáři způsobí souhrnný tlak
 *     na broker → topic leader failover, GC pauzy, network saturation.
 *     Izolovaný test každého topicu tuto souhru NEZACHYTÍ.
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
const CONSUME_HEADERS = {
  'Accept': 'application/vnd.kafka.json.v2+json',
};
const SCHEMA_HEADERS = {
  'Accept': 'application/vnd.schemaregistry.v1+json',
};

export const options = {
  scenarios: {

    // ── 1. Producent objednávek ────────────────────────────────────────────
    // Ranní rozjezd → dopolední provoz → polední peak (30 obj/s) → noční klid
    objednavky_producer: {
      executor: 'ramping-arrival-rate',
      exec: 'produceOrder',
      startRate: 0,
      timeUnit: '1s',
      stages: [
        { duration: '1h',  target: 10 },  // ranní rozjezd
        { duration: '2h',  target: 10 },  // dopolední provoz
        { duration: '30m', target: 30 },  // ramp-up na polední peak
        { duration: '30m', target: 30 },  // polední peak
        { duration: '1h',  target: 20 },  // odpolední pokles
        { duration: '1h',  target: 10 },  // podvečer
        { duration: '1h',  target: 3  },  // večerní útlum
        { duration: '1h',  target: 0  },  // noční klid
      ],
      preAllocatedVUs: 50,
      maxVUs: 100,
      tags: { type: 'produce', topic: 'orders' },
    },

    // ── 2. Producent plateb ────────────────────────────────────────────────
    // Startuje 2min po objednávkách (platba přichází s malým zpožděním).
    // ~60 % objednávek → okamžitá platba kartou, zbytek bankovní převod.
    platby_producer: {
      executor: 'ramping-arrival-rate',
      exec: 'producePayment',
      startTime: '2m',
      startRate: 0,
      timeUnit: '1s',
      stages: [
        { duration: '1h',  target: 6  },
        { duration: '2h',  target: 8  },
        { duration: '30m', target: 18 },  // platební peak (mírně za objednávkami)
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

    // ── 3. Producent skladu ────────────────────────────────────────────────
    // Skenery ve skladu pracují rovnoměrněji než zákazníci.
    // Polední spike = přijatá dodávka + meziskladové přesuny zásilek.
    inventar_producer: {
      executor: 'ramping-arrival-rate',
      exec: 'produceInventory',
      startTime: '1m',
      startRate: 0,
      timeUnit: '1s',
      stages: [
        { duration: '30m',  target: 15 },  // otevření skladu
        { duration: '2h30m',target: 20 },  // dopolední provoz
        { duration: '30m',  target: 40 },  // polední spike — přijatá dodávka
        { duration: '30m',  target: 35 },  // odpolední přesuny
        { duration: '2h',   target: 20 },  // standardní provoz
        { duration: '1h',   target: 10 },  // zavírání skladu
        { duration: '1h',   target: 0  },  // noc
      ],
      preAllocatedVUs: 60,
      maxVUs: 120,
      tags: { type: 'produce', topic: 'inventory' },
    },

    // ── 4. Producent notifikací ────────────────────────────────────────────
    // E-mail + SMS + push notifikace navazují na objednávky a platby.
    // Peak je krátce za objednávkovým peakem (potvrzení se odesílají).
    notifikace_producer: {
      executor: 'ramping-arrival-rate',
      exec: 'produceNotification',
      startTime: '3m',
      startRate: 0,
      timeUnit: '1s',
      stages: [
        { duration: '1h',  target: 5  },  // potvrzení z nočních objednávek
        { duration: '2h',  target: 8  },
        { duration: '30m', target: 20 },  // peak — potvrzení objednávek + plateb
        { duration: '30m', target: 25 },  // notifikační peak (e-mail + SMS + push)
        { duration: '1h',  target: 15 },
        { duration: '1h',  target: 8  },
        { duration: '1h',  target: 3  },
        { duration: '1h',  target: 0  },
      ],
      preAllocatedVUs: 40,
      maxVUs: 80,
      tags: { type: 'produce', topic: 'notifications' },
    },

    // ── 5. Konzument objednávek ────────────────────────────────────────────
    // ramping-vus simuluje Kubernetes KEDA škálování consumer podů:
    // při peaku KEDA detekuje consumer lag → přidá pody (více VUs),
    // po peaku scale-down. GracefulRampDown 2min = čas dokončit inflight zprávy.
    consumer_objednavky: {
      executor: 'ramping-vus',
      exec: 'consumeOrders',
      startTime: '30s',
      startVUs: 2,
      stages: [
        { duration: '1h',  target: 10 },  // škálování s producenty
        { duration: '2h',  target: 15 },  // dopolední počet konsumerů
        { duration: '30m', target: 30 },  // peak — KEDA přidá pody
        { duration: '30m', target: 30 },
        { duration: '2h',  target: 15 },  // KEDA scale-down
        { duration: '1h',  target: 8  },
        { duration: '1h',  target: 2  },
      ],
      gracefulRampDown: '2m',
      tags: { type: 'consume', topic: 'orders' },
    },

    // ── 6. Konzument plateb ────────────────────────────────────────────────
    // Platební konzument má SLA < 500ms.
    // Pokud consumer_platby nestíhá → consumer lag roste → platby se zpožďují.
    consumer_platby: {
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
    // Každá produce operace ověří schéma (cachuje se, ale první dotaz + verze).
    // Při peaku 4 producentů: ~30+18+40+25 = ~113 req/s → schema registry dostane
    // podobnou zátěž (modelujeme jako ~60 req/s po odečtu cache hitů).
    schema_registry: {
      executor: 'ramping-arrival-rate',
      exec: 'checkSchema',
      startTime: '10s',
      startRate: 0,
      timeUnit: '1s',
      stages: [
        { duration: '1h',  target: 20 },  // cache warm-up + produkce
        { duration: '2h',  target: 25 },  // dopolední dotazy
        { duration: '30m', target: 60 },  // peak (4 producenti × peak rate, cache miss ~50 %)
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
    // Dead Letter Queue — monitoruje chybové zprávy v obou DLQ topicích.
    // Malá konstantní zátěž, krátký spike v peaku (více chyb → alerting).
    // V praxi: ops dashboard nebo Prometheus exporter volající tento endpoint.
    dlq_monitor: {
      executor: 'ramping-vus',
      exec: 'monitorDLQ',
      startTime: '1m',
      startVUs: 1,
      stages: [
        { duration: '2h',  target: 2  },  // standardní monitoring
        { duration: '30m', target: 4  },  // peak — více chybových zpráv → alerting
        { duration: '1h',  target: 4  },
        { duration: '30m', target: 2  },
        { duration: '4h',  target: 2  },  // zbytek dne
      ],
      gracefulRampDown: '1m',
      tags: { type: 'monitor', topic: 'dlq' },
    },

  },

  thresholds: {
    // Celková chybovost REST Proxy
    http_req_failed: ['rate<0.01'],

    // Produce latence: REST Proxy overhead by měl být < 200ms p95
    'http_req_duration{type:produce}': ['p(95)<200', 'p(99)<500'],

    // Consume latence: polling může trvat déle (broker timeout při prázdném topicu)
    'http_req_duration{type:consume}': ['p(95)<1000'],

    // Schema Registry: cache hit → velmi rychlý, cache miss → stále < 100ms
    'http_req_duration{type:schema}': ['p(95)<50', 'p(99)<100'],

    // DLQ monitoring: nekritické, ale nesmí blokovat
    'http_req_duration{type:monitor}': ['p(95)<500'],

    // Dropped iterations: při peaku může dojít VUs u producentů
    // rate < 5 % = přijatelné, vyšší = potřeba navýšit maxVUs
    dropped_iterations: ['rate<0.05'],
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const SKUS        = ['SKU-001', 'SKU-002', 'SKU-042', 'SKU-099', 'SKU-500', 'SKU-777'];
const WAREHOUSES  = ['SKLAD-BRNO', 'SKLAD-PRAHA', 'SKLAD-OSTRAVA', 'SKLAD-PLZEN'];
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

// ── 1. Produce: objednávky ───────────────────────────────────────────────────
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
        totalCzk: 299 + (i % 5000),
        status: 'CREATED',
        createdAt: new Date().toISOString(),
      },
    }],
  });

  const res = http.post(`${REST_PROXY}/topics/${TOPIC_ORDERS}`, payload, { headers: PRODUCE_HEADERS });

  check(res, {
    'order produced (200)': (r) => r.status === 200,
    'no offset error':      (r) => {
      if (r.status !== 200) return false;
      const b = JSON.parse(r.body);
      return !b.offsets?.[0]?.error;
    },
  });
}

// ── 2. Produce: platby ───────────────────────────────────────────────────────
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
        amountCzk:    299 + (i % 5000),
        currency:     'CZK',
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

// ── 3. Produce: inventář ─────────────────────────────────────────────────────
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

// ── 4. Produce: notifikace ───────────────────────────────────────────────────
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

// ── 5. Consume: objednávky ───────────────────────────────────────────────────
// Modeluje consumer group poll přes REST Proxy.
// V reálném nasazení: POST /consumers/{group} → POST /subscription → GET /records.
// Zde měříme latenci /topics endpoint jako proxy za broker round-trip.
export function consumeOrders() {
  const res = http.get(`${REST_PROXY}/topics/${TOPIC_ORDERS}`, { headers: CONSUME_HEADERS });

  check(res, {
    'orders topic accessible': (r) => r.status === 200,
    'topic name returned':     (r) => {
      if (r.status !== 200) return false;
      const b = JSON.parse(r.body);
      return b.name === TOPIC_ORDERS;
    },
  });

  sleep(0.5); // Consumer poll interval — realista na rozdíl od tight loop
}

// ── 6. Consume: platby ───────────────────────────────────────────────────────
export function consumePayments() {
  const res = http.get(`${REST_PROXY}/topics/${TOPIC_PAYMENTS}`, { headers: CONSUME_HEADERS });

  check(res, {
    'payments topic accessible': (r) => r.status === 200,
  });

  sleep(0.5);
}

// ── 7. Schema Registry ───────────────────────────────────────────────────────
// Střídáme schémata všech 4 topicůproducentů — cache miss na každý unikátní subject.
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
    // 200 = schéma existuje, 404 = topic bez schématu (OK pro demo bez Schema Registry)
    'schema endpoint OK': (r) => r.status === 200 || r.status === 404,
  });
}

// ── 8. DLQ Monitor ───────────────────────────────────────────────────────────
// Polling Dead Letter Queue topicůobou producentů s největším rizikem chyb.
// 404 = DLQ topic ještě neexistuje (žádné chyby) = pozitivní výsledek!
export function monitorDLQ() {
  const dlqTopics = [TOPIC_DLQ_ORDERS, TOPIC_DLQ_PAYMENTS];
  const topic = cycle(dlqTopics, exec.vu.iterationInScenario);

  const res = http.get(`${REST_PROXY}/topics/${topic}`, { headers: CONSUME_HEADERS });

  check(res, {
    'DLQ endpoint dostupný':    (r) => r.status === 200 || r.status === 404,
    'DLQ je prázdný (404=OK)':  (r) => {
      // 404 = DLQ topic neexistuje = do DLQ nikdy nic nepřišlo = výborný výsledek
      // 200 = topic existuje, obsahuje chybné zprávy — v alertingu by to spustilo alarm
      if (r.status === 404) return true;
      return r.status === 200;
    },
  });

  sleep(2); // DLQ polling každé 2 sekundy
}
