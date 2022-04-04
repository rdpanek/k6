const config = {
  scenarios: {
    homePageScenario: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '120s', target: 3 },
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