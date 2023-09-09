/**
 * Basic example
 * https://k6.io/docs/using-k6-browser/overview/
 * 
 * How to run
 * k6 run ./demos/01-sandbox/03-xk6-browser.js
 * docker run --rm -i grafana/k6 run - <./demos/01-sandbox/03-xk6-browser.js
 */

import { browser } from 'k6/experimental/browser';

export const options = {
  scenarios: {
    ui: {
      executor: 'shared-iterations',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
  thresholds: {
    checks: ["rate==1.0"]
  }
}

export default async function () {
  const page = browser.newPage();

  try {
    await page.goto('https://test.k6.io/');
    page.screenshot({ path: 'screenshot.png' });
  } finally {
    page.close();
  }
}
