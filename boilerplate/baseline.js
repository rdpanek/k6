// docker run --name k6 -i --rm -v $(pwd):/home/k6/ loadimpact/k6:0.31.1 run baseline.js --no-usage-report

import { sleep } from 'k6'

// test snippets
import {open} from './fragments/homePage.js'

// configurations
import {config} from './config/default.js'

// options
export let options = config

const baseURL = 'http://example.com/'

export function setup() {}

export function homePageScenario() {
  open(baseURL)
  sleep(1)
}