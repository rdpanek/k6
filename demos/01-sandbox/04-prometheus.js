/**
 * How to run:
 * ./k6-prom run ./demos/01-sandbox/04-prometheus.js --out 'prometheus=namespace=k6'
 */

import http from 'k6/http';
import { sleep, group, check } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const mobileErrors = new Counter('error_counter_mobile');
const mobileSuccess = new Counter('success_counter_mobile');
const desktopErrors = new Counter('error_counter_desktop');
const desktopSuccess = new Counter('success_counter_desktop');
const desktopResponseTime = new Trend('desktop_response_time');

export let options = {
  tags: { // available acros all metrics
    type: 'smoke', // optional - type of test
    tc: '3487' // optional - e.g. ticket id
  },
  scenarios: {
    desktop: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '1m', target: 10 },
        { duration: '1m', target: 13 },
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




export function desktop() {
  group('Get crocodile API', () => {
    let res = http.get('https://test-api.k6.io/public/crocodiles/1/', {tags: {type: 'desktop'}});
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

export function mobile() {
  group('Get crocodile API', () => {
    let res = http.get('https://test-api.k6.io/public/crocodiles/1/', {tags: {type: 'mobile'}});
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