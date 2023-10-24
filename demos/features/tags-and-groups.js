/**
 * Custom Summary
 * https://k6.io/docs/using-k6/thresholds/
 * 
 * How to run
 * k6 run demos/features/tags-and-groups.js
 */
import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { check } from 'k6';

const myTrend = new Trend('my_trend');

export default function () {
  // Add tag to request metric data
  const res = http.get('https://httpbin.test.k6.io/', {
    tags: {
      test: "abc",
    },
  });

  // Add tag to check
  check(res, { 'status is 200': (r) => r.status === 200 }, { test: "abc" });

  // Add tag to custom metric
  myTrend.add(res.timings.connecting, { test: "abc" });
}
