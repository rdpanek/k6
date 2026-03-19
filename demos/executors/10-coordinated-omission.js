/**
 * Koordinované vynechání (Coordinated Omission)
 * https://k6.io/docs/using-k6/scenarios/concepts/open-vs-closed/
 *
 * Jak spustit:
 *   k6 run demos/executors/10-coordinated-omission.js
 *
 * Co to dělá:
 *   Dva scénáře běží souběžně a simulují STEJNOU situaci: server funguje normálně
 *   prvních 20 sekund, pak se "zpomalí" (simulováno pomocí sleep).
 *
 *   Scénář A — closed_model (constant-vus):
 *     5 VUs, Closed Model. Každé VU čeká na odpověď → CO nastane.
 *
 *   Scénář B — open_model (constant-arrival-rate):
 *     10 req/s, Open Model. K6 posílá požadavky pevnou rychlostí → CO nevznikne.
 *
 * Simulace zpomalení serveru:
 *   První polovina testu  (progress < 0.5): sleep(0.1s) → "server odpovídá rychle"
 *   Druhá polovina testu  (progress ≥ 0.5): sleep(2s)   → "server se zpomalil"
 *
 * Pozorované chování:
 *
 *   Poznámka k simulaci: sleep() zde zastupuje "dobu odpovědi serveru" (v reálu
 *   by to bylo vysoké http_req_duration). ES localhost odpovídá vždy rychle (~2ms),
 *   proto http_req_duration zůstane nízké — CO efekt je viditelný přes throughput
 *   a iteration_duration (která zahrnuje sleep).
 *
 *   closed_model (Closed — CO problém):
 *   - První polovina (0–20s): ~45 iter/s (5 VUs × rychlé iterace se sleep 0.1s)
 *   - Druhá polovina (20–40s): ~1.5 iter/s — PROPAD o ~97%!
 *   - K6 "spolupracuje" se zpomalením: VUs čekají → odesílají méně requestů
 *   - iteration_duration: p(90)=2s, p(95)=2s → signál CO
 *   - http_reqs klesne dramaticky → graf ukáže prázdnotu
 *
 *   open_model (Open — CO vyřešeno):
 *   - Po celou dobu: snaží se udržet 10 req/s
 *   - Při zpomalení: K6 potřebuje 2s × 10/s = 20 VUs, má jen 15–20 → dropped_iterations!
 *   - Varování v CLI: "Insufficient VUs, reached 20 active VUs"
 *   - dropped_iterations > 0 → poctivé přiznání: "nestihli jsme odeslat X requestů"
 *   - http_reqs zůstane mnohem vyšší než u closed modelu
 *
 * Klíčové srovnání (CO problém v číslech):
 *   Bez CO (open):  ~388 iterací v druhé polovině (z 400 plánovaných, 12 dropped)
 *   S CO (closed):  ~30 iterací v druhé polovině (z ~900 plánovaných v rychlé fázi)
 *   → Closed model "neví" o 870 potenciálních uživatelích — CO je zamaskovalo
 *
 * Metriky ke sledování:
 *   iterations (trend v čase)         → closed: propad v druhé polovině
 *   http_reqs (trend v čase)          → closed: ~45/s → ~1.5/s, open: drží ~10/s
 *   dropped_iterations                → jen u open modelu, signalizuje problém
 *   iteration_duration p(90)/p(95)    → roste na 2s → CO signál (zahrnuje sleep)
 *   vus (v progress baru)             → open: roste na max, closed: fixních 5
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';

const ES_URL = 'http://localhost:9200';

export const options = {
  scenarios: {

    // ── Scénář A: Closed Model — CO problém ──────────────────────────────
    closed_model: {
      executor: 'constant-vus',
      exec: 'closedTest',
      vus: 5,
      duration: '40s',
      tags: { model: 'closed' },
    },

    // ── Scénář B: Open Model — CO vyřešeno ───────────────────────────────
    open_model: {
      executor: 'constant-arrival-rate',
      exec: 'openTest',
      rate: 10,
      timeUnit: '1s',
      duration: '40s',
      // Úmyslně méně VUs než potřeba při zpomalení (2s × 10/s = 20 VUs)
      // → dropped_iterations ukáží, kolik uživatelů "zmizelo" v Closed modelu
      preAllocatedVUs: 15,
      maxVUs: 20,
      tags: { model: 'open' },
    },
  },

  thresholds: {
    // Closed model: throughput klesne → P99 z malého vzorku
    'http_req_duration{model:closed}': ['p(99)<3000'],
    // Open model: P99 ukáže reálné 2s zpomalení
    'http_req_duration{model:open}': ['p(99)<3000'],
    // Dropped iterations — klíčová metrika pro CO detekci
    // Nestaví se jako fail threshold, jen sledujeme
    'dropped_iterations': ['count>=0'],
  },
};

// Simulace doby odpovědi serveru: rychlá → pomalá v polovině testu
function simulujOdpovědServeru() {
  const pomaleFaze = exec.scenario.progress >= 0.5;
  if (pomaleFaze) {
    sleep(2); // server se "zpomalil" — odpovídá 2s
  } else {
    sleep(0.1); // normální provoz
  }
}

// ── Test A: Closed Model ─────────────────────────────────────────────────────
export function closedTest() {
  const res = http.get(`${ES_URL}/_cluster/health`);

  check(res, {
    'status 200': (r) => r.status === 200,
  });

  // CLOSED MODEL: K6 čeká na simulatedDelay → při zpomalení se sníží celkový rate
  // Tohle je přesně CO: nástroj "spolupracuje" se zpomalením serveru
  simulujOdpovědServeru();
}

// ── Test B: Open Model ───────────────────────────────────────────────────────
export function openTest() {
  const res = http.get(`${ES_URL}/_cluster/health`);

  check(res, {
    'status 200': (r) => r.status === 200,
  });

  // OPEN MODEL: executor řídí rate nezávisle na délce iterace
  // sleep() zde stále běží, ale NESNIŽUJE rate — executor spustí nové VU
  // Pokud dojdou VUs → dropped_iterations (poctivé přiznání problému)
  simulujOdpovědServeru();
}
