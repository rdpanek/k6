// docker run --name k6 -i --rm loadimpact/k6 run - < testCases/ftn-cz-desktop.js --no-usage-report

import http from 'k6/http';
import { check, sleep, fail, group } from 'k6';
import { Counter, Rate } from 'k6/metrics';
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.0.0/index.js";

let myCounter = new Counter('my_counter');
let pageNotFound = new Rate('pageNotFound');
let maxLoad = new Rate('maxLoad');
let serverUrl = 'https://www.XYZ.cz/'

export let options = {
  stages: [
    { duration: '10s', target: 20 },
    //{ duration: '10s', target: 10 },
    //{ duration: '5s', target: 0 },
  ],
  thresholds: { 
    'my_counter': [
      "count<150" // must be lower otherwise it will not pass
    ],
    'pageNotFound': [
      { threshold: 'rate < 0.1', abortOnFail: true, delayAbortEval: '1m' }
    ],
    'maxLoad': [
      { threshold: 'rate < 0.1', abortOnFail: true, delayAbortEval: '1m' }
    ],
    http_req_connecting: ['p(90) > 10'],
    http_req_waiting: ['p(90) > 10']
  },
  //discardResponseBodies: true,
  //duration: '3m', // without WM
  //iterations: 10,
  //httpDebug: 'full',
  //noConnectionReuse: true,
  //rps: 500,
};

export function setup() {
  // 2. setup code

  //let res = http.get('https://httpbin.org/get');
  //return { data: res.json() };
  return { v: 1 };

  // skip this fn via params --no-setup --no-teardown
}

let i = 0
export default function (data) {

  group('demo step', function () {

    let res = http.get(serverUrl);
    check(res, { 'status was 200': (r) => r.status == 200 });
    maxLoad.add(res.timings.duration > 500)

    /*
    if (res.timings.duration > 2000) {
      fail(`Error, duration for ${res.request.url} request is ${res.timings.duration}`);
    }
    */

    let resp = http.get(`${serverUrl}/neexistuje`);
    pageNotFound.add(resp.status >= 400);
    
    myCounter.add(++i, { tag1: 'myValue', tag2: 'myValue2' });
    //console.log('Response time was ' + String(res.timings.duration) + ' ms');

    //console.log(JSON.stringify(data)); // data from setup

    //sleep(1);
    //sleep(Math.random() * 30)
    //sleep(randomIntBetween(20, 30));
  });
}


export function teardown(data) {
  // 4. teardown code
}