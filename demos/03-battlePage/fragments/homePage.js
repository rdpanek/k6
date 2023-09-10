import { check, group, fail } from 'k6'
import { Rate, Trend } from 'k6/metrics'
import { Httpx } from 'https://jslib.k6.io/httpx/0.0.3/index.js'

const loadHomePageCheck = new Rate('homepage_check')
const loadHomePageTime = new Trend('homepage_time')

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

  group('BattlePage open', function () {
    response = session.get(
      '/',
      {
        tags: {
          requests: "homePage",
        },
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
    }, { responseCheck: "homePage" })
    loadHomePageCheck.add(successOpen)
    loadHomePageTime.add(response.timings.duration)
  })
}

module.exports = {
  openHomepage
}