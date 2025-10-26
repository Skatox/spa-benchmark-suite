import { waits } from '../config.js';

async function waitForStressCompletion(page) {
  await page.waitForFunction(
    () => {
      const metrics = window.__appMetrics?.buffer ?? [];
      return metrics.some((entry) => entry.name === 'stress_update_19');
    },
    null,
    { timeout: waits.metricPollingTimeoutMs },
  );
}

export default async function flowStress(page, { baseURL }) {
  await page.goto(`${baseURL}/items`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Items' }).waitFor();
  await page.waitForTimeout(500);

  await page.getByRole('button', { name: 'Stress test' }).click();
  await waitForStressCompletion(page);
  await page.waitForTimeout(1_000);
}

