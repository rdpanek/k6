import http from 'k6/http';
import { sleep, check, group } from 'k6';
export let options = {
  vus: 1,
  //duration: '60s',
  batchPerHost: 6,
  noUsageReport: true,
  stages: [{
      duration: '5s',
      target: 10
    }
  ],
};

const protocol = "http"
const server = "169.254.23.210"
const port = 9200

// defaultRequest
export function setup() {
  console.log('setUp')
}

export default function() {
  group('Elasticsearch collection', function(){
    group('is elastic up', function(){
      let res = http.get(`${protocol}://${server}:${port}/`);
      console.log(`VU: ${__VU}  -  ITER: ${__ITER}`);
      check(res, {
        'status was 200': r => r.status == 200,
        'exist: You Know, for Search': r => JSON.parse(res.body).tagline == "You Know, for Search",
      });
    })
  })
}

export function teardown() {
  console.log('tearDown')
}