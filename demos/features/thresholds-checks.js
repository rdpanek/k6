/**
 * Custom Summary
 * https://k6.io/docs/using-k6/thresholds/
 * 
 * How to run
 * k6 run demos/features/thresholds-checks.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '10s',
  thresholds: {
    // the rate of successful checks should be higher than 90%
    checks: ['rate>0.9'],
    // with tags
    'checks{statusCode:200}': ['rate>0.9'],
  },
};

// we use let, not const, to allow reassigning the variable during iterations
let res = null;

export default function () {
  res = http.get('https://httpbin.test.k6.io');
  check(res, {
    'status is 500': (r) => r.status == 500,
  });

  res = http.get('https://httpbin.test.k6.io');
  check(res,{
    'status is 200': (r) => r.status == 200,
  },{ statusCode: '200' });

  sleep(1);
}
