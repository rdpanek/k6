/**
 * Custom Summary
 * https://k6.io/docs/javascript-api/k6-metrics/counter/
 * 
 * How to run
 * k6 run demos/features/metrics-gauge.js
 */
import { Gauge } from 'k6/metrics';

const myGauge = new Gauge('my_gauge');

export default function () {
  myGauge.add(3);
  myGauge.add(1);
  myGauge.add(2, { tag1: 'value', tag2: 'value2' });
}
