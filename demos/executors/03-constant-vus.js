/**
 * Executor: constant-vus (Closed Model)
 * https://k6.io/docs/using-k6/scenarios/executors/constant-vus/
 *
 * Jak spustit:
 *   k6 run demos/executors/03-constant-vus.js
 *
 * Co to dělá:
 *   5 VUs běží nepřetržitě po dobu 30 sekund a generují maximální počet iterací.
 *   Každé VU čeká na dokončení iterace před spuštěním další (Closed Model).
 *
 * Pozorované chování:
 *   - Konstantní počet VUs (5) po celou dobu testu.
 *   - Throughput (iterací/s) závisí na době odpovědi ES + sleep().
 *   - Při sleep(1): ~5 iterací/s (5 VUs × 1 iter/s každé).
 *   - Pokud ES zpomalí → iterace trvají déle → méně iterací za sekundu.
 *   - Toto je CLOSED MODEL: zpomalení serveru = méně požadavků = Coordinated Omission!
 *
 * Klíčová demonstrace Closed Modelu:
 *   Zkuste zvýšit sleep(1) na sleep(3) → vidíte pokles throughputu.
 *   Systém "spolupracuje" se zpomalením = Coordinated Omission.
 *
 * Kdy použít:
 *   Simulace stálého počtu aktivních uživatelů (např. 5 lidí neustále pracuje v systému).
 *   Backoffice systémy, soak testy.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';

const ES_URL = 'http://localhost:9200';

export const options = {
  scenarios: {
    constant_vus_demo: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const vuId = exec.vu.idInTest;

  // Indexujeme dokument do ES — každé VU posílá svá data
  const payload = JSON.stringify({
    executor: 'constant-vus',
    vu_id: vuId,
    timestamp: new Date().toISOString(),
    iteration: exec.vu.iterationInScenario,
  });

  const res = http.post(
    `${ES_URL}/k6-demo/_doc`,
    payload,
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(res, {
    'dokument uložen (201)': (r) => r.status === 201,
  });

  // CLOSED MODEL: sleep simuluje "čas práce uživatele"
  // Pokud ES odpoví pomalu, celková smyčka trvá déle → méně iterací/s
  // Zkuste: sleep(1) vs sleep(3) a sledujte http_reqs metriku
  sleep(1);
}
