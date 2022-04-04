import { sleep } from 'k6'

// configurations
import {config} from './config/default.js'

// options
export let options = config

// test snippets
import {open} from './fragments/homePage.js'

const baseURL = 'http://example.com/'

export function setup() {}

export function homePageScenario() {
  open(baseURL)
  sleep(1)
}