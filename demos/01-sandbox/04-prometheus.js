/**
 * How to run:
 * ./k6.prom run ./demos/01-sandbox/04-prometheus.js --out 'prometheus=namespace=k6'
 */

import http from 'k6/http';
import { sleep, group, check } from 'k6';
import { Counter, Trend } from 'k6/metrics';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const mobileErrors = new Counter('error_counter_mobile');
const mobileSuccess = new Counter('success_counter_mobile');
const desktopErrors = new Counter('error_counter_desktop');
const desktopSuccess = new Counter('success_counter_desktop');
const desktopResponseTime = new Trend('desktop_response_time');

export let options = {
  tags: { // available acros all metrics
    testType: 'smoke', // optional - type of test
    tc: '3487' // optional - e.g. ticket id
  },
  scenarios: {
    desktop: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '1m', target: 10 },
        { duration: '10m', target: 13 },
        { duration: '1m', target: 10 },
        { duration: '10m', target: 5 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '0s',
      exec: 'desktop',
    },
    mobile: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 5 },
        { duration: '1m', target: 15 },
        { duration: '4m', target: 5 },
        { duration: '10m', target: 15 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '0s',
      exec: 'mobile',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    error_counter_mobile: ['count < 1'],
    error_counter_desktop: ['count < 1'],
    desktop_response_time: ['max < 200'],
  },
};




const BASE_URL = 'https://quickpizza.grafana.com';

const PIZZA_BODY = JSON.stringify({
  maxCaloriesPerSlice: 1000,
  mustBeVegetarian: false,
  excludedIngredients: [],
  excludedTools: [],
  maxNumberOfToppings: 5,
  minNumberOfToppings: 2,
  customName: '',
});

export function setup() {
  const username = `k6_${randomString(8)}`;
  const password = randomString(12);

  http.post(`${BASE_URL}/api/users`,
    JSON.stringify({ username, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const csrfRes = http.post(`${BASE_URL}/api/csrf-token`);
  const csrf = csrfRes.cookies['csrf'] ? csrfRes.cookies['csrf'][0].value : '';

  const loginRes = http.post(`${BASE_URL}/api/users/token/login`,
    JSON.stringify({ username, password, csrf }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  console.log(`Logged in with username: ${username} and password: ${password}, token: ${loginRes.json('token')}`);
  return { token: `Token ${loginRes.json('token')}` };
}

export function desktop(data) {
  group('Get pizza recommendation', () => {
    let res = http.post(`${BASE_URL}/api/pizza`, PIZZA_BODY, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': data.token,
      },
      tags: { type: 'desktop' },
    });
    let resCheck = check(res, {
      'is status 200': (r) => r.status === 200,
    }, {check: 'desktop'});
    if (!resCheck) {
      desktopErrors.add(1);
    } else {
      desktopSuccess.add(1);
    }
    desktopResponseTime.add(res.timings.duration, {type: 'desktop'});
    sleep(1);
  });
}

export function mobile(data) {
  group('Get pizza recommendation', () => {
    let res = http.post(`${BASE_URL}/api/pizza`, PIZZA_BODY, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': data.token,
      },
      tags: { type: 'mobile' },
    });
    let resCheck = check(res, {
      'is status 200': (r) => r.status === 200,
    }, {check: 'mobile_check'});
    if (!resCheck) {
      mobileErrors.add(1);
    } else {
      mobileSuccess.add(1);
    }
    sleep(1);
  });
}