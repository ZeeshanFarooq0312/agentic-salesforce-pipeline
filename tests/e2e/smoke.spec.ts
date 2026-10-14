import { test, expect } from '@playwright/test';

// Runs against a sandbox/staging org. Set SF_BASE_URL (e.g. https://mydomain.sandbox.my.salesforce.com).
// Optional SF_USERNAME / SF_PASSWORD enable the authenticated flow.
test.describe('staging smoke', () => {
  test.skip(!process.env.SF_BASE_URL, 'SF_BASE_URL not set');

  test('login page is reachable', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#username')).toBeVisible();
  });

  test('user can log in and reach the app launcher', async ({ page }) => {
    test.skip(!process.env.SF_USERNAME || !process.env.SF_PASSWORD, 'credentials not set');
    await page.goto('/');
    await page.fill('#username', process.env.SF_USERNAME!);
    await page.fill('#password', process.env.SF_PASSWORD!);
    await page.click('#Login');
    await expect(page).toHaveURL(/lightning/);
  });
});
