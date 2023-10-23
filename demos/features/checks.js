/**
 * Custom Summary
 * https://k6.io/docs/using-k6/thresholds/
 * 
 * How to run
 * k6 run demos/features/checks.js
 */
import { check, fail } from 'k6';
import http from 'k6/http';

import { Counter } from 'k6/metrics';
const allErrors = new Counter('error_counter');

export default function () {
  const res = http.get('http://test.k6.io/');
  check(res, {
    // základní kontrola
    'is status 200': (r) => r.status === 200,

    // check textu odpovědi
    'verify homepage text': (r) =>
      r.body.includes('Collection of simple web-pages suitable for load testing'),

    // check velikosti odpovědi
    'body size is 11,105 bytes': (r) => r.body.length == 11105,
  });

  const checkOutput = check(res,{
      'response code was 200': (res) => res.status == 200,
      'body size was 1234 bytes': (res) => res.body.length == 1234,
    },{ myTag: "I'm a tag" }
  );

  if (!checkOutput) {
    allErrors.add(1);
    fail('unexpected response');
  }
}

/**
 * How to get response
 * ---
 * const res = http.get('http://test.k6.io/');
 * console.log(res)
 * ---
 * {
	"remote_ip": "3.235.210.138",
	"remote_port": 443,
	"url": "https://test.k6.io/",
	"status": 200,
	"status_text": "200 OK",
	"proto": "HTTP/1.1",
	"headers": {
		"Connection": "keep-alive",
		"X-Powered-By": "PHP/5.6.40",
		"Date": "Mon, 23 Oct 2023 12:18:21 GMT",
		"Content-Type": "text/html; charset=UTF-8"
	},
	"cookies": {

	},
	"body": "\u003c!DOCTYPE html\u003e\n\u003chtml lang=\"en\"\u003e\n\u003chead\u003e\n    \u003cmeta charset=\"UTF-8\"\u003e\n    \u003cmeta name=\"viewport\" content=\"width=device-width, initial-scale=1.main\u003e\n\u003cscript src=\"/static/js/prisms.js\"\u003e\u003c/script\u003e\n\u003c/body\u003e\n\u003c/html\u003e\n   proste response body :)",
	"timings": {
		"duration": 84.689221,
		"blocked": 164.988657,
		"looking_up": 0,
		"connecting": 81.904142,
		"tls_handshaking": 82.995009,
		"sending": 0.037958,
		"waiting": 84.53595,
		"receiving": 0.115313
	},
	"tls_version": "tls1.3",
	"tls_cipher_suite": "TLS_AES_128_GCM_SHA256",
	"ocsp": {
		"produced_at": 0,
		"this_update": 0,
		"next_update": 0,
		"revoked_at": 0,
		"revocation_reason": "",
		"status": "unknown"
	},
	"error": "",
	"error_code": 0,
	"request": {
		"method": "GET",
		"url": "http://test.k6.io/",
		"headers": {
			"User-Agent": [
				"k6/0.47.0 (https://k6.io/)"
			]
		},
		"body": "",
		"cookies": {

		}
	}
}
 */