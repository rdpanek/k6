import { sleep } from 'k6'
import configuration from './config/default.js'
const credentials = { user: __ENV.USER, pass: __ENV.PASS,}
const config = configuration(credentials, __ENV.ENVIRONMENT, __ENV.TRACE_ID)

// snippets
import {openHomepage} from './fragments/homePage.js'

export let options = {
  scenarios: {
    homePageScenario: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '10s', target: 4 }
      ],
      gracefulRampDown: '0s',
      tags: { scenario: 'homePage' },
      exec: 'homePageScenario',
    }
  },
  //batchPerHost: 6,
  thresholds: { 
    http_req_failed: ['rate<10'],
    http_req_duration: ['p(90)<3000'], // 90% of requests should be below 400ms
    'group_duration{group:::open}': ['p(95)<3000'], // 95% of login transactions should be below 2s
    'checks{validation:open}': ['rate>0.95']
  }
}

export function setup() {}

export function homePageScenario() {
  openHomepage(config)

  sleep(Math.random() * 10)
}