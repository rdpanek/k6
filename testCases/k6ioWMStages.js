// docker run --name k6 -i --rm loadimpact/k6 run - < testCases/k6ioWMStages.js

import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m30s', target: 10 },
    { duration: '20s', target: 0 },
  ],
};

export default function () {
  let res = http.get('https://www.ifortuna.cz/');
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
