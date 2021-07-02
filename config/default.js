const config = {
  scenarios: {
    homePageScenario: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '10s', target: 1 },
        { duration: '40s', target: 200 },
        { duration: '600s', target: 400 },
        { duration: '600s', target: 800 },
        { duration: '600s', target: 100 },
      ],
      gracefulRampDown: '0s',
      exec: 'homePageScenario',
    },
  },
  batchPerHost: 6,
  thresholds: { 
    http_req_connecting: ['p(90) > 3000'],
    http_req_waiting: ['p(90) > 1000']
  },
  //discardResponseBodies: true,
  //duration: '3m', // without WM
  //iterations: 10,
  //httpDebug: 'full',
  //noConnectionReuse: true,
  //rps: 500,
}

module.exports = {
  config
}