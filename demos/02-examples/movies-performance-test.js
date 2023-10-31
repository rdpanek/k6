/**
 * Marvel Movies Home Work
 * 
 * How to run
 * k6 run demos/02-examples/movies-performance-test.js
 * 
 * INDEX=movie2 k6 run demos/02-examples/movies-performance-test.js
 * 
 */
import { sleep } from 'k6';
const credentials = {
  user: __ENV.USER ? __ENV.USER : 'defaultUser',
  pass: __ENV.PASS ? __ENV.PASS : 'defaultPass',
};
// fragments
import {deleteIndex, saveMovies, existMovies} from './fragments/elasticsearch.js'
import {moviesData} from './fragments/movies-data.js'

const config = {
  elasticsearch: {
    index: __ENV.INDEX ? __ENV.INDEX : 'movies',
    host: __ENV.HOST ? __ENV.HOST : 'http://localhost:9200',
  },
}

export function setup() {
  console.log('Config', config)
  deleteIndex(config)
}


export default function () {
  saveMovies(config, moviesData)

  sleep(5)
  existMovies(config, '4')
}