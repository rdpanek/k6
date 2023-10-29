/**
 * SharedArray
 * https://k6.io/docs/javascript-api/k6-data/sharedarray/
 * 
 * How to run
 * k6 run demos/features/sharedArray.js
 */
import { SharedArray } from 'k6/data';
import http from 'k6/http';

const data = new SharedArray('example_data', function () {
  // All heavy work (opening and processing big files for example) should be done inside here.
  // This way it will happen only once and the result will be shared between all VUs, saving time and memory.
  const f = JSON.parse(open('./example_data.json'));
  return f; // f must be an array
});

export let options = {
  scenarios: {
    scenario1: {
      executor: 'constant-arrival-rate',
      rate: 10,
      timeUnit: '1m',
      duration: '2m',
      preAllocatedVUs: 10,
      maxVUs: 10,
      exec: 'scenario1',
    },
    scenario2: {
      executor: 'constant-arrival-rate',
      rate: 5,
      timeUnit: '1m',
      duration: '2m',
      preAllocatedVUs: 5,
      maxVUs: 5,
      exec: 'scenario2',
    },
  },
};

export function scenario1() {
  const element = data[Math.floor(Math.random() * data.length)];
  console.log(`Scenario 1: ${JSON.stringify(element)}`);
  http.get(`https://test.k6.io/pi.php?decimals=${element.id}`);
}

export function scenario2() {
  const element = data[Math.floor(Math.random() * data.length)];
  console.log(`Scenario 2: ${JSON.stringify(element)}`);
  http.get(`https://test.k6.io/pi.php?decimals=${element.id}`);
}
