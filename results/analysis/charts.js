#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ANALYSIS_DIR = __dirname;
const DATA_FILE = path.join(ANALYSIS_DIR, 'data.json');
const CHARTS_DIR = path.resolve(__dirname, '..', 'charts');

const WIDTH = 960;
const HEIGHT = 540;

async function ensureDirectory(directory) {
  await fs.mkdir(directory, { recursive: true });
}

async function loadAnalysis() {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('Missing data.json. Run the aggregate step first.');
    }
    throw error;
  }
}

function formatDisplayUnit(metric) {
  if (!metric.isDuration || !metric.displayUnit) {
    return metric.displayUnit || '';
  }
  return metric.displayUnit;
}

function labelWithUnit(label, unit) {
  return unit ? `${label} (${unit})` : label;
}

function getUnitDivisor(metric) {
  if (!metric.isDuration) {
    return 1;
  }
  return metric.displayUnit === 's' ? 1000 : 1;
}

function buildChartConfiguration(flowName, metricName, metric) {
  const labels = metric.order.length > 0 ? metric.order : Object.keys(metric.technologies);
  const unit = formatDisplayUnit(metric);
  const divisor = getUnitDivisor(metric);

  const averageValues = labels.map((tech) => {
    const entry = metric.technologies[tech];
    if (!entry || entry.average === null || entry.average === undefined) {
      return null;
    }
    return entry.average / divisor;
  });

  const p95Values = labels.map((tech) => {
    const entry = metric.technologies[tech];
    if (!entry || entry.p95 === null || entry.p95 === undefined) {
      return null;
    }
    return entry.p95 / divisor;
  });

  const datasets = [];

  if (averageValues.some((value) => value !== null)) {
    datasets.push({
      type: 'bar',
      label: labelWithUnit('Average', unit),
      data: averageValues,
      backgroundColor: 'rgba(63, 81, 181, 0.65)',
      borderColor: 'rgba(63, 81, 181, 1)',
      borderWidth: 1,
    });
  }

  if (p95Values.some((value) => value !== null)) {
    datasets.push({
      type: 'line',
      label: labelWithUnit('p95', unit),
      data: p95Values,
      borderColor: 'rgba(255, 82, 82, 1)',
      backgroundColor: 'rgba(255, 82, 82, 0.2)',
      borderWidth: 3,
      tension: 0.2,
      spanGaps: true,
      fill: false,
      yAxisID: 'y',
      pointRadius: 4,
      pointHoverRadius: 6,
    });
  }

  const sanitizedLabels = labels.map((label) => label || 'Unknown');

  return {
    type: 'bar',
    data: {
      labels: sanitizedLabels,
      datasets,
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: `${flowName} · ${metricName}`,
        },
        tooltip: {
          callbacks: {
            label(context) {
              const value = context.parsed.y ?? context.parsed;
              if (value === null || value === undefined) {
                return `${context.dataset.label}: —`;
              }
              return `${context.dataset.label}: ${Number.parseFloat(value).toFixed(2)}`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: false,
        },
        y: {
          stacked: false,
          title: {
            display: !!unit,
            text: unit || undefined,
          },
          beginAtZero: true,
        },
      },
    },
  };
}

function sanitizeFileName(flow, metric) {
  return `${flow}-${metric}`
    .replace(/[^a-z0-9\-]+/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}

async function renderChart(chartJSNodeCanvas, configuration, outputPath) {
  const buffer = await chartJSNodeCanvas.renderToBuffer(configuration, 'image/png');
  await fs.writeFile(outputPath, buffer);
}

async function generateCharts(analysis) {
  await ensureDirectory(CHARTS_DIR);
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: WIDTH, height: HEIGHT });

  const generated = [];

  const flows = analysis.flows || {};
  const flowNames = Object.keys(flows);
  if (flowNames.length === 0) {
    console.warn('No flows available in analysis data. Charts will not be generated.');
    return generated;
  }

  for (const flowName of flowNames) {
    const metrics = flows[flowName].metrics || {};
    for (const [metricName, metric] of Object.entries(metrics)) {
      const configuration = buildChartConfiguration(flowName, metricName, metric);
      if (!configuration.data.datasets.length) {
        console.warn(`Skipping chart for ${flowName} · ${metricName} due to missing data.`);
        continue;
      }
      const fileName = `${sanitizeFileName(flowName, metricName)}.png`;
      const outputPath = path.join(CHARTS_DIR, fileName);
      await renderChart(chartJSNodeCanvas, configuration, outputPath);
      generated.push({ flow: flowName, metric: metricName, fileName });
      console.log(`Chart saved to ${path.relative(process.cwd(), outputPath)}`);
    }
  }

  return generated;
}

async function main() {
  const analysis = await loadAnalysis();
  const generatedCharts = await generateCharts(analysis);
  if (!generatedCharts.length) {
    console.warn('No charts were generated.');
  }
}

main().catch((error) => {
  console.error('Failed to generate charts.');
  console.error(error);
  process.exit(1);
});
