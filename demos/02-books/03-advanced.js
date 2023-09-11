/**
 * Advanced test for books API
 * - books/server.js must be running before running this test
 * - go to books folder
 * - install dependencies: npm install
 * - run server: node server.js
 * 
 * How to run only default function
 * - k6 run -i 1 demos/02-books/03-advanced.js --env TAG="production" --env DOMAIN="http://localhost:3000"
 * 
 * How to run with scenarios
 * - k6 run demos/02-books/03-advanced.js --env TAG="production" --env DOMAIN="http://localhost:3000"
 * 
 * How to check database
 * - sqlite3 books/database.db "SELECT * FROM books;"
 */

import http from 'k6/http';
import { sleep, check } from 'k6';

// fragments
import { classicBooks, ebooks } from './fragments/books.js'

let response
let config = {
  domain: __ENV.DOMAIN,
  traceId: '1234'
}

export let options = {
  tags: {
    source: __ENV.TAG,
    tc: '1234'
  },
  scenarios: {
    classicBooksScenario: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '1m', target: 5 },
        { duration: '1m', target: 10 }
      ],
      gracefulRampDown: '0s',
      tags: { scenario: 'classicBooks' },
      exec: 'classicBooksScenario',
    },
    ebookScenario: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '1m', target: 20 }
      ],
      gracefulRampDown: '0s',
      tags: { scenario: 'ebook' },
      exec: 'ebookScenario',
    }
  },
  thresholds: { 
    http_req_failed: ['rate<10'],
    http_req_duration: ['p(90)<3000'], // 90% of requests should be below 3000ms
    'group_duration{group:::Check classic books api}': ['p(95)<1000'],
    'group_duration{group:::Check ebooks api}': ['p(95)<1000'], 
    'classicBookLoaded_time': ['p(95) < 1000'], // 95th percentile should be below 1000ms
    'eBookLoaded_time': ['p(95) < 1000'], // 95th percentile should be below 1000ms
    'classicBookExist': ['rate>0.95'], // success rate should be higher than 95%
    'eBookExist': ['rate>0.95'], // success rate should be higher than 95%
  }
};

export function setup() {
  // Inicializace databáze pomocí API
  response = http.post(config.domain+'/book', JSON.stringify({ 
    type: 'běžná kniha', 
    title: 'Testovací Běžná Kniha', 
    author: 'Autor 1' 
  }), { 
    headers: { 
      'Content-Type': 'application/json' 
    } 
  });
  check(response, {
    'Create book status code is 201': (r) => r.status === 201
  });

  response = http.post(config.domain+'/book', JSON.stringify({
    type: 'e-kniha', 
    title: 'Testovací E-Kniha', 
    author: 'Autor 2' 
  }), { 
    headers: { 
      'Content-Type': 'application/json' 
    }
  });
  check(response, {
    'Create ebook status code is 201': (r) => r.status === 201
  });
}

export default function (data) {
  classicBooksScenario(data);
  ebookScenario(data);
}

export function classicBooksScenario(data) {
  classicBooks(config, data);

  // Random sleep to simulate user think time (1-5 seconds)
  sleep(Math.random() * 4 + 1);
}

export function ebookScenario(data) {
  ebooks(config, data);

  // Random sleep to simulate user think time (1-5 seconds)
  sleep(Math.random() * 4 + 1);
}

export function teardown() {
    response = http.del(config.domain+'/book/2');
    check(response, {
      'Delete ebook status code is 200': (r) => r.status === 200
    });

    response = http.del(config.domain+'/book/1');
    check(response, {
      'Delete book status code is 200': (r) => r.status === 200
    });
}