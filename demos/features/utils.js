/**
 * Utils
 * https://k6.io/docs/javascript-api/jslib/utils/
 * 
 * How to run
 * k6 run demos/features/utils.js
 * 
 */
import { sleep } from 'k6';
import http from 'k6/http';

import {
  randomIntBetween,
  randomString,
  randomItem,
  uuidv4,
  findBetween,
} from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export default function () {

  const body = {
    first_name: randomItem(['Joe', 'Jane']), // random name
    last_name: `Jon${randomString(1, 'aeiou')}s`, //random character from given list
    username: `user_${randomString(10)}@example.com`, // random email address,
    password: uuidv4(), // random password in form of uuid
  }
  const res = http.post(`https://test-api.k6.io/user/register/`, body);

  // find a string between two strings to grab the username:
  const username = findBetween(res.body, '"username":"', '"');
  console.log('req body: ' + JSON.stringify(body));
  console.log('username from response: ' + username);

  // random item
  const names = ['John', 'Jane', 'Bert', 'Ed'];
  console.log(`Hello, my name is ${randomItem(names)}`);

  // vygeneruje jméno
  const randomFirstName = randomString(8);
  console.log(`2 Hello, my first name is ${randomFirstName}`);

  // vygeneruje jméno z daného seznamu znaků
  const randomLastName = randomString(10, `aeioubcdfghijpqrstuv`);
  console.log(`2 Hello, my last name is ${randomLastName}`);

  // vybere náhodný znak, míra se určuje počtem opakování
  const randomCharacterWeighted = randomString(1, `AAAABBBCCD`);
  console.log(`2 Chose a random character ${randomCharacterWeighted}`);

  // uuid v4 vrátí náhodný řetězec pomocí běžného generátoru náhodných čísel
  let startUuid4 = Date.now();
  console.log(uuidv4());
  let stopUuid4 = Date.now();

  // uuid v4 with secure s využitím kryptograficky bezpečného generátoru náhodných čísel
  // může být pomalejší
  let startUuid4Secure = Date.now();
  console.log(uuidv4(true));
  let stopUuid4Secure = Date.now();
  console.log(`uuidv4: ${stopUuid4 - startUuid4} ms`);
  console.log(`uuidv4 secure: ${stopUuid4Secure - startUuid4Secure} ms`);

  const response = '<div class="message">Message 1</div><div class="message">Message 2</div>';
  const message = findBetween(response, '<div class="message">', '</div>');
  console.log(message); // Message 1

  const allMessages = findBetween(response, '<div class="message">', '</div>', true);
  console.log(allMessages.length); // 2

  sleep(randomIntBetween(1, 5)); // sleep between 1 and 5 seconds.
}
