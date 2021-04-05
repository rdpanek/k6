// docker run --name k6 -i --rm -v $(pwd):/home/k6/ loadimpact/k6:0.31.1 run baseline.js --no-usage-report

// test snippets
import {open} from './fragments/homePage.js'

export let options = {
  scenarios: {
    /*
    feromet: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5s', target: 500 },
        { duration: '1m', target: 1000 },
        { duration: '30s', target: 500 },
      ],
      gracefulRampDown: '0s',
      tags: { test_type: 'feromet' },
      exec: 'feromet',
    },
    */
    homepage: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1m',
      gracefulStop: '0s',
      tags: { test_type: 'homepage' },
      exec: 'homePageScenario',
    },
  },
  batchPerHost: 6,
  thresholds: { 
    http_req_connecting: ['p(90) > 3000'],
    http_req_waiting: ['p(90) > 1000']
  },
  //discardResponseBodies: true,
  //duration: '3m', // without WM
  //iterations: 10,
  //httpDebug: 'full',
  //noConnectionReuse: true,
  //rps: 500,
};

const baseURL = 'https://canarytrace.com/'

export function setup() {}

export function homePageScenario() {
  open(baseURL)
}