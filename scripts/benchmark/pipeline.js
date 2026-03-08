const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { summarize } = require('./stats');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(ROOT, 'config', 'benchmark.config.json');
const RESULTS_ROOT = path.join(ROOT, 'results', 'benchmark');
const LIGHTHOUSE_BIN = path.join(ROOT, 'node_modules', '.bin', process.platform === 'win32' ? 'lighthouse.cmd' : 'lighthouse');

function loadConfig() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  if (!Array.isArray(config.frameworks) || !config.frameworks.length) throw new Error('frameworks is required');
  if (!Array.isArray(config.scenarios) || !config.scenarios.length) throw new Error('scenarios is required');
  if (!Number.isInteger(config.runsPerScenario) || config.runsPerScenario <= 0) throw new Error('runsPerScenario must be positive int');
  return config;
}

function runLighthouse(url, outputPath) {
  return new Promise((resolve, reject) => {
    const args = [
      url,
      '--quiet',
      '--chrome-flags=--headless',
      '--output=json',
      `--output-path=${outputPath}`,
    ];

    execFile(fs.existsSync(LIGHTHOUSE_BIN) ? LIGHTHOUSE_BIN : 'npx', fs.existsSync(LIGHTHOUSE_BIN) ? args : ['lighthouse', ...args], { cwd: ROOT }, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(JSON.parse(fs.readFileSync(outputPath, 'utf8')));
    });
  });
}

function probeResourceMetricsFromLighthouse(report) {
  const audits = report.audits || {};
  const metricsAudit = audits.metrics?.details?.items?.[0] || {};

  const jsHeapUsedBytes =
    metricsAudit.jsHeapUsedBytes ??
    metricsAudit.JSHeapUsedSize ??
    audits['diagnostics']?.details?.items?.[0]?.jsHeapUsedBytes ??
    null;

  return {
    cpuTaskDurationMs: audits['mainthread-work-breakdown']?.numericValue ?? audits['bootup-time']?.numericValue ?? null,
    jsHeapUsedBytes,
    jsHeapTotalBytes: metricsAudit.jsHeapTotalBytes ?? metricsAudit.JSHeapTotalSize ?? null,
  };
}

function pickLighthouseMetrics(report) {
  const audits = report.audits || {};
  return {
    fcpMs: audits['first-contentful-paint']?.numericValue ?? null,
    lcpMs: audits['largest-contentful-paint']?.numericValue ?? null,
    ttfbMs: audits['server-response-time']?.numericValue ?? null,
    cls: audits['cumulative-layout-shift']?.numericValue ?? null,
    ttiMs: audits['interactive']?.numericValue ?? null,
    tbtMs: audits['total-blocking-time']?.numericValue ?? null,
    inputDelayEquivalentMs: audits['max-potential-fid']?.numericValue ?? null,
    downloadBytes: audits['total-byte-weight']?.numericValue ?? null,
  };
}

function ensureMetricCompleteness(entry) {
  const required = ['fcpMs', 'lcpMs', 'ttfbMs', 'cls', 'ttiMs', 'tbtMs', 'inputDelayEquivalentMs', 'cpuTaskDurationMs', 'jsHeapUsedBytes', 'downloadBytes'];
  const missing = required.filter((metric) => entry.metrics[metric] === null || entry.metrics[metric] === undefined);
  return missing;
}


function validateRunEntry(entry) {
  const requiredTopLevel = ['framework', 'scenario', 'timestamp', 'runNumber', 'testType', 'url', 'environment', 'metrics'];
  const missingTopLevel = requiredTopLevel.filter((key) => entry[key] === undefined || entry[key] === null);
  const missingMetrics = ensureMetricCompleteness(entry);
  return { missingTopLevel, missingMetrics };
}

function aggregate(rawResults) {
  const groups = new Map();
  for (const run of rawResults) {
    const key = `${run.framework}::${run.scenario}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(run);
  }

  const metrics = ['fcpMs', 'lcpMs', 'ttfbMs', 'cls', 'ttiMs', 'tbtMs', 'inputDelayEquivalentMs', 'cpuTaskDurationMs', 'jsHeapUsedBytes', 'downloadBytes'];
  const output = [];

  for (const [key, runs] of groups.entries()) {
    const [framework, scenario] = key.split('::');
    const stats = {};
    for (const metric of metrics) {
      stats[metric] = summarize(runs.map((item) => item.metrics[metric]));
    }
    output.push({ framework, scenario, stats, runs: runs.length });
  }

  return output;
}

async function main() {
  const config = loadConfig();
  const timestamp = new Date().toISOString();
  const runId = timestamp.replace(/[:.]/g, '-');
  const runRoot = path.join(RESULTS_ROOT, runId);
  const rawDir = path.join(runRoot, 'raw');
  fs.mkdirSync(rawDir, { recursive: true });

  const rawResults = [];
  for (const framework of config.frameworks) {
    for (const scenario of config.scenarios) {
      for (let run = 1; run <= config.runsPerScenario; run += 1) {
        const url = `${framework.baseUrl}${scenario.path}`;
        const lhOutput = path.join(rawDir, `${framework.name}-${scenario.name}-run-${run}-lighthouse.json`);
        const lighthouseReport = await runLighthouse(url, lhOutput);
        const resourceMetrics = probeResourceMetricsFromLighthouse(lighthouseReport);

        const entry = {
          framework: framework.name,
          scenario: scenario.name,
          timestamp,
          runNumber: run,
          testType: 'spa-benchmark',
          url,
          environment: config.environment,
          metrics: {
            ...pickLighthouseMetrics(lighthouseReport),
            ...resourceMetrics,
          },
          observations: [],
        };

        const { missingMetrics, missingTopLevel } = validateRunEntry(entry);
        if (missingMetrics.length || missingTopLevel.length) {
          entry.observations.push(`Missing metrics: ${missingMetrics.join(', ') || 'none'}; Missing top-level fields: ${missingTopLevel.join(', ') || 'none'}`);
        }

        const entryPath = path.join(rawDir, `${framework.name}-${scenario.name}-run-${run}.json`);
        fs.writeFileSync(entryPath, JSON.stringify(entry, null, 2));
        rawResults.push(entry);
      }
    }
  }

  const aggregateResults = aggregate(rawResults);
  const aggregatedPath = path.join(runRoot, 'aggregated.json');
  fs.writeFileSync(aggregatedPath, JSON.stringify({ runId, timestamp, aggregateResults }, null, 2));

  const indexPath = path.join(RESULTS_ROOT, 'latest-run.json');
  fs.writeFileSync(indexPath, JSON.stringify({ runId, path: runRoot }, null, 2));

  console.log(`Benchmark completed: ${runRoot}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { loadConfig, pickLighthouseMetrics, ensureMetricCompleteness, validateRunEntry, aggregate };
