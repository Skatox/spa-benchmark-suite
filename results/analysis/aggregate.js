#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUMMARY_DIR = path.resolve(__dirname, '..', 'summary');
const ANALYSIS_DIR = __dirname;
const OUTPUT_COMBINED = path.join(ANALYSIS_DIR, 'combined.csv');
const OUTPUT_DATA = path.join(ANALYSIS_DIR, 'data.json');

const METRIC_ALIASES = new Map([
  ['first contentful paint', 'FCP'],
  ['fcp', 'FCP'],
  ['largest contentful paint', 'LCP'],
  ['lcp', 'LCP'],
  ['time to interactive', 'TTI'],
  ['tti', 'TTI'],
  ['total blocking time', 'TBT'],
  ['tbt', 'TBT'],
  ['cumulative layout shift', 'CLS'],
  ['cls', 'CLS'],
  ['speed index', 'SI'],
  ['si', 'SI'],
]);

const STAT_ALIASES = new Map([
  ['average', 'average'],
  ['avg', 'average'],
  ['mean', 'average'],
  ['median', 'average'],
  ['p95', 'p95'],
  ['p_95', 'p95'],
  ['p95ms', 'p95'],
  ['percentile95', 'p95'],
  ['95th', 'p95'],
  ['p99', 'p99'],
  ['percentile99', 'p99'],
]);

const DEFAULT_FLOW = 'default';

async function ensureDirectory(directory) {
  await fs.mkdir(directory, { recursive: true });
}

function normalizeMetricName(name) {
  if (!name) {
    return 'Unknown Metric';
  }
  const trimmed = name.toString().trim();
  const normalizedKey = trimmed.toLowerCase();
  if (METRIC_ALIASES.has(normalizedKey)) {
    return METRIC_ALIASES.get(normalizedKey);
  }
  if (normalizedKey.startsWith('mark') || normalizedKey.includes('mark')) {
    const markName = trimmed
      .replace(/mark[:\s-]*/i, '')
      .replace(/_/g, ' ')
      .trim();
    return markName ? `Mark: ${titleCase(markName)}` : 'Custom Mark';
  }
  return titleCase(trimmed.replace(/[_-]/g, ' '));
}

function titleCase(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function normalizeStatName(name) {
  if (!name) return null;
  const normalizedKey = name.toString().trim().toLowerCase();
  if (STAT_ALIASES.has(normalizedKey)) {
    const normalizedStat = STAT_ALIASES.get(normalizedKey);
    if (normalizedStat === 'p99') {
      // Ignore unsupported percentile columns gracefully.
      return null;
    }
    return normalizedStat;
  }
  return null;
}

function detectTechnology(row, fallback) {
  const keys = ['technology', 'tech', 'framework', 'app', 'project'];
  for (const key of keys) {
    if (row[key] && row[key].trim()) {
      return row[key].trim();
    }
    const capitalized = capitalizeFirst(key);
    if (row[capitalized] && row[capitalized].trim()) {
      return row[capitalized].trim();
    }
  }
  return fallback;
}

function detectFlow(row) {
  const keys = ['flow', 'scenario', 'path', 'journey'];
  for (const key of keys) {
    if (row[key] && row[key].trim()) {
      return row[key].trim();
    }
    const capitalized = capitalizeFirst(key);
    if (row[capitalized] && row[capitalized].trim()) {
      return row[capitalized].trim();
    }
  }
  return DEFAULT_FLOW;
}

function capitalizeFirst(value) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function parseNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const numeric = Number.parseFloat(
    value.toString().replace(/,/g, '').replace(/ms|s|%/gi, '')
  );
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeUnit(unit, metric) {
  if (!unit && metric === 'CLS') {
    return '';
  }
  if (!unit) {
    return 'ms';
  }
  const normalized = unit.toString().trim().toLowerCase();
  if (normalized.includes('millisecond') || normalized === 'ms') {
    return 'ms';
  }
  if (normalized === 's' || normalized.includes('second')) {
    return 's';
  }
  if (metric === 'CLS') {
    return '';
  }
  return 'ms';
}

function isDurationMetric(metric) {
  if (!metric) return true;
  return metric.toLowerCase() !== 'cls' && !metric.toLowerCase().includes('score');
}

function convertToMilliseconds(value, unit, metric) {
  if (value === null || value === undefined) {
    return null;
  }
  const normalizedUnit = normalizeUnit(unit, metric);
  if (normalizedUnit === 's') {
    return value * 1000;
  }
  return value;
}

function pickDisplayUnit(valuesMs, metric) {
  if (!isDurationMetric(metric)) {
    return metric === 'CLS' ? '' : '';
  }
  const maxValue = Math.max(
    ...valuesMs.filter((value) => Number.isFinite(value) && value !== null)
  );
  if (!Number.isFinite(maxValue)) {
    return 'ms';
  }
  return maxValue >= 2000 ? 's' : 'ms';
}

function formatValue(valueMs, displayUnit, metric) {
  if (valueMs === null || valueMs === undefined || !Number.isFinite(valueMs)) {
    return '—';
  }
  if (!isDurationMetric(metric)) {
    return valueMs.toFixed(2);
  }
  if (displayUnit === 's') {
    return (valueMs / 1000).toFixed(2);
  }
  return valueMs.toFixed(2);
}

function readCsvRecords(content) {
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

function extractRecords(row, meta) {
  const technology = detectTechnology(row, meta.technology);
  const flow = detectFlow(row);
  const metric = normalizeMetricName(
    row.metric ?? row.Metric ?? row.name ?? row.Name ?? row.label ?? row.Label
  );
  const unit = row.unit ?? row.Unit ?? row.units ?? row.Units ?? null;

  const records = [];
  const statKey = row.stat ?? row.Stat ?? row.summary ?? row.Summary;
  if (statKey) {
    const stat = normalizeStatName(statKey);
    if (stat) {
      const value = parseNumber(row.value ?? row.Value ?? row.result ?? row.Result);
      if (value !== null) {
        records.push({ technology, flow, metric, stat, value, unit });
      }
    }
  } else {
    const statColumns = [
      ['average', 'average'],
      ['avg', 'average'],
      ['mean', 'average'],
      ['p95', 'p95'],
      ['p_95', 'p95'],
      ['percentile95', 'p95'],
    ];
    for (const [columnName, stat] of statColumns) {
      if (row[columnName] !== undefined) {
        const value = parseNumber(row[columnName]);
        if (value !== null) {
          records.push({ technology, flow, metric, stat, value, unit });
        }
      }
      const capitalized = capitalizeFirst(columnName);
      if (row[capitalized] !== undefined) {
        const value = parseNumber(row[capitalized]);
        if (value !== null) {
          records.push({ technology, flow, metric, stat, value, unit });
        }
      }
    }
  }
  return records;
}

function buildAggregatedData(records) {
  const aggregated = new Map();

  for (const record of records) {
    const { technology, flow, metric, stat, value, unit } = record;
    if (!technology || !metric || !stat) {
      continue;
    }
    const valueMs = isDurationMetric(metric)
      ? convertToMilliseconds(value, unit, metric)
      : value;
    if (valueMs === null || !Number.isFinite(valueMs)) {
      continue;
    }
    if (!aggregated.has(flow)) {
      aggregated.set(flow, new Map());
    }
    const flowMap = aggregated.get(flow);
    if (!flowMap.has(metric)) {
      flowMap.set(metric, {
        metric,
        values: new Map(),
        units: new Map(),
      });
    }
    const metricEntry = flowMap.get(metric);
    if (!metricEntry.values.has(technology)) {
      metricEntry.values.set(technology, {});
    }
    const techEntry = metricEntry.values.get(technology);
    techEntry[stat] = valueMs;
    metricEntry.units.set(technology, normalizeUnit(unit, metric));
  }

  return aggregated;
}

function createWideTable(aggregated) {
  const rows = [];
  const metricsSet = new Set();

  for (const [flow, metricsMap] of aggregated.entries()) {
    const technologies = collectTechnologies(metricsMap);
    for (const technology of technologies) {
      const row = { Flow: flow, Technology: technology };
      for (const [metric, entry] of metricsMap.entries()) {
        metricsSet.add(metric);
        const values = entry.values.get(technology) ?? {};
        const displayUnit = entry.displayUnit ?? guessDisplayUnit(entry, metric);
        const averageStr = formatValue(values.average ?? null, displayUnit, metric);
        const p95Str = formatValue(values.p95 ?? null, displayUnit, metric);
        const unitLabel = displayUnit ? ` ${displayUnit}` : '';
        row[`${metric} (avg)`] = averageStr !== '—' ? `${averageStr}${unitLabel}` : '—';
        row[`${metric} (p95)`] = p95Str !== '—' ? `${p95Str}${unitLabel}` : '—';
      }
      rows.push(row);
    }
  }

  const metrics = Array.from(metricsSet);
  const headers = ['Flow', 'Technology'];
  for (const metric of metrics) {
    headers.push(`${metric} (avg)`);
    headers.push(`${metric} (p95)`);
  }

  const csvLines = [headers.join(',')];
  for (const row of rows) {
    const values = headers.map((header) => row[header] ?? '—');
    csvLines.push(values.map(escapeCsvValue).join(','));
  }

  return csvLines.join('\n');
}

function collectTechnologies(metricsMap) {
  const technologies = new Set();
  for (const entry of metricsMap.values()) {
    for (const technology of entry.values.keys()) {
      technologies.add(technology);
    }
  }
  return Array.from(technologies);
}

function guessDisplayUnit(entry, metric) {
  const valuesMs = [];
  for (const techEntry of entry.values.values()) {
    if (techEntry.average !== undefined) {
      valuesMs.push(techEntry.average);
    }
    if (techEntry.p95 !== undefined) {
      valuesMs.push(techEntry.p95);
    }
  }
  return pickDisplayUnit(valuesMs, metric);
}

function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = value.toString();
  if (stringValue.includes(',') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function serializeAnalysis(aggregated) {
  const flows = {};

  for (const [flow, metricsMap] of aggregated.entries()) {
    flows[flow] = { metrics: {} };

    for (const [metric, entry] of metricsMap.entries()) {
      const technologies = {};
      const valuesMs = [];
      for (const [technology, stats] of entry.values.entries()) {
        const averageMs = stats.average ?? null;
        const p95Ms = stats.p95 ?? null;
        if (averageMs !== null && Number.isFinite(averageMs)) {
          valuesMs.push(averageMs);
        }
        if (p95Ms !== null && Number.isFinite(p95Ms)) {
          valuesMs.push(p95Ms);
        }
        technologies[technology] = {
          average: averageMs,
          p95: p95Ms,
        };
      }

      const displayUnit = pickDisplayUnit(valuesMs, metric);
      entry.displayUnit = displayUnit;

      const order = Object.keys(technologies)
        .filter((tech) => technologies[tech].average !== null && technologies[tech].average !== undefined)
        .sort((a, b) => technologies[a].average - technologies[b].average);

      flows[flow].metrics[metric] = {
        metric,
        displayUnit,
        isDuration: isDurationMetric(metric),
        technologies,
        order,
      };
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    flows,
  };
}

async function readSummaryFiles() {
  try {
    const entries = await fs.readdir(SUMMARY_DIR, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.csv'))
      .map((entry) => path.join(SUMMARY_DIR, entry.name));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function main() {
  await ensureDirectory(ANALYSIS_DIR);

  const files = await readSummaryFiles();
  if (files.length === 0) {
    const emptyAnalysis = { generatedAt: new Date().toISOString(), flows: {} };
    await fs.writeFile(OUTPUT_DATA, JSON.stringify(emptyAnalysis, null, 2));
    await fs.writeFile(OUTPUT_COMBINED, 'Flow,Technology\n');
    console.warn('No summary CSV files found in /results/summary.');
    return;
  }

  const allRecords = [];

  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf8');
    const rows = readCsvRecords(content);
    const fallbackTechnology = titleCase(path.basename(filePath, path.extname(filePath)));
    for (const row of rows) {
      const extracted = extractRecords(row, { technology: fallbackTechnology });
      allRecords.push(...extracted);
    }
  }

  const aggregated = buildAggregatedData(allRecords);
  const analysis = serializeAnalysis(aggregated);
  const combinedCsv = createWideTable(aggregated);

  await fs.writeFile(OUTPUT_DATA, JSON.stringify(analysis, null, 2));
  await fs.writeFile(OUTPUT_COMBINED, combinedCsv);

  console.log(`Processed ${files.length} summary file(s).`);
  console.log(`Combined analysis saved to ${path.relative(process.cwd(), OUTPUT_COMBINED)}.`);
  console.log(`Structured data saved to ${path.relative(process.cwd(), OUTPUT_DATA)}.`);
}

main().catch((error) => {
  console.error('Failed to aggregate summary CSV files.');
  console.error(error);
  process.exit(1);
});
