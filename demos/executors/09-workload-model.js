/**
 * Workload Model — kombinace více executorů
 * https://k6.io/docs/using-k6/scenarios/advanced-examples/
 *
 * Jak spustit:
 *   k6 run demos/executors/09-workload-model.js
 *
 * Co to dělá:
 *   Realistický workload model pro Elasticsearch kombinující 3 nezávislé scénáře:
 *
 *   Scénář 1 — health_monitor (constant-vus):
 *     Nepřetržité monitorování health ES po celou dobu testu.
 *     Simuluje: operátoři/monitoring systém, který neustále kontroluje stav.
 *
 *   Scénář 2 — document_indexer (constant-arrival-rate):
 *     Indexuje dokumenty fixní rychlostí 5 req/s (Open Model).
 *     Startuje po 5s, aby ES měl čas připravit se.
 *     Simuluje: aplikace, která průběžně zapisuje data do ES.
 *
 *   Scénář 3 — search_load (ramping-arrival-rate):
 *     Vyhledávání s narůstající zátěží (1 → 10 → 5 req/s).
 *     Startuje po 10s — nejprve indexujeme, pak prohledáváme.
 *     Simuluje: uživatelé, kteří prohledávají data (přicházejí postupně).
 *
 * Pozorované chování:
 *   - 3 nezávislé progress bary — každý scénář je viditelný zvlášť.
 *   - Každý scénář má vlastní tag (scenario_type) → filtrování v metrikách.
 *   - Různé thresholdy pro různé scénáře.
 *   - Celkový počet VUs je součtem všech scénářů.
 *
 * CLI výstup bude vypadat přibližně takto:
 *   scenarios: (100.00%) 3 scenarios, XX max VUs, ~1m40s max duration
 *   * health_monitor:  5 VUs constant (constant-vus)
 *   * document_indexer: 5 RPS constant (constant-arrival-rate, startTime: 5s)
 *   * search_load:      1→10→5 RPS ramping (ramping-arrival-rate, startTime: 10s)
 *
 * Reálné využití z praxe:
 *   → Realistický mixed workload pro e-shop:
 *     Scénář 1 (constant-vus):      health/monitoring — jeden "sondážní" VU zjišťuje stav DB.
 *     Scénář 2 (constant-arr-rate): zákazníci přidávají produkty do košíku — konstantní rate.
 *     Scénář 3 (ramping-arr-rate):  vyhledávání roste s příchodem uživatelů přes den.
 *
 *   → Kafka pipeline test (producer + consumer + monitoring):
 *     Scénář 1: constant-vus — producer posílá zprávy konstantní rychlostí.
 *     Scénář 2: ramping-arrival-rate — počet konsumerů roste podle fronty.
 *     Scénář 3: constant-vus — monitoring lag metriky topicu (consumer lag).
 *
 *   → Microservices test — realistická komunikace mezi službami:
 *     Scénář 1: auth service — konstantní přihlašování uživatelů.
 *     Scénář 2: product service — narůstající dotazy na katalog.
 *     Scénář 3: order service — spike při flash sale.
 *     Každý scénář má vlastní threshold a tag → v Grafaně vidíte breakdown per služba.
 *
 *   → Proč kombinovat a ne psát tři samostatné testy?
 *     Reálný provoz není sekvenční — zápis, čtení a monitoring probíhají současně.
 *     Kombinovaný test odhalí bottlenecky způsobené souběžností (connection pool,
 *     thread contention, GC pauzy), které se v izolovaných testech neprojeví.
 */
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import exec from 'k6/execution';

const ES_URL = 'http://localhost:9200';
const INDEX = 'k6-workload-demo';

export const options = {
  scenarios: {

    // ── Scénář 1: Monitorování ────────────────────────────────────────────
    health_monitor: {
      executor: 'constant-vus',
      exec: 'monitorHealth',
      vus: 2,
      duration: '1m',
      tags: { scenario_type: 'monitoring' },
      env: { SCENARIO: 'health_monitor' },
    },

    // ── Scénář 2: Zápis dokumentů ────────────────────────────────────────
    document_indexer: {
      executor: 'constant-arrival-rate',
      exec: 'indexDocument',
      startTime: '5s',      // čekáme 5s než začneme psát
      rate: 5,
      timeUnit: '1s',       // 5 dokumentů/s
      duration: '50s',
      preAllocatedVUs: 10,
      maxVUs: 20,
      tags: { scenario_type: 'write' },
      env: { SCENARIO: 'document_indexer' },
    },

    // ── Scénář 3: Vyhledávání (narůstající) ───────────────────────────────
    search_load: {
      executor: 'ramping-arrival-rate',
      exec: 'searchDocuments',
      startTime: '10s',     // nejprve naindexujeme, pak prohledáváme
      startRate: 1,
      timeUnit: '1s',
      stages: [
        { duration: '15s', target: 5 },   // ramp-up: 1 → 5 req/s
        { duration: '20s', target: 10 },  // stress: 5 → 10 req/s
        { duration: '10s', target: 0 },   // ramp-down
      ],
      preAllocatedVUs: 15,
      maxVUs: 40,
      tags: { scenario_type: 'read' },
      env: { SCENARIO: 'search_load' },
    },
  },

  thresholds: {
    // Globální thresholdy
    http_req_failed: ['rate<0.05'],

    // Per-scénář thresholdy přes tagy
    'http_req_duration{scenario_type:monitoring}': ['p(95)<200'],
    'http_req_duration{scenario_type:write}': ['p(95)<500'],
    'http_req_duration{scenario_type:read}': ['p(95)<800'],

    // Dropped iterations nesmí přesáhnout 5%
    dropped_iterations: ['rate<0.05'],
  },
};

// ── Funkce scénáře 1: Health monitoring ─────────────────────────────────────
export function monitorHealth() {
  group('ES Health Check', function () {
    const res = http.get(`${ES_URL}/_cluster/health`);

    check(res, {
      'health 200': (r) => r.status === 200,
      'cluster není red': (r) => {
        const body = JSON.parse(r.body);
        return body.status !== 'red';
      },
    });
  });

  sleep(2); // Monitoring každé 2 sekundy
}

// ── Funkce scénáře 2: Indexování dokumentů ──────────────────────────────────
export function indexDocument() {
  const docId = `${exec.vu.idInTest}-${exec.vu.iterationInScenario}`;

  const payload = JSON.stringify({
    scenario: __ENV.SCENARIO,
    vu_id: exec.vu.idInTest,
    iteration: exec.vu.iterationInScenario,
    timestamp: new Date().toISOString(),
    message: `Test dokument ${docId}`,
  });

  group('Indexování do ES', function () {
    const res = http.post(
      `${ES_URL}/${INDEX}/_doc/${docId}`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );

    check(res, {
      'dokument uložen': (r) => r.status === 200 || r.status === 201,
    });
  });

  // Žádný sleep — Open Model, rate řídí executor
}

// ── Funkce scénáře 3: Vyhledávání ───────────────────────────────────────────
export function searchDocuments() {
  const searchQuery = JSON.stringify({
    query: { match_all: {} },
    size: 5,
    sort: [{ timestamp: { order: 'desc' } }],
  });

  group('Vyhledávání v ES', function () {
    const res = http.post(
      `${ES_URL}/${INDEX}/_search`,
      searchQuery,
      { headers: { 'Content-Type': 'application/json' } }
    );

    check(res, {
      'search OK nebo index neexistuje': (r) => r.status === 200 || r.status === 404,
      'výsledky vráceny': (r) => {
        if (r.status !== 200) return true; // index ještě neexistuje — OK
        const body = JSON.parse(r.body);
        return body.hits !== undefined;
      },
    });
  });

  // Žádný sleep — Open Model, rate řídí executor
}
