/**
 * Executor: ramping-vus + normalDistributionStages (Bell Curve)
 * https://k6.io/docs/javascript-api/jslib/utils/normaldistributionstages/
 *
 * Jak spustit:
 *   k6 run demos/executors/08-bell-curve.js
 *
 * Model: Closed — ramping-vus, VU čeká na dokončení iterace (stejně jako 03 a 04).
 *
 * Co to dělá:
 *   normalDistributionStages(maxVUs, durationSeconds, numberOfStages) automaticky
 *   vygeneruje stages, které tvoří tvar zvonu (Gaussova křivka).
 *   VUs pomalu narůstají na maximum, drží se tam a pak klesají.
 *
 * Vygenerované stages pro normalDistributionStages(20, 60, 7):
 *   { duration: '~9s', target: 2  }   ← levé rameno zvonu
 *   { duration: '~9s', target: 10 }
 *   { duration: '~9s', target: 17 }
 *   { duration: '~9s', target: 20 }   ← vrchol zvonu
 *   { duration: '~9s', target: 17 }
 *   { duration: '~9s', target: 10 }
 *   { duration: '~9s', target: 2  }   ← pravé rameno zvonu
 *
 * Pozorované chování:
 *   - V progress baru: VUs postupně narůstají, dosáhnou maxima a klesají.
 *   - http_reqs/s kopíruje tvar zvonu — přirozená simulace provozu.
 *   - Toto odpovídá reálnému chování uživatelů (ráno přicházejí, odpoledne odcházejí).
 *   - Standard deviation (standardní odchylka): spread kolem průměrné doby odpovědi.
 *
 * Reálné použití:
 *   Simulace denního provozu — ranní špička, poledne, odpolední pokles.
 *   Přirozenější zátěžový profil než skok na maximum a zpět.
 *
 * Reálné využití z praxe:
 *   → Simulace přirozeného denního provozu webu/aplikace:
 *     Ráno uživatelé přicházejí, kolem poledne je peak, odpoledne odcházejí.
 *     Bell curve to modeluje automaticky — stačí zadat max VUček, délku a granularitu.
 *     Výhoda oproti ručním stages: nemusíte počítat konkrétní hodnoty, stačí tvar.
 *
 *   → Výkonnostní základna (baseline) pro porovnávání verzí:
 *     Každý release testujete stejným bell curve profilem.
 *     Výsledky jsou srovnatelné, protože průběh zátěže je vždy stejný tvar.
 *
 *   → Soak test s přirozeným profilem (ne plocha, ale zvon):
 *     Místo "8 hodin na maximu" — 8 hodin se zvonový profil pomalu rozjede, drží a utlumí.
 *     Lépe zachycuje memory leaky a degradaci při postupném náběhu.
 *
 *   → Testování zotavení systému (recovery):
 *     Chcete vědět, jestli systém po přetížení zase "dýchá" normálně.
 *     Bell curve přirozeně klesá — sledujete, jestli response time klesá symetricky
 *     s počtem VUček, nebo jestli systém zůstává pomalý i při snižující se zátěži.
 *     Asymetrie v grafu = systém se nezotavuje správně (memory leak, connection pool vyčerpán).
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';
import { normalDistributionStages } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const ES_URL = 'http://localhost:9200';

// Generuje stages tvaru zvonu: max 20 VUs, celkem 60 sekund, 7 stages
const bellCurveStages = normalDistributionStages(20, 60, 7);

export const options = {
  scenarios: {
    bell_curve_demo: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: bellCurveStages,
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.05'],
  },
};

// setup() běží jednou před testem — ideální místo pro jednorázový log
export function setup() {
  console.log('Bell Curve stages:', JSON.stringify(bellCurveStages, null, 2));
}

export default function () {
  const activeVUs = exec.instance.vusActive;

  const res = http.get(`${ES_URL}/_cluster/health`);

  check(res, {
    'status 200': (r) => r.status === 200,
  });

  // Logujeme aktivní VUs — vizuálně ukazuje tvar zvonu v logu
  if (exec.vu.iterationInScenario === 0) {
    console.log(`Nové VU spuštěno, celkem aktivních: ${activeVUs}`);
  }

  sleep(1);
}
