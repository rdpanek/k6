/**
 * Custom Summary
 * https://k6.io/docs/javascript-api/k6-metrics/trend/
 * 
 * How to run
 * k6 run demos/features/metrics-trend-thresholds.js
 */
import { Trend } from 'k6/metrics';
import { sleep } from 'k6';
import http from 'k6/http';

const serverWaitingTimeOnLogin = new Trend('serverWaitingTimeOnLogin', true);

export const options = {
  vus: 1,
  duration: '1m',
  thresholds: {
    serverWaitingTimeOnLogin: ['p(95) < 200'], // 95% of requests must finish below 200ms
  },
};

export default function () {
  const resp = http.post('https://test-api.k6.io/auth/token/login/', {
    username: 'test-user',
    password: 'supersecure',
  });

  serverWaitingTimeOnLogin.add(resp.timings.waiting);
  sleep(1);
}