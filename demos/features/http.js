/**
 * k6/http
 * https://k6.io/docs/javascript-api/#k6-http
 * 
 * How to run
 * k6 run demos/features/http.js
 */
import http from 'k6/http';
import { check } from 'k6';

http.setResponseCallback(
  http.expectedStatuses(406, 500, { min: 200, max: 204 }, 302, { min: 305, max: 405 })
);

const url1 = 'https://api.k6.io/v3/account/me';
const url2 = 'https://httpbin.test.k6.io/get';
const apiToken = 'f232831bda15dd233c53b9c548732c0197619a3d3c451134d9abded7eb5bb195';
const requestHeaders = {
  'User-Agent': 'k6',
  'Authorization': 'Token ' + apiToken,
};

export default function () {
  let responses = http.batch([
    ['GET', 'https://test.k6.io', null, { tags: { ctype: 'html' } }],
    ['GET', 'https://test.k6.io/style.css', null, { tags: { ctype: 'css' } }],
    ['GET', 'https://test.k6.io/images/logo.png', null, { tags: { ctype: 'images' } }],
  ]);
  // check only first request
  check(responses[0], {
    'main page status was 200': (res) => res.status === 200,
  });

  // request objects
  const req1 = {
    method: 'GET',
    url: 'https://httpbin.test.k6.io/get',
  };
  const req2 = {
    method: 'GET',
    url: 'https://test.k6.io',
  };
  const req3 = {
    method: 'POST',
    url: 'https://httpbin.test.k6.io/post',
    body: {
      hello: 'world!',
    },
    params: {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  };
  responses = http.batch([req1, req2, req3]);
  check(responses[2], {
    'form data OK': (res) => JSON.parse(res.body)['form']['hello'] == 'world!',
  });

  // array of strings
  responses = http.batch(['http://test.k6.io', 'http://test.k6.io/pi.php']);

  check(responses[0], {
    'main page 200': (res) => res.status === 200,
  });

  check(responses[1], {
    'pi page 200': (res) => res.status === 200,
    'pi page has right content': (res) => res.body === '3.14',
  });

  // objekt 'named properties' místo array
  const requests = {
    'front page': 'https://k6.io',
    'features page': {
      method: 'GET',
      url: 'https://k6.io/features',
      params: { headers: { 'User-Agent': 'k6' } },
    },
  };
  responses = http.batch(requests);
  // when accessing results, we use the name of the request as index
  // in order to find the corresponding Response object
  check(responses['front page'], {
    'front page status was 200': (res) => res.status === 200,
  });

  // Example params
  const params = {
    cookies: { my_cookie: 'value' },
    headers: { 'X-MyHeader': 'k6test' },
    redirects: 5,
    tags: { k6test: 'yes' },
    // auth: { username: 'user', password: 'pass' },
    // timeout: 0,
    // compression: gzip, deflate, br, zstd,
    // responseType: 'text' | 'binary' | 'none'
  };
  responses = http.get('https://k6.canarytrace.com/', params);

  // http.batch() with Params
  responses = http.batch([
    { method: 'GET', url: url1, params: { headers: requestHeaders } },
    { method: 'GET', url: url2 },
  ]);

  // Digest Authentication
  // Passing username and password as part of URL plus the auth option will authenticate using HTTP Digest authentication
  responses = http.get('http://user:passwd@httpbin.test.k6.io/digest-auth/auth/user/passwd', {
    auth: 'digest',
  });
  /*
  check(responses, {
    'status is 200': (r) => r.status === 200,
    'is authenticated': (r) => r.json().authenticated === true,
    'is correct user': (r) => r.json().user === 'user',
  });
  */
}
