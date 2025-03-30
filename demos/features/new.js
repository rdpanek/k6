/**
 * Generate a new script using the k6 CLI.
 * k6 new demos/features/new.js
 * 
 * How to run:
 * k6 run demos/features/new.js
 */

import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function() {
  let res = http.get('https://quickpizza.grafana.com');
  check(res, { "status is 200": (res) => res.status === 200 });
  sleep(1);
}
