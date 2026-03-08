const fs = require('fs');
const path = require('path');
const { validateMolinMatrix, summarizeMolin } = require('./molin');

const ROOT = path.resolve(__dirname, '..', '..');
const RESULTS_ROOT = path.join(ROOT, 'results', 'benchmark');
const MOLIN_PATH = path.join(ROOT, 'results', 'molin-evaluation.json');

function getLatestRun() {
  const latest = JSON.parse(fs.readFileSync(path.join(RESULTS_ROOT, 'latest-run.json'), 'utf8'));
  return latest.path;
}

function toMarkdownTable(headers, rows) {
  const header = `| ${headers.join(' | ')} |`;
  const separator = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
  return [header, separator, body].join('\n');
}

function hasMinimumData(aggregated) {
  return aggregated.aggregateResults && aggregated.aggregateResults.length > 0;
}

function validateScenarioCompatibility(aggregateResults) {
  const scenarioToFrameworks = new Map();
  for (const row of aggregateResults) {
    if (!scenarioToFrameworks.has(row.scenario)) scenarioToFrameworks.set(row.scenario, new Set());
    scenarioToFrameworks.get(row.scenario).add(row.framework);
  }

  const counts = [...scenarioToFrameworks.values()].map((set) => set.size);
  const expected = counts[0] || 0;
  return counts.every((count) => count === expected);
}

function buildReport(aggregated, molinMatrix, molinSummary, molinErrors, warnings) {
  const quantitativeRows = [];
  for (const row of aggregated.aggregateResults) {
    quantitativeRows.push([
      row.framework,
      row.scenario,
      row.stats.fcpMs.mean?.toFixed(2) ?? 'n/a',
      row.stats.lcpMs.mean?.toFixed(2) ?? 'n/a',
      row.stats.ttfbMs.mean?.toFixed(2) ?? 'n/a',
      row.stats.ttiMs.mean?.toFixed(2) ?? 'n/a',
      row.stats.tbtMs.mean?.toFixed(2) ?? 'n/a',
      row.stats.cpuTaskDurationMs.mean?.toFixed(2) ?? 'n/a',
      row.stats.jsHeapUsedBytes.mean?.toFixed(0) ?? 'n/a',
      row.stats.downloadBytes.mean?.toFixed(0) ?? 'n/a',
    ]);
  }

  const molinRows = molinSummary.map((row) => [row.framework, String(row.criteriaCount), String(row.averageScore)]);

  return `# SPA Benchmark + Molin Report\n\n## Cuantitativo\n${toMarkdownTable(
    ['Framework', 'Escenario', 'FCP(ms)', 'LCP(ms)', 'TTFB(ms)', 'TTI(ms)', 'TBT(ms)', 'CPU task(ms)', 'Heap usado(bytes)', 'Descarga(bytes)'],
    quantitativeRows
  )}\n\n## Cualitativo (Molin)\n${toMarkdownTable(['Framework', 'Criterios', 'Promedio 1-5'], molinRows)}\n\n## Advertencias de validez\n${warnings.concat(molinErrors).map((w) => `- ${w}`).join('\n') || '- Sin advertencias'}\n\n## Separación metodológica\n- Métricas automáticas: resultados en \`results/benchmark/<runId>/raw\` y \`aggregated.json\`.\n- Juicio experto: matriz Molin en \`results/molin-evaluation.json\`.\n`;
}

function main() {
  const runPath = getLatestRun();
  const aggregatedPath = path.join(runPath, 'aggregated.json');
  const aggregated = JSON.parse(fs.readFileSync(aggregatedPath, 'utf8'));

  if (!hasMinimumData(aggregated)) {
    throw new Error('No se puede generar comparación sin datos mínimos.');
  }

  const warnings = [];
  if (!validateScenarioCompatibility(aggregated.aggregateResults)) {
    throw new Error('No se pueden mezclar resultados de escenarios incompatibles.');
  }

  const missingMetricRows = aggregated.aggregateResults.filter((row) => Object.values(row.stats).some((stat) => stat.n === 0));
  if (missingMetricRows.length) {
    warnings.push('Se detectaron métricas faltantes en algunos escenarios/frameworks.');
  }

  const molinMatrix = JSON.parse(fs.readFileSync(MOLIN_PATH, 'utf8'));
  const molinErrors = validateMolinMatrix(molinMatrix);
  const molinSummary = summarizeMolin(molinMatrix);

  const reportMd = buildReport(aggregated, molinMatrix, molinSummary, molinErrors, warnings);
  const reportPath = path.join(runPath, 'thesis-report.md');
  fs.writeFileSync(reportPath, reportMd);

  const csvRows = ['framework,scenario,fcp_mean,lcp_mean,ttfb_mean,tti_mean,tbt_mean,cpu_mean,heap_mean,download_mean'];
  for (const row of aggregated.aggregateResults) {
    csvRows.push([
      row.framework,
      row.scenario,
      row.stats.fcpMs.mean ?? '',
      row.stats.lcpMs.mean ?? '',
      row.stats.ttfbMs.mean ?? '',
      row.stats.ttiMs.mean ?? '',
      row.stats.tbtMs.mean ?? '',
      row.stats.cpuTaskDurationMs.mean ?? '',
      row.stats.jsHeapUsedBytes.mean ?? '',
      row.stats.downloadBytes.mean ?? '',
    ].join(','));
  }
  fs.writeFileSync(path.join(runPath, 'quantitative-summary.csv'), `${csvRows.join('\n')}\n`);
  fs.writeFileSync(path.join(runPath, 'molin-summary.json'), JSON.stringify(molinSummary, null, 2));

  console.log(`Report generated: ${reportPath}`);
}

if (require.main === module) {
  main();
}

module.exports = { hasMinimumData, validateScenarioCompatibility, buildReport };
