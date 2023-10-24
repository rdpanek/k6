/**
 * Custom Summary
 * https://k6.io/docs/using-k6/scenarios/#scenario-example
 * 
 * How to run
 * k6 run demos/features/scenarios.js
 */
import http from "k6/http";

export const options = {
  scenarios: {
		// okamžitý start, 10VU a 100 iterací
    shared_iter_scenario: {
      executor: "shared-iterations",
      vus: 10,
      iterations: 100,
      startTime: "0s",
    },
		// start po 10s, 10VU a 10 iterací
    per_vu_scenario: {
      executor: "per-vu-iterations",
      vus: 10,
      iterations: 10,
      startTime: "10s",
    },
  },
};

export default function () {
  http.get("https://test.k6.io/");
}
