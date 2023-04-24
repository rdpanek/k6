/**
 * Basic example
 * https://k6.io/docs/using-k6-browser/overview/
 * 
 * How to run
 * - K6_BROWSER_ENABLED=true k6 run ./demos/01-sandbox/03-xk6-browser.js 
 * - docker run --rm -i -e K6_BROWSER_ENABLED=true grafana/k6 run - <./demos/01-sandbox/03-xk6-browser.js
 */

import { chromium } from 'k6/experimental/browser';
import { check } from 'k6';

export default async function () {
  const browser = chromium.launch({ headless: false });
  const page = browser.newPage();

  try {
    await page.goto('https://test.k6.io/my_messages.php', { waitUntil: 'networkidle' });

    page.locator('input[name="login"]').type('admin');
    page.locator('input[name="password"]').type('123');

    const submitButton = page.locator('input[type="submit"]');

    await Promise.all([page.waitForNavigation(), submitButton.click()]);

    check(page, {
      header: page.locator('h2').textContent() == 'Welcome, admin!',
    });
  } finally {
    page.close();
    browser.close();
  }
}
