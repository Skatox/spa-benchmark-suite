const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const RESULTS_DIR = path.resolve(__dirname, '../results/lighthouse');
const LIGHTHOUSE_SCRIPT = path.resolve(__dirname, './run-lighthouse.js');

function parseArgs(argv) {
  const args = { iterations: 3, runs: 5 };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--iterations') {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error('The value for --iterations must be a positive integer.');
      }
      args.iterations = Math.floor(value);
      i += 1;
      continue;
    }

    if (arg === '--runs') {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error('The value for --runs must be a positive integer.');
      }
      args.runs = Math.floor(value);
      i += 1;
    }
  }

  return args;
}

function compactTimestamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-');
}

function runNodeScript(scriptPath, scriptArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...scriptArgs], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
      env: { ...process.env },
    });

    child.on('error', (error) => reject(error));
    child.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`The process exited with code ${code}`));
        return;
      }
      resolve();
    });
  });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function toNumber(value) {
  if (typeof value === 'number') {
    return value;
  }
  return null;
}

function parseLighthouseMetrics(reportPath) {
  const report = readJson(reportPath);
  const categories = report.categories || {};
  const audits = report.audits || {};

  return {
    performanceScore: toNumber(categories.performance && categories.performance.score),
    fcpMs: toNumber(audits['first-contentful-paint'] && audits['first-contentful-paint'].numericValue),
    lcpMs: toNumber(audits['largest-contentful-paint'] && audits['largest-contentful-paint'].numericValue),
    speedIndexMs: toNumber(audits['speed-index'] && audits['speed-index'].numericValue),
    tbtMs: toNumber(audits['total-blocking-time'] && audits['total-blocking-time'].numericValue),
    cls: toNumber(audits['cumulative-layout-shift'] && audits['cumulative-layout-shift'].numericValue),
  };
}

function average(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (valid.length === 0) {
    return null;
  }
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toSheetXml(name, rows) {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const headerRow = `<Row>${headers
    .map((header) => `<Cell><Data ss:Type="String">${xmlEscape(header)}</Data></Cell>`)
    .join('')}</Row>`;

  const dataRows = rows
    .map((row) => {
      const cells = headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) {
            return '<Cell><Data ss:Type="String"></Data></Cell>';
          }
          if (typeof value === 'number' && Number.isFinite(value)) {
            return `<Cell><Data ss:Type="Number">${value}</Data></Cell>`;
          }
          return `<Cell><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`;
        })
        .join('');
      return `<Row>${cells}</Row>`;
    })
    .join('');

  return `<Worksheet ss:Name="${xmlEscape(name)}"><Table>${headerRow}${dataRows}</Table></Worksheet>`;
}

function createWorkbookXml(rows, metadataRows) {
  const grouped = new Map();
  for (const row of rows) {
    const key = row.framework;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(row);
  }

  const averages = [];
  for (const [framework, frameworkRows] of grouped.entries()) {
    averages.push({
      framework,
      samples: frameworkRows.length,
      avgPerformanceScore: average(frameworkRows.map((item) => item.performanceScore)),
      avgFcpMs: average(frameworkRows.map((item) => item.fcpMs)),
      avgLcpMs: average(frameworkRows.map((item) => item.lcpMs)),
      avgSpeedIndexMs: average(frameworkRows.map((item) => item.speedIndexMs)),
      avgTbtMs: average(frameworkRows.map((item) => item.tbtMs)),
      avgCls: average(frameworkRows.map((item) => item.cls)),
    });
  }

  return `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
${toSheetXml('raw-runs', rows)}
${toSheetXml('framework-averages', averages)}
${toSheetXml('execution-meta', metadataRows)}
</Workbook>`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  fs.mkdirSync(RESULTS_DIR, { recursive: true });

  const batchRootId = compactTimestamp();
  const allRows = [];
  const metadataRows = [];

  for (let iteration = 1; iteration <= options.iterations; iteration += 1) {
    const batchId = `${batchRootId}-iter-${iteration}`;
    console.log(`\n=== Run ${iteration}/${options.iterations} (batch ${batchId}) ===`);

    await runNodeScript(LIGHTHOUSE_SCRIPT, ['--batch-id', batchId, '--runs', String(options.runs)]);

    const summaryPath = path.join(RESULTS_DIR, `summary-${batchId}.json`);
    if (!fs.existsSync(summaryPath)) {
      throw new Error(`Expected summary was not found: ${summaryPath}`);
    }

    const summary = readJson(summaryPath);

    for (const appSummary of summary.summary || []) {
      for (const reportPath of appSummary.outputFiles || []) {
        if (!fs.existsSync(reportPath)) {
          continue;
        }
        const metrics = parseLighthouseMetrics(reportPath);
        allRows.push({
          batchId,
          framework: appSummary.name,
          reportPath,
          ...metrics,
        });
      }

      metadataRows.push({
        batchId,
        framework: appSummary.name,
        generatedReports: appSummary.generated,
        skippedReports: appSummary.skipped,
        bundleBytes: appSummary.bundleSize ? appSummary.bundleSize.bytes : null,
        bundlePretty: appSummary.bundleSize ? appSummary.bundleSize.pretty : null,
      });
    }
  }

  if (allRows.length === 0) {
    throw new Error('No Lighthouse reports could be collected to generate the Excel file.');
  }

  const excelTimestamp = compactTimestamp();
  const excelPath = path.join(RESULTS_DIR, `benchmark-report-${excelTimestamp}.xls`);
  const workbookXml = createWorkbookXml(allRows, metadataRows);
  fs.writeFileSync(excelPath, workbookXml, 'utf8');

  if (!fs.existsSync(excelPath)) {
    throw new Error(`The Excel file was not created correctly: ${excelPath}`);
  }

  console.log(`\nExcel file generated successfully: ${excelPath}`);
  console.log(`Total rows (raw-runs): ${allRows.length}`);
}

main().catch((error) => {
  console.error(`Error in multi benchmark: ${error.message}`);
  process.exit(1);
});
