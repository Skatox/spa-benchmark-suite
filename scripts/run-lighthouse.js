const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const APPS = [
  {
    name: 'react',
    path: path.resolve(__dirname, '../apps/react'),
    port: 3000,
    npmPackage: 'react',
    github: { owner: 'facebook', repo: 'react' },
  },
  {
    name: 'vue',
    path: path.resolve(__dirname, '../apps/vue'),
    port: 3001,
    npmPackage: 'vue',
    github: { owner: 'vuejs', repo: 'core' },
  },
  {
    name: 'svelte',
    path: path.resolve(__dirname, '../apps/svelte'),
    port: 3002,
    npmPackage: 'svelte',
    github: { owner: 'sveltejs', repo: 'svelte' },
  },
];

const LIGHTHOUSE_RUNS = 5;
const RESULTS_DIR = path.resolve(__dirname, '../results/lighthouse');
const LIGHTHOUSE_BIN = path.resolve(__dirname, '../node_modules/.bin/lighthouse');
const REUSE_EXISTING_RUNS = process.argv.includes('--reuse-existing');
const SERVER_READY_TIMEOUT_MS = 20000;
const SERVER_POLL_INTERVAL_MS = 500;
const SHUTDOWN_GRACE_MS = 500;
const FRAMEWORK_STATS_PATH = path.join(RESULTS_DIR, 'framework-stats.json');

function parseArgs(argv) {
  const args = { batchId: null, runs: LIGHTHOUSE_RUNS };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--batch-id') {
      args.batchId = argv[i + 1] || null;
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

function resolveNpmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function runCommand(cwd, command) {
  return new Promise((resolve, reject) => {
    const child = exec(command, { cwd, shell: true }, (error, stdout, stderr) => {
      if (stdout) {
        process.stdout.write(stdout);
      }
      if (stderr) {
        process.stderr.write(stderr);
      }
      if (error) {
        reject(new Error(`Command failed: ${command} (code ${error.code || 'unknown'})`));
        return;
      }
      resolve();
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to start command '${command}': ${err.message}`));
    });
  });
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) {
    return 'n/a';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value < 10 && unitIndex > 0 ? 2 : 1)} ${units[unitIndex]}`;
}

function getDirectorySize(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return 0;
  }
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    return stat.size;
  }
  if (stat.isDirectory()) {
    return fs.readdirSync(targetPath).reduce((total, entry) => {
      const entryPath = path.join(targetPath, entry);
      return total + getDirectorySize(entryPath);
    }, 0);
  }
  return 0;
}

function getBundleSize(app) {
  const distPath = path.join(app.path, 'dist');
  const bytes = getDirectorySize(distPath);
  return {
    bytes,
    pretty: formatBytes(bytes),
    distPath,
  };
}

function fetchJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'spa-benchmark-suite',
          Accept: 'application/json',
          ...headers,
        },
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`Request failed ${res.statusCode}: ${url}`));
            return;
          }
          try {
            resolve({ json: JSON.parse(data), headers: res.headers });
          } catch (error) {
            reject(new Error(`Failed to parse JSON from ${url}: ${error.message}`));
          }
        });
      }
    );
    req.on('error', (error) => reject(error));
  });
}

async function getNpmDownloads(packageName) {
  const url = `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(packageName)}`;
  const { json } = await fetchJson(url);
  return json && typeof json.downloads === 'number' ? json.downloads : null;
}

function parseLinkHeader(linkHeader) {
  if (!linkHeader) {
    return {};
  }
  return linkHeader.split(',').reduce((acc, part) => {
    const match = part.match(/<([^>]+)>;\s*rel=\"([^\"]+)\"/);
    if (match) {
      acc[match[2]] = match[1];
    }
    return acc;
  }, {});
}

async function getGithubRepoStats({ owner, repo }) {
  const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const { json: repoJson } = await fetchJson(repoUrl);
  const stars = repoJson && typeof repoJson.stargazers_count === 'number' ? repoJson.stargazers_count : null;
  const forks = repoJson && typeof repoJson.forks_count === 'number' ? repoJson.forks_count : null;
  const defaultBranch = repoJson && repoJson.default_branch ? repoJson.default_branch : 'main';

  const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1&sha=${encodeURIComponent(
    defaultBranch
  )}`;
  const { json: commitsJson, headers } = await fetchJson(commitsUrl);
  const linkMap = parseLinkHeader(headers.link);
  let commits = null;
  if (linkMap.last) {
    const match = linkMap.last.match(/[?&]page=(\d+)/);
    commits = match ? Number(match[1]) : null;
  } else if (Array.isArray(commitsJson)) {
    commits = commitsJson.length;
  }

  return { stars, forks, commits, repo: `${owner}/${repo}` };
}

async function ensureDependencies(app) {
  const nodeModulesPath = path.join(app.path, 'node_modules');
  const lockPath = path.join(app.path, 'package-lock.json');
  const npmCommand = resolveNpmCommand();

  async function installDependencies() {
    if (fs.existsSync(lockPath)) {
      try {
        await runCommand(app.path, `${npmCommand} ci`);
        return;
      } catch (error) {
        console.warn(`${app.name}: npm ci failed, trying npm install...`);
      }
    }

    await runCommand(app.path, `${npmCommand} install`);
  }

  if (fs.existsSync(nodeModulesPath)) {
    try {
      await runCommand(app.path, `${npmCommand} ls --depth=0 --silent`);
      return;
    } catch (error) {
      console.warn(`Incomplete dependencies for ${app.name}. Reinstalling...`);
    }
  }

  console.log(`Installing dependencies for ${app.name}...`);
  await installDependencies();
}

function waitForServer(port, timeoutMs = SERVER_READY_TIMEOUT_MS) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    function check() {
      const req = http.get({ host: 'localhost', port, path: '/' }, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 500) {
          resolve();
        } else {
          retry();
        }
      });

      req.on('error', retry);
      req.end();
    }

    function retry() {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Server on port ${port} did not respond within ${timeoutMs}ms`));
        return;
      }
      setTimeout(check, SERVER_POLL_INTERVAL_MS);
    }

    check();
  });
}

function resolveLighthouseCommand() {
  if (fs.existsSync(LIGHTHOUSE_BIN)) {
    return { command: `"${LIGHTHOUSE_BIN}"`, usingLocal: true };
  }

  console.warn(
    'Lighthouse was not found in node_modules/.bin. "npx lighthouse" will be used. ' +
      'Install the dependency with "npm install --save-dev lighthouse" to avoid downloads on every run.'
  );
  return { command: 'npx lighthouse', usingLocal: false };
}

function buildRunOutputPath(appName, runIndex, batchId) {
  const suffix = batchId ? `${batchId}-run-${runIndex}` : `run-${runIndex}`;
  return path.join(RESULTS_DIR, `${appName}-${suffix}.json`);
}

async function runLighthouse(app, lighthouseCommand, options) {
  let generated = 0;
  let skipped = 0;
  const outputFiles = [];
  for (let i = 1; i <= options.runs; i += 1) {
    const outputPath = buildRunOutputPath(app.name, i, options.batchId);
    outputFiles.push(outputPath);
    if (fs.existsSync(outputPath)) {
      if (REUSE_EXISTING_RUNS) {
        console.log(`${app.name}: el archivo ${path.basename(outputPath)} ya existe, se omite esta corrida.`);
        skipped += 1;
        continue;
      }
      fs.unlinkSync(outputPath);
      console.log(`${app.name}: se elimina ${path.basename(outputPath)} para recalcular la corrida ${i}.`);
    }
    const url = `http://localhost:${app.port}/`;
    const command = `${lighthouseCommand} ${url} --quiet --chrome-flags="--headless" --output=json --output-path="${outputPath}"`;
    await runCommand(process.cwd(), command);
    generated += 1;
  }
  return { generated, skipped, outputFiles };
}

function loadFrameworkStats() {
  if (!fs.existsSync(FRAMEWORK_STATS_PATH)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(FRAMEWORK_STATS_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn(`Could not read ${FRAMEWORK_STATS_PATH}, history will be reset.`);
    return [];
  }
}

function saveFrameworkStats(stats) {
  fs.writeFileSync(FRAMEWORK_STATS_PATH, JSON.stringify(stats, null, 2));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  const summary = [];
  const { command: lighthouseCommand, usingLocal } = resolveLighthouseCommand();
  const frameworkStats = loadFrameworkStats();

  if (usingLocal) {
    console.log(`Using local Lighthouse binary at ${LIGHTHOUSE_BIN}`);
  }

  if (REUSE_EXISTING_RUNS) {
    console.log('Modo de reutilización activo: se conservan resultados Lighthouse existentes.');
  } else {
    console.log('Modo limpio activo: los JSON Lighthouse existentes se reemplazarán para evitar mezclar mediciones antiguas.');
  }

  for (const app of APPS) {
    console.log(`\n=== Processing ${app.name} ===`);
    let serverProcess;
    let generated = 0;
    let skipped = 0;
    let bundleSize;
    let npmDownloads = null;
    let githubStats = null;

    try {
      await ensureDependencies(app);
      console.log(`Building ${app.name}...`);
      await runCommand(app.path, 'npm run build');
      bundleSize = getBundleSize(app);
      console.log(`${app.name}: bundle at ${bundleSize.distPath} (${bundleSize.pretty})`);

      try {
        npmDownloads = await getNpmDownloads(app.npmPackage);
      } catch (error) {
        console.warn(`${app.name}: could not fetch npm downloads (${error.message})`);
      }

      try {
        githubStats = await getGithubRepoStats(app.github);
      } catch (error) {
        console.warn(`${app.name}: could not fetch GitHub stats (${error.message})`);
      }

      console.log(`Starting preview server for ${app.name} on port ${app.port}...`);
      serverProcess = spawn(resolveNpmCommand(), ['run', 'preview', '--', '--host', '0.0.0.0', '--port', String(app.port)], {
        cwd: app.path,
        stdio: 'inherit',
        env: { ...process.env },
      });

      await waitForServer(app.port);
      console.log(`Server ready at http://localhost:${app.port}/`);

      let outputFiles = [];
      ({ generated, skipped, outputFiles } = await runLighthouse(app, lighthouseCommand, options));
      console.log(`${app.name}: generated ${generated} JSON files in ${RESULTS_DIR}`);

      summary.push({
        name: app.name,
        generated,
        skipped,
        bundleSize,
        npmDownloads,
        githubStats,
        outputFiles,
      });
    } catch (error) {
      console.error(`Error processing ${app.name}: ${error.message}`);
      summary.push({
        name: app.name,
        generated,
        skipped,
        bundleSize,
        npmDownloads,
        githubStats,
        outputFiles: [],
      });
    } finally {
      if (serverProcess) {
        serverProcess.kill();
        await new Promise((resolve) => setTimeout(resolve, SHUTDOWN_GRACE_MS));
        if (!serverProcess.killed) {
          serverProcess.kill('SIGKILL');
        }
      }
    }

    if (bundleSize) {
      frameworkStats.push({
        framework: app.name,
        timestamp: new Date().toISOString(),
        bundleBytes: bundleSize.bytes,
        bundlePretty: bundleSize.pretty,
        distPath: bundleSize.distPath,
        npmPackage: app.npmPackage,
        npmDownloads,
        github: githubStats,
      });
    }

  }

  saveFrameworkStats(frameworkStats);

  const summaryTimestamp = new Date().toISOString();
  const summaryLabel = options.batchId || summaryTimestamp.replace(/[:.]/g, '-');
  const summaryPath = path.join(RESULTS_DIR, `summary-${summaryLabel}.json`);
  fs.writeFileSync(
    summaryPath,
    JSON.stringify(
      {
        timestamp: summaryTimestamp,
        batchId: options.batchId,
        runsPerApp: options.runs,
        resultsDir: RESULTS_DIR,
        summary,
      },
      null,
      2
    )
  );

  console.log('\nLighthouse summary:');
  for (const item of summary) {
    if (item.generated > 0 || item.skipped > 0) {
      const skippedMessage = item.skipped > 0 ? `, skipped ${item.skipped} existing` : '';
      console.log(`- ${item.name}: generated ${item.generated} JSON files${skippedMessage} in ${RESULTS_DIR}`);
      continue;
    }
    console.log(`- ${item.name}: no files generated (see previous errors)`);
  }

  console.log('\nBundle and repository summary:');
  for (const item of summary) {
    const bundleLabel = item.bundleSize ? item.bundleSize.pretty : 'n/a';
    const npmLabel = typeof item.npmDownloads === 'number' ? item.npmDownloads.toLocaleString('en-US') : 'n/a';
    const githubLabel =
      item.githubStats && typeof item.githubStats.stars === 'number'
        ? `${item.githubStats.repo} (stars ${item.githubStats.stars}, forks ${item.githubStats.forks}, commits ${item.githubStats.commits ?? 'n/a'})`
        : 'n/a';
    console.log(`- ${item.name}: bundle ${bundleLabel}, npm downloads (30d) ${npmLabel}, GitHub ${githubLabel}`);
  }

  console.log(`\nSummary saved to: ${summaryPath}`);
}

main().catch((error) => {
  console.error(`Error inesperado: ${error.message}`);
  process.exit(1);
});
