/**
 * Basic example
 * https://k6.io/docs/get-started/running-k6/
 * 
 * How to run
 * - k6 run 01-web-service-basics.js
 * - docker run --rm -i grafana/k6 run - <01-web-service-basics.js
 * 
 * Add more time and VUs
 * - k6 run --vus 10 --duration 30s 01-web-service-basics.js
 */

import http from 'k6/http';
import { sleep } from 'k6';

/**
 * - every test has init context
 * - is it place for options/settings of the test (like duration)
 * - init code is run only once during test
 * - CLI commands has always preberence before settings in the init context
 */
export const options = {
  vus: 10,
  duration: '30s',
}

/**
 * - default function is entry point for VUs
 * - default code is executed many times according to the settings of the test
 */
export default function () {
  http.get('https://test.k6.io')
  sleep(1)
}