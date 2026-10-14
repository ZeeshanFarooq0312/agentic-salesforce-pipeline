import { test, expect, APIRequestContext } from '@playwright/test';

/**
 * Multi-step form -> .NET API -> Salesforce, then assert on the downstream record via the
 * Salesforce REST API (Apex trigger rating + Flow-created Task), with data setup and teardown.
 *
 * Required env:
 *   REACT_URL         the running React app (e.g. http://localhost:5173)
 *   SF_INSTANCE_URL   e.g. https://<mydomain>.develop.my.salesforce.com
 *   SF_ACCESS_TOKEN   session/access token for the same org the API writes to
 */
const REACT_URL = process.env.REACT_URL;
const SF = process.env.SF_INSTANCE_URL;
const TOKEN = process.env.SF_ACCESS_TOKEN;
const API_VERSION = 'v62.0';
const PREFIX = 'E2E-';

const headers = { Authorization: `Bearer ${TOKEN}` };

async function soql(request: APIRequestContext, query: string) {
  const res = await request.get(`${SF}/services/data/${API_VERSION}/query`, {
    headers,
    params: { q: query },
  });
  expect(res.ok(), `SOQL failed: ${await res.text()}`).toBeTruthy();
  return (await res.json()).records as Array<Record<string, any>>;
}

async function deleteAccount(request: APIRequestContext, id: string) {
  // 204 = deleted, 404 = already gone; both are fine for teardown.
  const res = await request.delete(`${SF}/services/data/${API_VERSION}/sobjects/Account/${id}`, { headers });
  expect([204, 404]).toContain(res.status());
}

test.describe('account wizard -> Salesforce', () => {
  test.skip(!REACT_URL || !SF || !TOKEN, 'REACT_URL, SF_INSTANCE_URL and SF_ACCESS_TOKEN are required');

  const createdIds: string[] = [];

  test.beforeAll(async ({ request }) => {
    // Setup: remove stale records left by an interrupted earlier run.
    const stale = await soql(request, `SELECT Id FROM Account WHERE Name LIKE '${PREFIX}%'`);
    for (const r of stale) await deleteAccount(request, r.Id);
  });

  test.afterAll(async ({ request }) => {
    // Teardown: always remove what this run created, even if assertions failed.
    for (const id of createdIds) await deleteAccount(request, id);
  });

  async function fillWizard(page: import('@playwright/test').Page, name: string, revenue: string) {
    await page.goto(REACT_URL!);
    await page.getByLabel('Company name').fill(name);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByLabel('Annual revenue').fill(revenue);
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByTestId('review-name')).toHaveText(name);
    await page.getByRole('button', { name: 'Create account' }).click();
    const id = (await page.getByTestId('account-id').textContent())!.trim();
    createdIds.push(id);
    return id;
  }

  test('high-revenue account is rated Hot and gets a follow-up task', async ({ page, request }) => {
    const name = `${PREFIX}hot-${Date.now()}`;
    const id = await fillWizard(page, name, '20000000');

    // Downstream assertions in Salesforce itself, not in the UI.
    await expect
      .poll(async () => (await soql(request, `SELECT Rating FROM Account WHERE Id = '${id}'`))[0]?.Rating)
      .toBe('Hot');

    const tasks = await soql(request, `SELECT Subject, Priority FROM Task WHERE WhatId = '${id}'`);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].Priority).toBe('High');
  });

  test('low-revenue account is rated Cold and gets no task', async ({ page, request }) => {
    const name = `${PREFIX}cold-${Date.now()}`;
    const id = await fillWizard(page, name, '100');

    await expect
      .poll(async () => (await soql(request, `SELECT Rating FROM Account WHERE Id = '${id}'`))[0]?.Rating)
      .toBe('Cold');
    expect(await soql(request, `SELECT Id FROM Task WHERE WhatId = '${id}'`)).toHaveLength(0);
  });

  test('wizard blocks invalid input before reaching the API', async ({ page }) => {
    await page.goto(REACT_URL!);
    await page.getByLabel('Company name').fill(`${PREFIX}invalid`);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByLabel('Annual revenue').fill('-5');
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByRole('alert')).toContainText('0 or more');
  });
});
