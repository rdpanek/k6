/**
 * webcrypto
 * https://k6.io/docs/javascript-api/k6-experimental/webcrypto/
 * 
 * How to run
 * k6 run demos/features/webcrypto.js
 */
import { crypto } from "k6/experimental/webcrypto";

export default function () {
  const array = new Uint32Array(10);
  crypto.getRandomValues(array);
  
  for (const num of array) {
    console.log(num);
  }

  const myUUID = crypto.randomUUID();
  console.log(myUUID);
}
