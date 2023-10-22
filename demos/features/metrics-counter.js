/**
 * Custom Summary
 * https://k6.io/docs/javascript-api/k6-metrics/counter/
 * 
 * How to run
 * k6 run demos/features/metrics-counter.js
 */
import http from 'k6/http';
import { Counter } from 'k6/metrics';

const iterations = new Counter('custom_iterations');
const CounterErrors = new Counter('Errors');

export const options = { thresholds: { Errors: ['count<100'] } };

export default function () {
  //iterations.add(1);
  iterations.add(2, { tag1: 'demoTest', tag2: 'k6' });

  const res = http.get('https://test-api.k6.io/public/crocodiles/1/');
  const contentOK = res.json('name') === 'Bert';
  CounterErrors.add(!contentOK);
}