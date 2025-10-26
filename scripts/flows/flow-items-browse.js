import { waits } from '../config.js';

async function waitForMetric(page, metricName) {
  await page.waitForFunction(
    (name) => {
      const metrics = window.__appMetrics?.buffer ?? [];
      return metrics.some((entry) => entry.name === name);
    },
    metricName,
    { timeout: waits.metricPollingTimeoutMs },
  );
}

export default async function flowItemsBrowse(page, { baseURL }) {
  await page.goto(`${baseURL}/items`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Items' }).waitFor();

  const table = page.getByRole('table');
  await table.waitFor();
  await page.waitForSelector('#category option:nth-child(2)');

  await page.getByLabel('Search items').fill('Monitor');
  await waitForMetric(page, 'filter_applied');

  await page.selectOption('#category', { index: 1 });
  await waitForMetric(page, 'filter_applied');

  await page.selectOption('#sort-field', 'price');
  await waitForMetric(page, 'sort_applied');

  await page.selectOption('#sort-direction', 'desc');
  await waitForMetric(page, 'sort_applied');

  await page.getByRole('button', { name: '2' }).click();
  await waitForMetric(page, 'page_changed');

  await page.getByRole('button', { name: '5' }).click();
  await waitForMetric(page, 'page_changed');

  await page.waitForTimeout(500);
}

