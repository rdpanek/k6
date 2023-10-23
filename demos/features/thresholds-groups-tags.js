/**
 * Custom Summary
 * https://k6.io/docs/javascript-api/k6-metrics/trend/
 * 
 * How to run
 * k6 run demos/features/thresholds-groups-tags.js
 */
import http from 'k6/http';
import { group, sleep } from 'k6';

export const options = {
  thresholds: {
    // focus on groups
    'group_duration{group:::individualRequests}': ['avg < 400'],
    'group_duration{group:::batchRequests}': ['avg < 200'],

    // focus on tags
    'http_req_duration{type:API}': ['p(95)<500'], // threshold on API requests only
    'http_req_duration{type:staticContent}': [
      {
        threshold: 'p(95)<100',
        abortOnFail: true, // zastavit test při překročení thresholdu
        delayAbortEval: '10s', // pozdržet abort o 10s při překročení thresholdu
      }
    ], // threshold on static content only
  },
  vus: 1,
  duration: '10s',
};

export default function () {
  group('individualRequests', function () {
    http.get('https://test-api.k6.io/public/crocodiles/1/');
    http.get('https://test-api.k6.io/public/crocodiles/2/');
    http.get('https://test-api.k6.io/public/crocodiles/3/');
  });

  group('batchRequests', function () {
    // Batch multiple HTTP requests together to issue them in parallel over multiple TCP connections.
    http.batch([
      ['GET', `https://test-api.k6.io/public/crocodiles/1/`],
      ['GET', `https://test-api.k6.io/public/crocodiles/2/`],
      ['GET', `https://test-api.k6.io/public/crocodiles/3/`],
    ]);
  });

  group('tags example', function () {
    const res1 = http.get('https://test-api.k6.io/public/crocodiles/1/', {
      tags: { type: 'API' },
    });
    const res2 = http.get('https://test-api.k6.io/public/crocodiles/2/', {
      tags: { type: 'API' },
    });

    const responses = http.batch([
      ['GET', 'https://test-api.k6.io/static/favicon.ico', null, { tags: { type: 'staticContent' } }],
      ['GET', 'https://test-api.k6.io/static/css/site.css', null, { tags: { type: 'staticContent' } }],
    ]);
  });

  sleep(1);
}
