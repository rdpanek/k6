/**
 * How to run:
 * k6 run demos/01-sandbox/00-template.js
 */
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '60s',
}

export default function () {
  http.get('https://test.k6.io')
  sleep(1)
}