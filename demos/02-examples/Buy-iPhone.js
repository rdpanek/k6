/**
 * Buy iPhone HomeWork
 *
 * How to run
 * k6 run demos/02-examples/Buy-iPhone.ts
 *
 */

import { sleep } from 'k6';
import http from 'k6/http';

export const options = {
    vus: 10,
    duration: '30s',
}

export default function () {
    // http.get('https://test.k6.io')
    // sleep(1)
    http.get('https://admin.packeta.dev/')
    sleep(1)
}
