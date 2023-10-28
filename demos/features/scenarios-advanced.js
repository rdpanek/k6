/**
 * Custom Summary
 * https://k6.io/docs/using-k6/scenarios/advanced-examples/
 * 
 * How to run
 * k6 run demos/features/scenarios-advanced.js 
 * 
 * Pouze default
 * k6 run -i 1 --env MYVAR=contacts demos/features/scenarios-advanced.js
 */
import exec from 'k6/execution';
import { check, fail } from 'k6';
import http from 'k6/http';

export const options = {
  // discardResponseBodies znamena ze se nebudou ukladat response body
  discardResponseBodies: true,
  scenarios: {
    // start po 0s, 10VU a max 30s
    contacts: {
      executor: 'constant-vus',
      exec: 'contacts',
      vus: 10,
      duration: '10s',
      // vsechny metriky budou mit tag my_custom_tag s hodnotou contacts
      tags: { my_custom_tag: 'contacts' },
      // pro toto scenario bude mit MYVAR hodnotu contacts
      env: { MYVAR: 'contacts' },
    },
    // start po 30s, 10VU a 100 iterací a max 1m
    news: {
      executor: 'per-vu-iterations',
      exec: 'news',
      vus: 10,
      iterations: 100,
      startTime: '10s',
      maxDuration: '1m',
      // vsechny metriky budou mit tag my_custom_tag s hodnotou news
      tags: { my_custom_tag: 'news' },
      // pro toto scenario bude mit MYVAR hodnotu news
      env: { MYVAR: 'news' },
    },
    // stejny exec, ale jine nastaveni
    my_api_test_1: {
      executor: 'constant-arrival-rate',
      rate: 90,
      timeUnit: '1m', // 90 iterations per minute, i.e. 1.5 RPS
      duration: '2m',
      preAllocatedVUs: 10, // the size of the VU (i.e. worker) pool for this scenario
      tags: { test_type: 'api' }, // different extra metric tags for this scenario
      env: { MY_CROC_ID: '1' }, // and we can specify extra environment variables as well!
      exec: 'apitest', // this scenario is executing different code than the one above!
    },
    my_api_test_2: {
      executor: 'ramping-arrival-rate',
      startTime: '10s', // the ramping API test starts a little later
      startRate: 5,
      timeUnit: '1s', // we start at 50 iterations per second
      stages: [
        { target: 10, duration: '30s' }, // go from 50 to 200 iters/s in the first 30 seconds
        { target: 15, duration: '30s' }, // hold at 200 iters/s for 3.5 minutes
        { target: 0, duration: '30s' }, // ramp down back to 0 iters/s over the last 30 second
      ],
      preAllocatedVUs: 20, // how large the initial pool of VUs would be
      maxVUs: 100, // if the preAllocatedVUs are not enough, we can initialize more
      tags: { test_type: 'api' }, // different extra metric tags for this scenario
      env: { MY_CROC_ID: '2' }, // same function, different environment variables
      exec: 'apitest', // same function as the scenario above, but with different env vars
    },
  },
  thresholds: {
    // vsechny metriky s tagem my_custom_tag s hodnotou contacts musi mit prumernou hodnotu response time pod 200ms
    'http_req_duration{my_custom_tag:contacts}': ['p(95)<200'],
    // vsechny metriky s tagem my_custom_tag s hodnotou news musi mit prumernou hodnotu response time pod 200ms
    'http_req_duration{my_custom_tag:news}': ['p(95)<200'],
    'http_req_duration{expected_response:true}': ['p(95)<200'],
    'http_req_duration{test_type:api}': ['p(95)<250', 'p(99)<350'],
    'http_req_duration{scenario:my_api_test_2}': ['p(99)<300'],
    // droped iterations
    dropped_iterations: ['rate<0.1'], // míra zahozených iterací nesmí být více jak 10%
  },
};

export default function () {
  contacts();
  news();
}

export function contacts() {
  /**
   * __ITER je interní proměnná v k6, která obsahuje pořadové číslo iterace v rámci testovacího běhu. Tato proměnná je k dispozici v rámci funkce testu a může být použita k vytvoření unikátních hodnot pro každou iteraci.
   */
  if (__ITER == 0) {
    console.log('contacts',exec.vu.metrics.tags);
  }
  if (__ENV.MYVAR != 'contacts') fail('MYVAR not contains contacts');

  let res = http.get('https://test.k6.io/contacts.php', {
    tags: { my_custom_tag: 'contacts' },
  });
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}

export function news() {
  if (__ITER == 0) {
    console.log('contacts',exec.vu.metrics.tags);
  }
  if (__ENV.MYVAR != 'news') fail('MYVAR not contains news');

  let res = http.get('https://test.k6.io/news.php', { tags: { my_custom_tag: 'news' } });
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}

export function apitest() {
  let res = http.get(`https://test-api.k6.io/public/crocodiles/${__ENV.MY_CROC_ID}/`);
  // no need for sleep() here, the iteration pacing will be controlled by the arrival-rate executors!
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}
