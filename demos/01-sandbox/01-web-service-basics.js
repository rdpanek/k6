/**
 * Basic example
 * https://k6.io/docs/get-started/running-k6/
 * 
 * How to run
 * - k6 run demos/01-sandbox/01-web-service-basics.js
 * 
 * How to run with more VUs and duration
 * - k6 run --vus 10 --duration 30s demos/01-sandbox/01-web-service-basics.js
 * 
 * How to run with Docker
 * - docker run --rm -i grafana/k6 run - <demos/01-sandbox/01-web-service-basics.js
 */

import http from 'k6/http';
import { sleep } from 'k6';

/**
 * - every test has init context.
 * - init code is run only once for every VU.
 * - is it place for options/settings of the test (like duration), variables init,  configuration third party libraries etc.
 * - CLI commands has always preberence before settings in the init context.
 * 
 * - A "VU" is a virtual user, simulating a real user interacting with your system. Each VU is executed in its own JavaScript runtime to mimic the real-world scenario where every user operates through an individual browser. Consequently, each VU maintains its own context, with variables and states not shared between VUs.
 * 
 * - In real-world scenarios, you would set options through the interface rather than using CLI commands. Uncomment the options variable.
 */
/*
export const options = {
  vus: 10,
  duration: '30s',
}
*/

/**
 * - In real-world scenarios, you would set stages know as "ramp-up" and "ramp-down". Uncomment the stages variable.
 */
/*
export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m30s', target: 10 },
    { duration: '20s', target: 0 },
  ],
};
*/

/**
 * - default function is entry point for VUs
 * - default code is executed many times according to the settings of the test
 * - is it place for the main logic of the test such as HTTP requests, data processing, assertions, etc.
 */
export default function () {
  http.get('https://test.k6.io')
  sleep(1)
}