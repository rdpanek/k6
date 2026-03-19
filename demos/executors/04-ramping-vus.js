/**
 * Executor: ramping-vus (Closed Model)
 * https://k6.io/docs/using-k6/scenarios/executors/ramping-vus/
 *
 * Jak spustit:
 *   k6 run demos/executors/04-ramping-vus.js
 *
 * Co to dělá:
 *   Počet VUs se mění v průběhu testu podle definovaných stages.
 *   Každé VU čeká na dokončení iterace (Closed Model — podobně jako constant-vus).
 *
 * Průběh stages (celkem 50s):
 *   0s  → 10s:  ramp-up   0 → 10 VUs  (nárůst zátěže)
 *   10s → 25s:  hold      10 VUs       (ustálená zátěž)
 *   25s → 40s:  ramp-up   10 → 20 VUs  (stress fáze)
 *   40s → 50s:  ramp-down 20 → 0 VUs   (ukončení)
 *
 * Pozorované chování:
 *   - V progress baru: "XX/20 VUs" — počet VUs se mění v reálném čase.
 *   - http_reqs/s stoupá a klesá spolu s počtem VUs.
 *   - gracefulRampDown=10s: VUs dostanou čas na dokončení iterace při ramp-down.
 *   - Toto je CLOSED MODEL: throughput závisí na odezvě serveru.
 *
 * Klíčové metriky ke sledování:
 *   - vus (aktuální počet VUs)
 *   - http_reqs (požadavky/s — kopíruje křivku VUs)
 *   - http_req_duration (doby odezvy)
 *
 * Kdy použít:
 *   Ramp-up testy — hledáte, při jakém počtu VUs systém začne selhávat.
 *   Smoke → Load → Stress test scénáře.
 *
 * Reálné využití z praxe:
 *   → Nejčastější executor v praxi — produkční profil zátěže:
 *     Víte, že produkce má peak 1000 uživatelů. Nastavíte pomalý nárůst (30 min na 1000 VUs),
 *     pak ustálená zátěž (1–2 hodiny), pak konec. Pomalý nárůst dává čas sledovat monitoring
 *     a zachytit, při jakém počtu VUs se systém začíná chovat jinak.
 *
 *   → Baseline / srovnávací test před a po deploy:
 *     Stejný ramping profil před a po nasazení nové verze — srovnáte response time grafy.
 *
 *   → Hledání breaking pointu (stress test):
 *     Přidáváte VUčka, dokud systém nezačne selhávat. Threshold abortOnFail zastaví test,
 *     jakmile error rate překročí limit — víte přesně, kde je hranice.
 *
 *   → Web aplikace s přirozeným náběhem:
 *     Ráno přicházejí uživatelé postupně (ramp-up 30 min), pak pracují (hold),
 *     odpoledne odcházejí (ramp-down). Lépe odpovídá realitě než okamžitý skok na plný počet.
 *
 *   → Kubernetes autoscaling test:
 *     Pomalý nárůst VUček — sledujete, kdy Kubernetes začne přidávat pody (HPA).
 *     Zjistíte, jestli autoscaling reaguje dost rychle a jestli nové pody stíhají.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';

const ES_URL = 'http://localhost:9200';

export const options = {
  scenarios: {
    ramping_vus_demo: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 10 },  // ramp-up
        { duration: '15s', target: 10 },  // hold — ustálená zátěž
        { duration: '15s', target: 20 },  // stress — zdvojnásobení
        { duration: '10s', target: 0 },   // ramp-down
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const vuId = exec.vu.idInTest;

  // Dotaz na cluster health — vidíme stav ES pod rostoucí zátěží
  const res = http.get(`${ES_URL}/_cluster/health?pretty=false`);

  check(res, {
    'status 200': (r) => r.status === 200,
    'cluster není red': (r) => {
      const body = JSON.parse(r.body);
      return body.status !== 'red';
    },
  });

  // Logujeme aktivní VUs — při prohlížení logu vidíte, jak počet roste/klesá
  if (exec.vu.iterationInScenario === 0) {
    console.log(`VU ${vuId} spuštěno (aktivních VUs: ${exec.instance.vusActive})`);
  }

  // Sleep = čas práce uživatele (Closed Model)
  sleep(1);
}
