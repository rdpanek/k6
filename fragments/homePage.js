import http from 'k6/http';
import { Httpx, Get } from 'https://jslib.k6.io/httpx/0.0.2/index.js';
import { group, sleep } from 'k6';
import { check } from 'k6';

import {parseResources} from '../libs/parseResources.js'

let headerDefault = {
  accept:
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "accept-encoding": "gzip, deflate, br",
  "accept-language":
  "cs-CZ,cs;q=0.9,en-US;q=0.8,en;q=0.7,es-ES;q=0.6,es;q=0.5,de-DE;q=0.4,de;q=0.3",
  "cache-control": "max-age=0",
  dnt: "1",
  "sec-ch-ua":
  '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
  "sec-ch-ua-mobile": "?0",
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "none",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
}

const open = function(baseURL) {
  let response, embeddedResources
  let session = new Httpx({ baseURL: baseURL });
  group('open home page', function(){
    response = http.get(baseURL, { headers: headerDefault});

    check(response, {
      'check: is status 200': (r) => r.status === 200,
    })
    check(response, {
      'check: title': (r) => r.body.includes('Canarytrace') === true,
    })
    
    if (response.status === 200) {
      // parse embedded resources
      embeddedResources = parseResources(response)

      // prepare Get for each resource
      if (embeddedResources.length > 0) {
        let _sessions = []
        embeddedResources.forEach(_resource => {
          _sessions.push(new Get(_resource))
        });
      
        // call multiple HTTP requests together
        let responses = session.batch(_sessions, {
          tags: {name: 'embeddedResources'}
        })

        responses.forEach(_response => {
          check(_response, {
            'check: is status 200': (r) => r.status === 200,
          })
        });
      }
    }
  })
}

module.exports = {
  open
}