import { check, group, fail } from 'k6'
import { Rate } from 'k6/metrics'
import { Httpx } from 'https://jslib.k6.io/httpx/0.0.3/index.js';

const successHomePageRate = new Rate('success_homepage_rate');
const unSuccessHomePageRate = new Rate('unsuccess_homepage_rate');

let response

const openHomepage = function(config = fail(`login: missing config.`)) {
  const { environment, traceId } = config
  const session = new Httpx({
    baseURL: environment,
    headers: {
      'x-b3-traceid': traceId
    },
    timeout: 20000,
  })

  group('open', function () {
    response = session.get(
      '/',
      {
        headers: {
          'upgrade-insecure-requests': '1',
          'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="100", "Google Chrome";v="100"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
        },
      }
    )

    check(response, {
      '1-openHomepage: response code was 200': (res) => res.status == 200,
    })
    let successOpen = check(response, {
      '1-openHomepage: page contains title': (res) => res.body.includes(`BattlePage by Canarytrace`)
    })
    if (successOpen) successHomePageRate.add(successOpen)
    if (!successOpen) unSuccessHomePageRate.add(successOpen)

  })
}

module.exports = {
  openHomepage
}