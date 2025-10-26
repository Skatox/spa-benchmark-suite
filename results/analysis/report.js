#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { markdownTable } from 'markdown-table';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ANALYSIS_DIR = __dirname;
const DATA_FILE = path.join(ANALYSIS_DIR, 'data.json');
const REPORT_MARKDOWN = path.join(ANALYSIS_DIR, 'report.md');
const REPORT_HTML = path.join(ANALYSIS_DIR, 'index.html');
const CHARTS_DIR = path.resolve(__dirname, '..', 'charts');

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

async function readChartsDirectory() {
  try {
    const entries = await fs.readdir(CHARTS_DIR, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.png'))
      .map((entry) => entry.name);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

function sanitizeFileName(flow, metric) {
  return `${flow}-${metric}`
    .replace(/[^a-z0-9\-]+/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}

function formatValue(valueMs, metric) {
  if (valueMs === null || valueMs === undefined || !Number.isFinite(valueMs)) {
    return '—';
  }
  if (!metric.isDuration) {
    return valueMs.toFixed(2);
  }
  if (metric.displayUnit === 's') {
    return (valueMs / 1000).toFixed(2);
  }
  return valueMs.toFixed(2);
}

function unitLabel(metric) {
  if (!metric.isDuration) {
    return metric.displayUnit || '';
  }
  return metric.displayUnit || 'ms';
}

function buildMarkdownReport(analysis, chartFiles) {
  const lines = [];
  lines.push('# Performance Results');
  lines.push('');
  lines.push(
    analysis.generatedAt
      ? `Generated at: ${new Date(analysis.generatedAt).toUTCString()}`
      : `Generated at: ${new Date().toUTCString()}`
  );
  lines.push('');

  const flows = analysis.flows || {};
  const flowNames = Object.keys(flows);
  if (!flowNames.length) {
    lines.push('No summary data available.');
    return lines.join('\n');
  }

  for (const flowName of flowNames) {
    lines.push(`## Flow: ${flowName}`);
    lines.push('');
    const metrics = flows[flowName].metrics || {};
    const metricEntries = Object.entries(metrics);
    if (!metricEntries.length) {
      lines.push('No metrics available.');
      lines.push('');
      continue;
    }

    for (const [metricName, metric] of metricEntries) {
      const unit = unitLabel(metric);
      lines.push(`### ${metricName}${unit ? ` (${unit})` : ''}`);
      lines.push('');

      const header = ['Technology', 'Average', 'p95'];
      const rows = [];
      const technologies = metric.order.length
        ? metric.order
        : Object.keys(metric.technologies);

      for (const tech of technologies) {
        const entry = metric.technologies[tech] || {};
        rows.push([
          tech,
          formatValue(entry.average ?? null, metric),
          formatValue(entry.p95 ?? null, metric),
        ]);
      }

      lines.push(markdownTable([header, ...rows]));
      lines.push('');

      const expectedFile = `${sanitizeFileName(flowName, metricName)}.png`;
      if (chartFiles.includes(expectedFile)) {
        const relativePath = `../charts/${expectedFile}`;
        lines.push(`[Chart preview](${relativePath})`);
        lines.push('');
        lines.push(`![${flowName} – ${metricName}](${relativePath})`);
        lines.push('');
      }
    }
  }

  return lines.join('\n');
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHtmlReport(analysis, chartFiles) {
  const flows = analysis.flows || {};
  const flowNames = Object.keys(flows);

  const sections = flowNames.map((flowName) => {
    const metrics = flows[flowName].metrics || {};
    const metricSections = Object.entries(metrics).map(([metricName, metric]) => {
      const unit = unitLabel(metric);
      const technologies = metric.order.length
        ? metric.order
        : Object.keys(metric.technologies);
      const rows = technologies
        .map((tech) => {
          const entry = metric.technologies[tech] || {};
          const average = formatValue(entry.average ?? null, metric);
          const p95 = formatValue(entry.p95 ?? null, metric);
          return `
            <tr>
              <td>${escapeHtml(tech)}</td>
              <td>${escapeHtml(average)}</td>
              <td>${escapeHtml(p95)}</td>
            </tr>
          `;
        })
        .join('\n');

      const expectedFile = `${sanitizeFileName(flowName, metricName)}.png`;
      const hasChart = chartFiles.includes(expectedFile);
      const chartHtml = hasChart
        ? `<figure>\n  <figcaption>${escapeHtml(flowName)} – ${escapeHtml(
            metricName
          )}</figcaption>\n  <img src="../charts/${escapeHtml(expectedFile)}" alt="${escapeHtml(
            flowName
          )} – ${escapeHtml(metricName)} chart" loading="lazy" />\n</figure>`
        : '';

      return `
        <section>
          <h3>${escapeHtml(metricName)}${unit ? ` (${escapeHtml(unit)})` : ''}</h3>
          <table>
            <thead>
              <tr>
                <th>Technology</th>
                <th>Average</th>
                <th>p95</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          ${chartHtml}
        </section>
      `;
    });

    const metricsHtml = metricSections.join('\n');

    return `
      <section>
        <h2>Flow: ${escapeHtml(flowName)}</h2>
        ${metricsHtml || '<p>No metrics available.</p>'}
      </section>
    `;
  });

  const bodyContent = sections.join('\n') || '<p>No summary data available.</p>';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Performance Results</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; margin: 2rem; line-height: 1.6; }
      h1, h2, h3 { color: #2a2a2a; }
      table { border-collapse: collapse; margin-bottom: 1rem; width: 100%; }
      th, td { border: 1px solid #cccccc; padding: 0.5rem; text-align: left; }
      th { background: #f5f5f5; }
      figure { margin: 1rem 0; }
      figcaption { font-weight: bold; margin-bottom: 0.5rem; }
      img { max-width: 100%; height: auto; border: 1px solid #e0e0e0; }
    </style>
  </head>
  <body>
    <h1>Performance Results</h1>
    <p>Generated at: ${escapeHtml(
      analysis.generatedAt ? new Date(analysis.generatedAt).toUTCString() : new Date().toUTCString()
    )}</p>
    ${bodyContent}
  </body>
</html>`;
}

async function main() {
  const analysis = await loadAnalysis();
  const chartFiles = await readChartsDirectory();
  const markdown = buildMarkdownReport(analysis, chartFiles);
  const html = buildHtmlReport(analysis, chartFiles);

  await fs.writeFile(REPORT_MARKDOWN, markdown, 'utf8');
  await fs.writeFile(REPORT_HTML, html, 'utf8');

  console.log(`Markdown report saved to ${path.relative(process.cwd(), REPORT_MARKDOWN)}`);
  console.log(`HTML report saved to ${path.relative(process.cwd(), REPORT_HTML)}`);
}

main().catch((error) => {
  console.error('Failed to generate reports.');
  console.error(error);
  process.exit(1);
});
