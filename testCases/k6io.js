// docker run --name k6 -i --rm loadimpact/k6 run - < testCases/k6io.js --vus 10 --duration 30s

import http from 'k6/http';
import { sleep } from 'k6';

export default function () {
  http.get('http://test.k6.io');
  sleep(1);
}
