/**
 * Custom Summary
 * https://k6.io/docs/using-k6/thresholds/
 * 
 * How to run
 * k6 run demos/features/tags-and-groups.js
 */

// Modul execution poskytuje přístup k informacím o běhu testu, jako jsou například časové údaje, výsledky testů a další.
import exec from 'k6/execution';

import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { check, group } from 'k6';
import { tagWithCurrentStageIndex } from 'https://jslib.k6.io/k6-utils/1.3.0/index.js';

const myTrend = new Trend('my_trend');

export const options = {
  tags: { // available acros all metrics
    type: 'smoke',
    tc: '3487'
  },
  thresholds: {
    'http_reqs{containerGroup:main}': ['count==3'], // for code defined tags
    'http_req_duration{containerGroup:main}': ['max<1000'], // for code defined tags
  },
  stages: [
    { target: 1, duration: '5s' }, // tagWithCurrentStageIndex(); will add tag stage:0
    { target: 5, duration: '5s' }, // tagWithCurrentStageIndex(); will add tag stage:1
    { target: 5, duration: '5s' }, // tagWithCurrentStageIndex(); will add tag stage:2
    { target: 5, duration: '5s' }, // tagWithCurrentStageIndex(); will add tag stage:3
    { target: 5, duration: '5s' }, // tagWithCurrentStageIndex(); will add tag stage:4
  ],
};

let res

export default function () {

  // Stage tags
  tagWithCurrentStageIndex();

  // Add tag to request metric data
  res = http.get('https://httpbin.test.k6.io/', {
    tags: {
      test: "abc",
    },
  });

  // Add tag to check
  check(res, { 'status is 200': (r) => r.status === 200 }, { test: "abc" });

  // Add tag to custom metric
  myTrend.add(res.timings.connecting, { test: "abc" });

  // Code defined tags
  exec.vu.metrics.tags.containerGroup = 'main';
  group('main', function () {
    res = http.get('https://test.k6.io');
    check(res, { 'status is 200': (r) => r.status === 200 });
    group('sub', function () {
      res = http.get('https://httpbin.test.k6.io/anything');
      check(res, { 'status is 200': (r) => r.status === 200 });
    });
    res = http.get('https://test-api.k6.io');
    check(res, { 'status is 200': (r) => r.status === 200 });
  });
  console.log(exec.vu.metrics.tags)
  delete exec.vu.metrics.tags.containerGroup;

}
