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

export default async function flowSearchAndEdit(page, { baseURL }) {
  await page.goto(`${baseURL}/items`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Items' }).waitFor();
  await waitForMetric(page, 'items_table_first_paint');

  const searchInput = page.getByLabel('Search items');
  await searchInput.fill('Laptop');
  await waitForMetric(page, 'filter_applied');

  const editButton = page.getByRole('button', { name: 'Edit' }).first();
  await editButton.click();

  await page.waitForURL(/\/items\/\d+\/edit$/);
  await page.getByRole('heading', { name: 'Edit item' }).waitFor();

  await page.fill('#price', '999.99');
  await page.fill('#stock', '25');
  await page.click('button[type="submit"]');

  await waitForMetric(page, 'form_submit_success');
  await page.waitForURL(/\/items$/);
  await waitForMetric(page, 'items_table_first_paint');
  await page.waitForTimeout(500);
}

