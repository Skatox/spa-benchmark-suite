import { metrics, waits } from '../config.js';

const stressMetricPattern = /^stress_update_\d+$/;

async function waitForWebVitals(page) {
  await page.waitForFunction(
    () => {
      const webVitals = window.__appMetrics?.webVitals;
      return Boolean(webVitals && Object.keys(webVitals).length > 0);
    },
    null,
    { timeout: waits.metricPollingTimeoutMs },
  );
}

export async function collectAppMetrics(page, { awaitWebVitals = false } = {}) {
  if (awaitWebVitals) {
    try {
      await waitForWebVitals(page);
    } catch (error) {
      if (process.env.DEBUG) {
        console.warn('Web vitals not reported before timeout', error);
      }
    }
  }

  const snapshot = await page.evaluate(() => {
    if (window.__appMetrics?.getAndReset) {
      return window.__appMetrics.getAndReset();
    }
    return { metrics: [], webVitals: {} };
  });

  const customMetrics = {};
  const stressMetrics = [];

  for (const entry of snapshot.metrics) {
    if (metrics.customMarks.includes(entry.name)) {
      customMetrics[entry.name] = entry.duration;
    }
    if (stressMetricPattern.test(entry.name)) {
      stressMetrics.push({ name: entry.name, duration: entry.duration });
    }
  }

  const performanceEntries = await page.evaluate((names) => {
    const result = {};
    for (const name of names) {
      const entries = performance.getEntriesByName(name);
      if (entries.length > 0) {
        const entry = entries[entries.length - 1];
        result[name] = { duration: entry.duration, startTime: entry.startTime };
      }
    }
    return result;
  }, metrics.customMarks);

  stressMetrics.sort((a, b) => a.name.localeCompare(b.name));

  return {
    customMetrics,
    webVitals: snapshot.webVitals,
    performanceEntries,
    extraMetrics: {
      stress_update: stressMetrics,
    },
  };
}

