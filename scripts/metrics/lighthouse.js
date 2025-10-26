import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

import { waits } from '../config.js';

const DEFAULT_SETTINGS = {
  extends: 'lighthouse:default',
};

const DEFAULT_OPTIONS = {
  logLevel: 'silent',
  output: 'json',
  onlyCategories: ['performance'],
};

const METRIC_KEYS = {
  FCP: 'first-contentful-paint',
  LCP: 'largest-contentful-paint',
  TTI: 'interactive',
  TBT: 'total-blocking-time',
  CLS: 'cumulative-layout-shift',
  SpeedIndex: 'speed-index',
};

export async function runLighthouse(url) {
  const chrome = await launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
  });

  try {
    const runnerResult = await lighthouse(
      url,
      {
        ...DEFAULT_OPTIONS,
        port: chrome.port,
        disableStorageReset: false,
      },
      DEFAULT_SETTINGS,
    );

    if (!runnerResult?.lhr) {
      throw new Error('Lighthouse did not return a Lighthouse Result.');
    }

    const metrics = {};
    for (const [label, auditKey] of Object.entries(METRIC_KEYS)) {
      const audit = runnerResult.lhr.audits[auditKey];
      if (audit?.numericValue !== undefined) {
        metrics[label] = audit.numericValue;
      }
    }
    return metrics;
  } finally {
    await Promise.race([
      chrome.kill(),
      new Promise((resolve) => setTimeout(resolve, waits.metricPollingIntervalMs)),
    ]);
  }
}

