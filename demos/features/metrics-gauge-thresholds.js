/**
 * Custom Summary
 * https://k6.io/docs/javascript-api/k6-metrics/counter/
 * 
 * How to run
 * k6 run demos/features/metrics-gauge-thresholds.js
 */
import http from 'k6/http';
import { sleep } from 'k6';
import { Gauge } from 'k6/metrics';

const GaugeContentSize = new Gauge('ContentSize');

function generateRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const min = 1;
const max = 100;

export const options = {
  vus: 1,
  duration: '1m',
  thresholds: {
    ContentSize: ['value<4000'],
  },
};

export default function () {
  const res = http.get('https://test-api.k6.io/public/crocodiles/1/');

  const randomNum = generateRandom(min, max);
  GaugeContentSize.add(res.body.length+randomNum);
  sleep(1);
}
