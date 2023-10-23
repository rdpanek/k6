/**
 * Custom Summary
 * https://k6.io/docs/using-k6/thresholds/
 * 
 * How to run
 * k6 run demos/features/thresholds.js
 */
import http from 'k6/http';
import { Trend, Rate, Counter, Gauge } from 'k6/metrics';
import { sleep } from 'k6';

export const TrendRTT = new Trend('RTT');
export const RateContentOK = new Rate('Content_OK'); // underscore is required
export const GaugeContentSize = new Gauge('ContentSize');
export const CounterErrors = new Counter('Errors');

export const options = {
  thresholds: {
    // short format
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    http_req_duration: ['p(95)<2'], // 95% of requests should be below 200ms
    // long format
    http_req_duration: [
      {
        threshold: "p(95)<200", // THRESHOLD_EXPRESSION
        abortOnFail: true, // boolean
        delayAbortEval: "10s", // string
      },
    ],
    // Count: Incorrect content cannot be returned more than 99 times.
    'Errors': ['count<100'],
    // Gauge: returned content must be smaller than 4000 bytes
    'ContentSize': ['value<4000'],
    // Rate: content must be OK more than 95 times
    'Content_OK': ['rate>0.95'], // underscore is required
    // Trend: Percentiles, averages, medians, and minimums
    // must be within specified milliseconds.
    // multiple thresholds for one metric
    'RTT': ['p(99)<300', 'p(70)<250', 'avg<200', 'med<150', 'min<100'],
  },
};

export default function () {
  const res = http.get('https://test-api.k6.io/public/crocodiles/1/');

  const contentOK = res.json('name') === 'Bert';

  TrendRTT.add(res.timings.duration);
  RateContentOK.add(contentOK);
  GaugeContentSize.add(res.body.length);
  CounterErrors.add(!contentOK);

  sleep(1);
}
