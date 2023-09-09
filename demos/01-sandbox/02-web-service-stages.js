/**
 * Basic example
 * https://k6.io/docs/get-started/running-k6/
 * 
 * How to run
 * - k6 run demos/01-sandbox/02-web-service-stages.js
 * - docker run --rm -i grafana/k6 run - <demos/01-sandbox/02-web-service-stages.js
 */

import http from 'k6/http';
import { sleep } from 'k6';

/**
 * - every test has init context
 */
export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m30s', target: 10 },
    { duration: '20s', target: 0 },
  ],
}

export default function () {
  http.get('https://test.k6.io')
  sleep(1)
}