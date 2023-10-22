/**
 * Custom Summary
 * https://k6.io/docs/javascript-api/k6-metrics/trend/
 * 
 * How to run
 * k6 run demos/features/metrics-trend.js
 */
import { Trend } from 'k6/metrics';

const myTrend = new Trend('my_trend');

export default function () {
  myTrend.add(1);
  myTrend.add(2, { tag1: 'value', tag2: 'value2' });
}