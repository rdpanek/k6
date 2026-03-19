/**
 * Executor: externally-controlled
 * https://k6.io/docs/using-k6/scenarios/executors/externally-controlled/
 *
 * Model: Closed — VU čeká na dokončení iterace, počet VUs řídíte vy za běhu.
 *
 * Jak spustit:
 *   k6 run demos/executors/07-externally-controlled.js
 *
 * Ovládání za běhu přes CLI (v druhém terminálu):
 *   # Zvýšit počet VUs na 10:
 *   k6 scale --vus 10
 *
 *   # Snížit na 2:
 *   k6 scale --vus 2
 *
 *   # Zastavit test:
 *   k6 scale --vus 0
 *
 * Ovládání přes REST API (k6 API na localhost:6565):
 *   # Zobrazit stav:
 *   curl http://localhost:6565/v1/status
 *
 *   # Změnit VUs:
 *   curl -X PATCH http://localhost:6565/v1/status \
 *        -H 'Content-Type: application/json' \
 *        -d '{"data":{"attributes":{"vus":10,"paused":false},"type":"status"}}'
 *
 *   # Zastavit:
 *   curl -X PATCH http://localhost:6565/v1/status \
 *        -H 'Content-Type: application/json' \
 *        -d '{"data":{"attributes":{"stopped":true},"type":"status"}}'
 *
 * Pozorované chování:
 *   - Test startuje s 2 VUs a běží 5 minut (nebo do manuálního zastavení).
 *   - Pomocí CLI/API mohou měnit počet VUs za běhu.
 *   - Okamžitá reakce na změnu VUs — viditelná v progress baru.
 *   - POZOR: tento executor nemá gracefulStop!
 *
 * Kdy použít:
 *   Explorativní testování — chcete měnit zátěž manuálně podle reakce systému.
 *   Integrace s externími orchestračními systémy (CI/CD pipeline controlling VUs).
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';

const ES_URL = 'http://localhost:9200';

export const options = {
  scenarios: {
    externally_controlled_demo: {
      executor: 'externally-controlled',
      vus: 2,         // počáteční počet VUs
      maxVUs: 20,     // maximum, které lze nastavit přes API
      duration: '5m', // maximální délka (pokud nezastavíte dříve)
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const vuId = exec.vu.idInTest;
  const activeVUs = exec.instance.vusActive;

  const res = http.get(`${ES_URL}/_cluster/health`);

  check(res, {
    'ES dostupný': (r) => r.status === 200,
  });

  // Každých 10 iterací logujeme stav — vidíte efekt změny VUs
  if (exec.vu.iterationInScenario % 10 === 0) {
    console.log(`VU ${vuId} | aktivní VUs: ${activeVUs} | iterace: ${exec.vu.iterationInScenario}`);
  }

  sleep(1);
}
