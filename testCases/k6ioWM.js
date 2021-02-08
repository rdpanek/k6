// docker run --name k6 -i --rm loadimpact/k6 run - < testCases/k6ioWM.js

import http from 'k6/http';
import { sleep } from 'k6';
export let options = {
  vus: 10,
  duration: '30s',
};
export default function () {
  http.get('http://test.k6.io');
  sleep(1);
}
