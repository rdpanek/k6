/**
 * Custom Summary
 * https://k6.io/docs/using-k6-browser/overview/
 * 
 * How to run
 * k6 run demos/features/browser.js
 * 
 * K6_BROWSER_HEADLESS=false k6 run demos/features/browser.js
 */
import { browser } from 'k6/experimental/browser';
import { check } from 'k6';

export const options = {
  scenarios: {
    ui: {
      executor: 'constant-vus',
      exec: 'browserTest',
      vus: 1,
      duration: '10s',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
  thresholds: {
    checks: ["rate==1.0"],
    'browser_web_vital_lcp': ['p(90) < 1000'],
    'browser_web_vital_inp{url:https://test.k6.io/my_messages.php}': ['p(90) < 100'],
  }
}

export async function browserTest() {
  const page = browser.newPage();

  try {
    await page.goto('https://test.k6.io/my_messages.php');

    page.locator('input[name="login"]').type('admin');
    page.locator('input[name="password"]').type('123');

    const submitButton = page.locator('input[type="submit"]');

    await Promise.all([page.waitForNavigation(), submitButton.click()]);

    check(page, {
      'header': p => p.locator('h2').textContent() == 'Welcome, admin!',
    });
  } finally {
    page.close();
  }
}
