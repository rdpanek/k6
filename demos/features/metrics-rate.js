/**
 * Custom Summary
 * https://k6.io/docs/javascript-api/k6-metrics/rate/
 * 
 * How to run
 * k6 run demos/features/metrics-rate.js
 */
import { Rate } from 'k6/metrics';

const myRate = new Rate('my_rate');

export default function () {
  myRate.add(true);
  myRate.add(false);
  myRate.add(1);
  myRate.add(0, { tag1: 'value', tag2: 'value2' });
}
