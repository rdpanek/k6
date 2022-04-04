import http from 'k6/http';
import { check } from 'k6';


const open = function(baseURL) {
  let response = http.get(baseURL);

  check(response, {
    'check: is status 200': (r) => r.status === 200,
  })
}

module.exports = {
  open
}