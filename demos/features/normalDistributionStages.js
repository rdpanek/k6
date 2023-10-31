/**
 * normalDistributionStages
 * https://k6.io/docs/javascript-api/jslib/utils/normaldistributionstages/
 * 
 * How to run
 * k6 run demos/features/normalDistributionStages.js
 * 
 */
import { sleep } from 'k6';
import exec from 'k6/execution';
import { normalDistributionStages } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  // maxVus, durationSeconds, numberOfStages
  stages: normalDistributionStages(10, 20, 5),

  /**
   * 
  [
    {
      "duration": "4s",
      "target": 1
    },
    {
      "duration": "3s",
      "target": 5
    },
    {
      "duration": "3s",
      "target": 10
    },
    {
      "duration": "3s",
      "target": 10
    },
    {
      "duration": "3s",
      "target": 5
    },
    {
      "duration": "3s",
      "target": 1
    },
    {
      "duration": "4s",
      "target": 0
    }
  ]
   */

  /**
   *   scenarios: (100.00%) 1 scenario, 10 max VUs, 53s max duration (incl. graceful stop):
           * default: Up to 10 looping VUs for 23s over 7 stages (gracefulRampDown: 30s, gracefulStop: 30s)
   */
};

export default function () {
  console.log(exec.instance.vusActive);
  sleep(1);
}
