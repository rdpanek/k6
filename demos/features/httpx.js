/**
 * httpx
 * https://k6.io/docs/javascript-api/jslib/httpx/
 * 
 * How to run
 * k6 run demos/features/httpx.js
 */

import { fail } from 'k6';
import { Httpx } from 'https://jslib.k6.io/httpx/0.1.0/index.js';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const USERNAME = `user${randomIntBetween(1, 100000)}@example.com`; // random email address
const PASSWORD = 'superCroc2021';

const session = new Httpx({
  baseURL: 'https://test-api.k6.io',
  headers: {
    'User-Agent': 'My custom user agent',
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  timeout: 20000, // 20s timeout.
});

export default function testSuite() {
  // url
  const registrationResp = session.post(`/user/register/`, {
    // body
    first_name: 'Crocodile',
    last_name: 'Owner',
    username: USERNAME,
    password: PASSWORD,
  });

  if (registrationResp.status !== 201) {
    fail('registration failed');
  }

  const loginResp = session.post(`/auth/token/login/`, {
    username: USERNAME,
    password: PASSWORD,
  });

  if (loginResp.status !== 200) {
    fail('Authentication failed');
  }

  const authToken = loginResp.json('access');

  // set the authorization header on the session for the subsequent requests.
  session.addHeader('Authorization', `Bearer ${authToken}`);

  const payload = {
    name: `Croc Name`,
    sex: 'M',
    date_of_birth: '2019-01-01',
  };

  // this request uses the Authorization header set above.
  const respCreateCrocodile = session.post(`/my/crocodiles/`, payload);

  if (respCreateCrocodile.status !== 201) {
    fail('Crocodile creation failed');
  } else {
    console.log('New crocodile created');
  }
}
