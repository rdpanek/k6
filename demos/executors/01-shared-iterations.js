/**
 * Executor: shared-iterations
 * https://k6.io/docs/using-k6/scenarios/executors/shared-iterations/
 *
 * Jak spustit:
 *   k6 run demos/executors/01-shared-iterations.js
 *
 * Model: Closed — VU čeká na dokončení iterace před spuštěním další.
 *
 * Co to dělá:
 *   5 VUs sdílí 30 iterací dohromady. Test skončí, když jsou všechny iterace hotové.
 *   Každé VU si "bere" další iteraci, jakmile dokončí předchozí.
 *   → Pokud chcete zaručit STEJNÝ počet iterací na VU, použijte per-vu-iterations.
 *
 * Pozorované chování:
 *   - Rychlejší VUs (s nižším ID) obvykle zpracují více iterací.
 *   - Počet iterací na VU NENÍ rovnoměrný — závisí na rychlosti každého VU.
 *   - V logu vidíte: "VU X → iterace Y" — porovnejte, kolik udělalo každé VU.
 *   - Celkový počet dokončených iterací = vždy přesně 30.
 *
 * Reálné využití z praxe:
 *     Příklad: setup fáze testu, kde potřebujete naplnit index daty co nejrychleji.
 *
 *   → Generování zátěže na API s fixním počtem požadavků:
 *     "Chci vygenerovat 10 000 requestů na endpoint /search — kolik zvládne za jak dlouho?"
 *     VUčka pracují paralelně, rychlejší si vezmou více práce — test skončí co nejdříve.
 *
 *   → Smoke test s omezeným počtem iterací:
 *     Potřebujete ověřit, že deployment funguje — pustíte 1 VU a 5 iterací, nic víc.
 *
 *   → Srovnávací (benchmark) testy: vždy stejný celkový počet požadavků,
 *     aby se výsledky daly porovnávat mezi verzemi aplikace.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';

const ES_URL = 'http://localhost:9200';

export const options = {
  scenarios: {
    shared_iterations_demo: {
      executor: 'shared-iterations',
      vus: 5,
      iterations: 300,
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
  const iter = exec.vu.iterationInScenario;

  const res = http.get(`${ES_URL}/_cluster/health`);

  check(res, {
    'ES health status 200': (r) => r.status === 200,
    'cluster status green or yellow': (r) => {
      const body = JSON.parse(r.body);
      return body.status === 'green' || body.status === 'yellow';
    },
  });

  // Log ukazuje, které VU dělá kterou iteraci
  // Pozorujte: distribuce iterací není rovnoměrná
  console.log(`VU ${vuId} → iterace ${iter} (celkem v testu: ${exec.scenario.iterationInTest})`);

  // Sleep simuluje dobu zpracování — rychlejší VUs udělají více iterací
  sleep(0.5);
}
