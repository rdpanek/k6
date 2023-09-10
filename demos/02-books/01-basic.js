/**
 * Basic test for books API
 * - books/server.js must be running before running this test
 * - go to books folder
 * - install dependencies: npm install
 * - run server: node server.js
 * 
 * How to run
 * - k6 run demos/02-books/01-basic.js
 * 
 * How to check database
 * - sqlite3 books/database.db "SELECT * FROM books;"
 */

import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
    vus: 1,
    iterations: 2,
};

export function setup() {
    // Inicializace databáze pomocí API
    http.post('http://localhost:3000/book', JSON.stringify({ type: 'běžná kniha', title: 'Testovací Běžná Kniha', author: 'Autor 1' }), { headers: { 'Content-Type': 'application/json' } });
    http.post('http://localhost:3000/book', JSON.stringify({ type: 'e-kniha', title: 'Testovací E-Kniha', author: 'Autor 2' }), { headers: { 'Content-Type': 'application/json' } });
}

export default function () {
    // Scénář 1: Testování API pro běžné knihy
    if (__ITER == 0) {
        http.get('http://localhost:3000/books/běžná kniha');
        http.put('http://localhost:3000/book/1', JSON.stringify({ type: 'běžná kniha', title: 'Upravená Běžná Kniha', author: 'Upravený Autor 1' }), { headers: { 'Content-Type': 'application/json' } });
        http.del('http://localhost:3000/book/1');
    }

    // Scénář 2: Testování API pro e-knihy
    if (__ITER == 1) {
        http.get('http://localhost:3000/books/e-kniha');
        http.put('http://localhost:3000/book/2', JSON.stringify({ type: 'e-kniha', title: 'Upravená E-Kniha', author: 'Upravený Autor 2' }), { headers: { 'Content-Type': 'application/json' } });
        http.del('http://localhost:3000/book/2');
    }

    sleep(1);
}
