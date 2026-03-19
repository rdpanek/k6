/**
 * Executor: constant-arrival-rate (Open Model)
 * https://k6.io/docs/using-k6/scenarios/executors/constant-arrival-rate/
 *
 * Jak spustit:
 *   k6 run demos/executors/05-constant-arrival-rate.js
 *
 * Co to dělá:
 *   K6 spouští přesně 10 iterací za sekundu po dobu 30s — celkem ~300 iterací.
 *   Počet VUs se dynamicky přizpůsobuje, aby udržel požadovaný rate (Open Model).
 *   K6 NEČEKÁ na dokončení iterace — spouští novou iteraci každých 100ms (1/10s).
 *
 * Pozorované chování:
 *   - http_reqs ≈ 10/s — konstantní, bez ohledu na dobu odpovědi ES.
 *   - Některé iterace záměrně mají sleep(náhodný) → K6 přidělí více VUs.
 *   - dropped_iterations = 0, pokud preAllocatedVUs stačí.
 *   - Toto je OPEN MODEL: zpomalení serveru NEOVLIVNÍ throughput.
 *
 * Výpočet preAllocatedVUs:
 *   Průměrná iterace: request (~50ms) + sleep (0–500ms) = ~300ms průměr
 *   preAllocatedVUs = median_duration × rate = 0.3s × 10 = 3 VUs (minimum)
 *   + 50% buffer pro varianci = ~5 VUs → nastavíme 10 pro jistotu
 *
 * Porovnání s constant-vus (03):
 *   constant-vus:     throughput závisí na odezvě → Closed Model, CO problém
 *   constant-arrival-rate: throughput FIXNÍ → Open Model, CO vyřešeno!
 *
 * Kdy použít:
 *   Throughput testy — testujeme "zvládne ES 10 req/s?"
 *   Simulace reálného příchodu uživatelů (nezávislých na odezvě).
 *
 * Reálné využití z praxe:
 *   → E-commerce peak season (logistika, Vánoce, Black Friday):
 *     Víte, že přes sváteční sezónu proteče systémem X transakcí za hodinu celý týden.
 *     Chcete vědět, jestli to ustojí VMka, pody, APIčka a stíhá se replikovat databáze.
 *     Reální uživatelé nepočkají, až server odpoví — posílají požadavky pevnou rychlostí.
 *
 *   → Frontend, který agresivně retryuje:
 *     Špatně napsaný JS na frontendu — když backend nestíhá, frontend posílá další requesty.
 *     Constant arrival rate simuluje tento "útok" bez ohledu na stav backendu.
 *
 *   → Kubernetes + HPA (Horizontal Pod Autoscaler):
 *     Máte jasně definovanou SLA: "systém musí zvládnout 500 req/s".
 *     Pustíte constant arrival rate na 500/s a sledujete, jestli Kubernetes přidá pody
 *     dost rychle a jestli load balancer správně distribuuje zátěž.
 *
 *   → Testování fronty (Kafka, RabbitMQ) — producer side:
 *     Chcete produkovat přesně 100 zpráv za sekundu do topicu.
 *     Sledujete consumer lag — jak rychle konzumenti stíhají zprávy zpracovávat.
 *
 *   → API rate limiting test:
 *     Chcete ověřit, že vaše API správně vrací 429 (Too Many Requests),
 *     když překročíte limit. Pustíte konstantní rate těsně nad limit a ověříte chování.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';

const ES_URL = 'http://localhost:9200';

export const options = {
  scenarios: {
    constant_arrival_rate_demo: {
      executor: 'constant-arrival-rate',
      rate: 10,               // 10 iterací za timeUnit
      timeUnit: '1s',         // → 10 iterací/sekundu = 10 RPS
      duration: '30s',
      preAllocatedVUs: 10,    // pre-alokované VUs (pool)
      maxVUs: 30,             // maximální počet VUs, pokud nestačí preAllocated
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
    // Klíčová metrika pro Open Model: dropped_iterations musí být 0
    dropped_iterations: ['count<5'],
  },
};

export default function () {
  const vuId = exec.vu.idInTest;

  // Variabilní doba odpovědi — simuluje reálné prostředí
  // V Open Modelu to NEVADÍ: K6 spustí nové VU, aby udržel 10 RPS
  const randomDelay = Math.random() * 0.5; // 0–500ms náhodný delay

  const res = http.get(`${ES_URL}/_cluster/health`);

  check(res, {
    'status 200': (r) => r.status === 200,
  });

  // Sleep způsobí, že iterace trvají různě dlouho
  // Sledujte: http_reqs/s zůstane ~10 i přes variabilitu!
  // (K6 přiděluje více VUs, aby kompenzoval delší iterace)
  sleep(randomDelay);

  if (exec.vu.iterationInScenario === 0) {
    console.log(`VU ${vuId} alokováno pro arrival-rate`);
  }
}
