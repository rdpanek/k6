/**
 * Custom Summary
 * https://k6.io/docs/results-output/end-of-test/custom-summary/
 * 
 * How to run
 * k6 run demos/features/custom-summary.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import {textSummary} from 'https://jslib.k6.io/k6-summary/0.0.4/index.js';

export default function () {
  let res = http.get('https://test.k6.io')
  check(res, {
    'is status 200': (r) => r.status === 200,
  })
  sleep(1)
}

export function handleSummary(data) {
  const med_latency = data.metrics.iteration_duration.values.med;
  const latency_message = `The median latency was ${med_latency}\n`;

  delete data.metrics['http_req_duration{expected_response:true}'];

  for (const key in data.metrics) {
    if (key.startsWith('iteration')) delete data.metrics[key];
    console.log('key', key)
  }

  return {
    'stdout': textSummary(data, { indent: '→', enableColors: true }),
    'stdout': latency_message,
    'summary.json': JSON.stringify(data),
  }
}