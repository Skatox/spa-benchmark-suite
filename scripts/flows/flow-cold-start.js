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

export default async function flowColdStart(page, { baseURL }) {
  await page.goto(`${baseURL}/`, { waitUntil: 'networkidle' });
  await waitForMetric(page, 'first_route_mounted');
  await page.waitForTimeout(500);
}

