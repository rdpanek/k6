/**
 * Executor: per-vu-iterations
 * https://k6.io/docs/using-k6/scenarios/executors/per-vu-iterations/
 *
 * Jak spustit:
 *   k6 run demos/executors/02-per-vu-iterations.js
 *
 * Model: Closed — každé VU čeká na dokončení své iterace, pak spustí další.
 *
 * Co to dělá:
 *   5 VUs, každé provede přesně 6 iterací.
 *   Celkový počet iterací = VUs × iterations = 5 × 6 = 30.
 *
 * Pozorované chování:
 *   - Každé VU udělá PŘESNĚ 6 iterací — zaručená rovnoměrnost.
 *   - Test skončí, až VŠECHNA VUs dokončí svůj počet iterací.
 *   - Pomalé VU zpomalí celý test (čeká na posledního).
 *   - V logu vidíte: "VU X → iterace Y" — každé VU má iterace 0–5.
 *
 * Porovnání se shared-iterations (01):
 *   shared-iterations: "kdo dřív přijde, ten dřív mele" → nerovnoměrné
 *   per-vu-iterations: každé VU má svůj díl → rovnoměrné, ale pomalejší
 *
 * Kdy použít:
 *   Chcete, aby každý "uživatel" provedl stejný počet akcí.
 *   Např. každý VU provede 6 transakcí a pak skončí.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';

const ES_URL = 'http://localhost:9200';

export const options = {
  scenarios: {
    per_vu_iterations_demo: {
      executor: 'per-vu-iterations',
      vus: 5,
      iterations: 6,       // každé VU udělá přesně 6 iterací → celkem 30
      maxDuration: '2m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const vuId = exec.vu.idInTest;
  const iterInVU = exec.vu.iterationInScenario;   // 0–5 pro každé VU zvlášť

  const res = http.get(`${ES_URL}/_cluster/health`);

  check(res, {
    'ES health status 200': (r) => r.status === 200,
    'cluster status green or yellow': (r) => {
      const body = JSON.parse(r.body);
      return body.status === 'green' || body.status === 'yellow';
    },
  });

  // Každé VU má iterace 0, 1, 2, 3, 4, 5 — nikdy víc ani méně
  console.log(`VU ${vuId} → iterace ${iterInVU}/5`);

  sleep(0.5);
}
