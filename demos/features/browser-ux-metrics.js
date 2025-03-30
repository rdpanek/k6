/**
 * Custom Summary
 * https://k6.io/docs/using-k6-browser/overview/
 * 
 * How to run
 * k6 run demos/features/browser-ux-metrics.js
 * 
 * K6_BROWSER_HEADLESS=false k6 run demos/features/browser-ux-metrics.js
 */
import { browser } from 'k6/browser';
import { Trend } from 'k6/metrics';

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
};

const myTrend = new Trend('total_action_time', true);

export default async function () {
  const page = await browser.newPage();

  try {
    await page.goto('https://test.k6.io/browser.php');
    await page.evaluate(() => window.performance.mark('page-visit'));

    await page.locator('#checkbox1').check();
    await page.locator('#counter-button').click();
    await page.locator('#text1').fill('This is a test');

    await page.evaluate(() => window.performance.mark('action-completed'));

    // Get time difference between visiting the page and completing the actions
    await page.evaluate(() =>
      window.performance.measure('total-action-time', 'page-visit', 'action-completed')
    );

    const totalActionTime = await page.evaluate(
      () =>
        JSON.parse(JSON.stringify(window.performance.getEntriesByName('total-action-time')))[0]
          .duration
    );

    myTrend.add(totalActionTime);
  } finally {
    await page.close();
  }
}