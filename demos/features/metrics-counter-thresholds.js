/**
 * Custom Summary
 * https://k6.io/docs/javascript-api/k6-metrics/counter/
 * 
 * How to run
 * k6 run demos/features/metrics-counter-thresholds.js
 */
import { Counter } from 'k6/metrics';
import { sleep } from 'k6';
import http from 'k6/http';

const allErrors = new Counter('error_counter');

export const options = {
  vus: 1,
  duration: '1m',
  thresholds: {
    'error_counter': [
      'count < 10', // 10 or fewer total errors are tolerated
    ],
    'error_counter{errorType:authError}': [
      // Threshold on a sub-metric (tagged values)
      'count <= 2', // max 2 authentication errors are tolerated
    ],
  },
};

export default function () {
  const auth_resp = http.post('https://test-api.k6.io/auth/token/login/', {
    username: 'test-user',
    password: 'supersecure',
  });
  console.log('auth_resp', auth_resp.status)

  if (auth_resp.status >= 400) {
    allErrors.add(1, { errorType: 'authError' }); // tagged value creates submetric (useful for making thresholds specific)
  }

  const other_resp = http.get('https://test-api.k6.io/public/crocodiles/1/');
  console.log('other_resp', other_resp.status)
  if (other_resp.status >= 400) {
    allErrors.add(1); // untagged value
  }

  sleep(1);
}
