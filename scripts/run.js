import fs from 'node:fs/promises';
import path from 'node:path';

import { chromium } from 'playwright';

import { apps, flows, resultsDir, runsPerFlow, waits } from './config.js';
import { buildApp, launchPreview } from './launcher.js';
import { collectAppMetrics } from './metrics/extract.js';
import { runLighthouse } from './metrics/lighthouse.js';
import { writeRawResult, writeSummary } from './metrics/write.js';

function parseArguments(argv) {
  const techFilters = [];
  const flowFilters = [];
  let runsOverride;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--tech') {
      const value = argv[index + 1];
      if (!value) {
        throw new Error('--tech requires a value');
      }
      techFilters.push(value);
      index += 1;
    } else if (arg === '--flow') {
      const value = argv[index + 1];
      if (!value) {
        throw new Error('--flow requires a value');
      }
      flowFilters.push(value);
      index += 1;
    } else if (arg === '--runs') {
      const value = Number(argv[index + 1]);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error('--runs requires a positive number');
      }
      runsOverride = value;
      index += 1;
    }
  }

  return { techFilters, flowFilters, runsOverride };
}

async function ensureAppExists(appConfig) {
  try {
    await fs.access(path.join(appConfig.rootDir, 'package.json'));
    return true;
  } catch {
    console.warn(`Skipping ${appConfig.tech}: ${appConfig.rootDir} is missing.`);
    return false;
  }
}

async function runFlow({ browser, flow, appConfig, baseURL, runIndex }) {
  const { default: executeFlow } = await import(flow.modulePath);
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  try {
    await executeFlow(page, { baseURL, runIndex });
    const metricsPayload = await collectAppMetrics(page, { awaitWebVitals: true });
    let timeoutHandle;
    try {
      const lighthouseMetrics = await Promise.race([
        runLighthouse(`${baseURL}${flow.entryPath}`),
        new Promise((_, reject) => {
          timeoutHandle = setTimeout(
            () => reject(new Error('Lighthouse timed out')),
            waits.lighthouseTimeoutMs,
          );
        }),
      ]);
      const payload = {
        timestamp: new Date().toISOString(),
        tech: appConfig.tech,
        flow: flow.name,
        flow_name: flow.name,
        run: runIndex,
        run_idx: runIndex,
        lighthouse: lighthouseMetrics,
        ...metricsPayload,
      };
      await writeRawResult(appConfig.tech, flow.name, runIndex, payload);
      return payload;
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
    }
  } finally {
    await context.close();
  }
}

async function runBenchmarks(options) {
  const { techFilters, flowFilters, runsOverride } = parseArguments(options.argv);
  const targetRuns = runsOverride ?? runsPerFlow;

  const selectedApps = apps.filter((app) =>
    techFilters.length === 0 ? true : techFilters.includes(app.tech),
  );

  if (selectedApps.length === 0) {
    throw new Error('No applications matched the provided --tech filters.');
  }

  const selectedFlows = flows.filter((flow) =>
    flowFilters.length === 0 ? true : flowFilters.includes(flow.name),
  );

  if (selectedFlows.length === 0) {
    throw new Error('No flows matched the provided --flow filters.');
  }

  await fs.mkdir(resultsDir, { recursive: true });

  for (const appConfig of selectedApps) {
    if (!(await ensureAppExists(appConfig))) {
      continue;
    }

    console.log(`\n[${appConfig.tech}] Building project…`);
    await buildApp(appConfig);

    console.log(`[${appConfig.tech}] Starting preview server on port ${appConfig.port}…`);
    const preview = await launchPreview(appConfig);
    const browser = await chromium.launch({ headless: true });

    try {
      for (const flow of selectedFlows) {
        console.log(`\n[${appConfig.tech}] Running ${flow.name} (${targetRuns} runs)…`);
        const records = [];
        for (let runIndex = 0; runIndex < targetRuns; runIndex += 1) {
          console.log(`- Run ${runIndex + 1}/${targetRuns}`);
          const record = await runFlow({ browser, flow, appConfig, baseURL: preview.baseURL, runIndex });
          records.push(record);
        }
        await writeSummary(appConfig.tech, flow.name, records);
      }
    } finally {
      await browser.close();
      await preview.close();
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runBenchmarks({ argv: process.argv.slice(2) }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

