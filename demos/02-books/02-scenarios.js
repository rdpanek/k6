/**
 * Advanced test for books API
 * - books/server.js must be running before running this test
 * - go to books folder
 * - install dependencies: npm install
 * - run server: node server.js
 * 
 * How to run only default function
 * - k6 run -i 1 demos/02-books/02-advanced.js --env TAG="production"  
 * 
 * How to run with scenarios
 * - k6 run demos/02-books/02-advanced.js --env TAG="production"
 * 
 * How to check database
 * - sqlite3 books/database.db "SELECT * FROM books;"
 */

import http from 'k6/http';
import { sleep, check } from 'k6';

let response

export let options = {
  tags: {
    source: __ENV.TAG,
    tc: '1234'
  },
  scenarios: {
    classicBooks: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '1m', target: 5 },
        { duration: '1m', target: 10 }
      ],
      gracefulRampDown: '0s',
      tags: { scenario: 'classicBooks' },
      exec: 'classicBooks',
    },
    ebook: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '1m', target: 20 }
      ],
      gracefulRampDown: '0s',
      tags: { scenario: 'ebook' },
      exec: 'ebook',
    }
  }
};

export function setup() {
  // Inicializace databáze pomocí API
  response = http.post('http://localhost:3000/book', JSON.stringify({ 
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

  response = http.post('http://localhost:3000/book', JSON.stringify({
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
  classicBooks(data);
  ebook(data);
}

export function classicBooks(data) {
  response = http.get('http://localhost:3000/books/běžná kniha');
  check(response, {
    'Get books status code is 200': (r) => r.status === 200
  });
  
  response = http.put('http://localhost:3000/book/1', JSON.stringify({ 
      type: 'běžná kniha', 
      title: 'Upravená Běžná Kniha', 
      author: 'Upravený Autor 1' 
    }), { 
      headers: { 
        'Content-Type': 'application/json' 
      } 
    });
  check(response, {
    'Update book status code is 200': (r) => r.status === 200
  });


  response = http.del('http://localhost:3000/book/1');
  check(response, {
    'Delete book status code is 200': (r) => r.status === 200
  });

  // Random sleep to simulate user think time (1-5 seconds)
  sleep(Math.random() * 4 + 1);
}

export function ebook(data) {
  response = http.get('http://localhost:3000/books/e-kniha');
  check(response, {
    'Get ebook status code is 200': (r) => r.status === 200
  });

  response = http.put('http://localhost:3000/book/2', JSON.stringify({ 
    type: 'e-kniha', 
    title: 'Upravená E-Kniha',
    author: 'Upravený Autor 2'
  }), { 
    headers: { 
      'Content-Type': 'application/json' 
    } });
  check(response, {
    'Update ebook status code is 200': (r) => r.status === 200
  });

  response = http.del('http://localhost:3000/book/2');
  check(response, {
    'Delete ebook status code is 200': (r) => r.status === 200
  });

  // Random sleep to simulate user think time (1-5 seconds)
  sleep(Math.random() * 4 + 1);
}