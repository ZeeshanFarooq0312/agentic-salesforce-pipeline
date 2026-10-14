import { test, expect } from '@playwright/test';

// React form -> .NET API. Optionally verifies Salesforce parity via REST.
// Requires: REACT_URL (e.g. http://localhost:5173) and a reachable API behind it.
// Optional: SF_INSTANCE_URL + SF_ACCESS_TOKEN to confirm the Salesforce rating for a seeded Account.
test.describe('cross-system rating', () => {
  test.skip(!process.env.REACT_URL, 'REACT_URL not set');

  for (const [revenue, expected] of [['20000000', 'Hot'], ['5000000', 'Warm'], ['100', 'Cold']]) {
    test(`React + API agree: ${revenue} -> ${expected}`, async ({ page }) => {
      await page.goto(process.env.REACT_URL!);
      await page.getByLabel('Annual revenue').fill(revenue);
      await page.getByRole('button', { name: 'Get rating' }).click();
      await expect(page.getByTestId('rating')).toHaveText(expected);
    });
  }

  test('Salesforce Apex rating matches API for a seeded account', async ({ request }) => {
    test.skip(!process.env.SF_INSTANCE_URL || !process.env.SF_ACCESS_TOKEN, 'Salesforce creds not set');
    const q = encodeURIComponent("SELECT Rating FROM Account WHERE Name = 'E2E Hot Account' LIMIT 1");
    const res = await request.get(`${process.env.SF_INSTANCE_URL}/services/data/v62.0/query?q=${q}`, {
      headers: { Authorization: `Bearer ${process.env.SF_ACCESS_TOKEN}` },
    });
    expect(res.ok()).toBeTruthy();
    expect((await res.json()).records[0].Rating).toBe('Hot');
  });
});
