/**
 * How to run
 * - k6 run tc-web-service.js
 * - docker run --rm -i grafana/k6 run - <tc-web-service.js
 */

import http from 'k6/http';
import { sleep } from 'k6';

export default function () {
  http.get('https://test.k6.io');
  sleep(1);
}