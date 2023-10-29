/**
 * k6/execution
 * https://k6.io/docs/javascript-api/k6-execution/
 * 
 * How to run
 * k6 run demos/features/execution.js
 */
import exec from 'k6/execution';
import { group } from 'k6';

export const options = {
  scenarios: {
    myscenario: {
      // this will be the returned name
      executor: 'shared-iterations',
      maxDuration: '2m',
      tags: { my_custom_tag: 'shared-iterations' },
    },
  },
};

export default function () {

  console.log(exec.scenario.name); // myscenario
  console.log(exec.scenario.executor); // shared-iterations
  console.log(exec.scenario.startTime); // unix timestamp
  console.log(exec.scenario.progress); // float between 0 and 1
  console.log(exec.scenario.iterationInTest); // 0
  // step1: scenario ran for 1ms  
  console.log(`step1: scenario ran for ${new Date() - new Date(exec.scenario.startTime)}ms`);

  console.log(exec.instance.vusActive); // 1
  console.log(exec.instance.currentTestRunDuration); // float
  console.log(exec.instance.iterationsCompleted); // 0
  console.log(exec.instance.iterationsInterrupted); // 0

  // exec.test.abort('this is the reason'); // aborts the current test, calling teardown() and handleSummary()
  // ERRO[0000] test aborted at file:///Users/ypr/htdocs/k6/demos/features/execution.js:32:2(78)
  console.log(exec.test.options.scenarios.myscenario)
  /**
   * {
    "executor": "shared-iterations",
    "startTime": null,
    "gracefulStop": null,
    "env": null,
    "exec": null,
    "tags": null,
    "vus": null,
    "iterations": null,
    "maxDuration": "30m0s"
  }
   */
  // console.log(exec.test.options.scenarios.default.stages[0].target); // 100

  console.log(exec.vu.iterationInInstance) // identifikator instance aktualni VU
  console.log(exec.vu.iterationInScenario) // identifikator iterace aktualni VU
  console.log(exec.vu.idInInstance) // identifikator VU skrz vsechny instance
  console.log(exec.vu.idInTest) // globalni a unikatni identifikator VU
  console.log(exec.vu.metrics.tags) // {"scenario":"myscenario","my_custom_tag":"shared-iterations","group":""}
  // libovolne muzeme pridat a cist metadata
  exec.vu.metrics.metadata['trace_id'] = 'somecoolide';
  console.log(exec.vu.metrics.metadata)
  exec.vu.metrics.tags['mytag'] = 'value1';
}

export function teardown() {
  console.log('teardown');
}