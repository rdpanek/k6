/**
 * Executor: ramping-arrival-rate (Open Model)
 * https://k6.io/docs/using-k6/scenarios/executors/ramping-arrival-rate/
 *
 * Jak spustit:
 *   k6 run demos/executors/06-ramping-arrival-rate.js
 *
 * Co to dělá:
 *   Rate iterací se mění v průběhu stages — od 1 RPS po 20 RPS a zpět.
 *   Na rozdíl od ramping-vus (04) se mění RATE iterací, ne počet VUs.
 *   K6 dynamicky přiděluje VUs z pre-alokovaného poolu.
 *
 * Průběh stages (celkem 60s):
 *   0s  → 15s:  ramp-up   1 → 10 RPS  (pomalý nárůst)
 *   15s → 35s:  hold      10 RPS       (ustálená zátěž)
 *   35s → 50s:  ramp-up   10 → 20 RPS  (stress fáze)
 *   50s → 60s:  ramp-down 20 → 0 RPS   (ukončení)
 *
 * Pozorované chování:
 *   - http_reqs/s se mění podle stages (1→10→10→20→0).
 *   - Počet VUs roste dynamicky, aby pokryl vyšší rate.
 *   - Na rozdíl od ramping-vus: NENÍ to "kolik uživatelů", ale "kolik požadavků/s".
 *   - dropped_iterations: pokud preAllocatedVUs nestačí při 20 RPS.
 *   - Open Model: response time ES neovlivní rate (zpomalení = více VUs, ne méně RPS).
 *
 * Rozdíl ramping-vus vs ramping-arrival-rate:
 *   ramping-vus:           stages definují počet VUs → Closed Model
 *   ramping-arrival-rate:  stages definují počet iterací/s → Open Model
 *
 * Kdy použít:
 *   Spike testy — testujeme náhlý nárůst počtu požadavků.
 *   Hledáme breaking point systému v počtu req/s.
 */
import http from 'k6/http';
import { check } from 'k6';
import exec from 'k6/execution';

const ES_URL = 'http://localhost:9200';

export const options = {
  scenarios: {
    ramping_arrival_rate_demo: {
      executor: 'ramping-arrival-rate',
      startRate: 1,           // začínáme na 1 iteraci/s
      timeUnit: '1s',
      stages: [
        { duration: '15s', target: 10 },  // ramp-up: 1 → 10 RPS
        { duration: '20s', target: 10 },  // hold: 10 RPS
        { duration: '15s', target: 20 },  // stress: 10 → 20 RPS
        { duration: '10s', target: 0 },   // ramp-down: 20 → 0 RPS
      ],
      preAllocatedVUs: 20,    // pool VUs pro nízkou zátěž
      maxVUs: 60,             // maximum pro stress fázi (20 RPS × ~0.1s iterace = 2 VUs min, ale buffer)
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.05'],
    dropped_iterations: ['count<10'],
  },
};

export default function () {
  // Vyhledávací dotaz na ES — simuluje search workload
  const searchQuery = JSON.stringify({
    query: { match_all: {} },
    size: 1,
  });

  const res = http.post(
    `${ES_URL}/k6-demo/_search`,
    searchQuery,
    { headers: { 'Content-Type': 'application/json' } }
  );

  // ES vrátí 404 pokud index neexistuje — to je OK pro demo
  check(res, {
    'search OK nebo index neexistuje': (r) => r.status === 200 || r.status === 404,
  });

  // ŽÁDNÝ sleep — Open Model executor řídí pacing sám!
  // Sleep by zde narušil přesnost rate a plýtval VUs.
}
