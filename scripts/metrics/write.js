import fs from 'node:fs/promises';
import path from 'node:path';

import { metrics, resultsDir } from '../config.js';

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

export async function writeRawResult(tech, flow, runIndex, payload) {
  const dir = path.join(resultsDir, 'raw', tech, flow);
  await ensureDir(dir);
  const filePath = path.join(dir, `run-${runIndex}.json`);
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

function computeStatistics(values) {
  if (!values || values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mean = sorted.reduce((acc, value) => acc + value, 0) / sorted.length;
  const index = Math.min(sorted.length - 1, Math.ceil(0.95 * sorted.length) - 1);
  const p95 = sorted[index];
  const variance = sorted.reduce((acc, value) => acc + (value - mean) ** 2, 0) / (sorted.length > 1 ? sorted.length - 1 : 1);
  const stddev = Math.sqrt(variance);
  return { mean, p95, stddev, runs: sorted.length };
}

function formatNumber(value, unit) {
  if (Number.isNaN(value)) {
    return '';
  }
  if (unit === 'score') {
    return value.toFixed(4);
  }
  return value.toFixed(2);
}

function aggregateMetric(rows, metric, source, values, unit) {
  const stats = computeStatistics(values);
  if (!stats) {
    return;
  }
  rows.push({ metric, source, unit, ...stats });
}

function collectMetricValues(records, extractor) {
  const values = [];
  for (const record of records) {
    const value = extractor(record);
    if (typeof value === 'number' && Number.isFinite(value)) {
      values.push(value);
    }
  }
  return values;
}

export async function writeSummary(tech, flow, records) {
  const rows = [];

  const lighthouseKeys = new Set();
  for (const record of records) {
    for (const key of Object.keys(record.lighthouse ?? {})) {
      lighthouseKeys.add(key);
    }
  }
  for (const key of lighthouseKeys) {
    const unit = key === 'CLS' ? metrics.units.cls : metrics.units.defaultDuration;
    aggregateMetric(
      rows,
      key,
      'lighthouse',
      collectMetricValues(records, (record) => record.lighthouse?.[key]),
      unit,
    );
  }

  for (const mark of metrics.customMarks) {
    aggregateMetric(
      rows,
      mark,
      'custom',
      collectMetricValues(records, (record) => record.customMetrics?.[mark]),
      metrics.units.defaultDuration,
    );
  }

  const webVitalKeys = new Set();
  for (const record of records) {
    for (const key of Object.keys(record.webVitals ?? {})) {
      webVitalKeys.add(key);
    }
  }
  for (const key of webVitalKeys) {
    const unit = key === 'CLS' ? metrics.units.cls : metrics.units.defaultDuration;
    aggregateMetric(
      rows,
      key,
      'web-vitals',
      collectMetricValues(records, (record) => record.webVitals?.[key]),
      unit,
    );
  }

  const stressValues = collectMetricValues(records, (record) => {
    const updates = record.extraMetrics?.stress_update ?? [];
    if (!updates.length) {
      return undefined;
    }
    const total = updates.reduce((acc, item) => acc + item.duration, 0);
    return total / updates.length;
  });
  aggregateMetric(rows, 'stress_update_avg', 'stress', stressValues, metrics.units.defaultDuration);

  const summaryDir = path.join(resultsDir, 'summary');
  await ensureDir(summaryDir);
  const filePath = path.join(summaryDir, `${tech}-${flow}.csv`);
  const header = 'metric,source,mean,p95,stddev,unit,runs';
  const lines = rows.map((row) =>
    [
      row.metric,
      row.source,
      formatNumber(row.mean, row.unit),
      formatNumber(row.p95, row.unit),
      formatNumber(row.stddev, row.unit),
      row.unit,
      row.runs,
    ].join(','),
  );
  const content = `${header}\n${lines.join('\n')}\n`;
  await fs.writeFile(filePath, content, 'utf8');
}

