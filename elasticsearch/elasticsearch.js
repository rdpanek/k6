import http from 'k6/http';
import { sleep, check, group } from 'k6';
import {
  Rate
} from 'k6/metrics';
export let options = {
  batchPerHost: 6,
  noUsageReport: true,
  stages: [{
        duration: '10m',
        target: 1
      },
  ],
};

const protocol = "http"
const server = __ENV.SERVER ? __ENV.SERVER : 'localhost'
const port = __ENV.PORT ? __ENV.PORT : 9200

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
    group('send document', function () {
      let params = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      let data = JSON.stringify({
        tester: `RDPanek_${__VU}_${__ITER}`,
        testTool: "k6.io"
      });
      let url = `${protocol}://${server}:${port}/k6/k6`;
      console.log(`VU: ${__VU}  -  ITER: ${__ITER}`);
      check(http.post(url, data, params), {
        'status is 201': r => r.status == 201,
        'successful:true': r => JSON.parse(r.body)._shards.successful == 1,
      }) || errorRate.add(1);
      sleep(1)
    })
  })
}

export function teardown() {
  console.log('tearDown')
}