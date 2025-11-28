const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const APPS = [
  { name: 'react', path: path.resolve(__dirname, '../apps/react'), port: 3000 },
  { name: 'vue', path: path.resolve(__dirname, '../apps/vue'), port: 3001 },
  { name: 'svelte', path: path.resolve(__dirname, '../apps/svelte'), port: 3002 },
];

const LIGHTHOUSE_RUNS = 5;
const RESULTS_DIR = path.resolve(__dirname, '../results/lighthouse');
const LIGHTHOUSE_BIN = path.resolve(__dirname, '../node_modules/.bin/lighthouse');
const SERVER_READY_TIMEOUT_MS = 20000;
const SERVER_POLL_INTERVAL_MS = 500;
const SHUTDOWN_GRACE_MS = 500;

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
    'Lighthouse no se encontró en node_modules/.bin. Se usará "npx lighthouse". ' +
      'Instala la dependencia con "npm install --save-dev lighthouse" para evitar descargas en cada ejecución.'
  );
  return { command: 'npx lighthouse', usingLocal: false };
}

async function runLighthouse(app, lighthouseCommand) {
  let generated = 0;
  for (let i = 1; i <= LIGHTHOUSE_RUNS; i += 1) {
    const outputPath = path.join(RESULTS_DIR, `${app.name}-run-${i}.json`);
    const url = `http://localhost:${app.port}/`;
    const command = `${lighthouseCommand} ${url} --quiet --chrome-flags="--headless" --output=json --output-path="${outputPath}"`;
    await runCommand(process.cwd(), command);
    generated += 1;
  }
  return generated;
}

async function main() {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  const summary = [];
  const { command: lighthouseCommand, usingLocal } = resolveLighthouseCommand();

  if (usingLocal) {
    console.log(`Usando binario local de Lighthouse en ${LIGHTHOUSE_BIN}`);
  }

  for (const app of APPS) {
    console.log(`\n=== Procesando ${app.name} ===`);
    let serverProcess;
    let generated = 0;

    try {
      console.log(`Construyendo ${app.name}...`);
      await runCommand(app.path, 'npm run build');

      console.log(`Levantando servidor de preview para ${app.name}...`);
      serverProcess = spawn('npm', ['run', 'dev'], { cwd: app.path, stdio: 'inherit' });

      await waitForServer(app.port);
      console.log(`Servidor listo en http://localhost:${app.port}/`);

      generated = await runLighthouse(app, lighthouseCommand);
      console.log(`${app.name}: se generaron ${generated} archivos JSON en ${RESULTS_DIR}`);
    } catch (error) {
      console.error(`Error procesando ${app.name}: ${error.message}`);
    } finally {
      if (serverProcess) {
        serverProcess.kill();
        await new Promise((resolve) => setTimeout(resolve, SHUTDOWN_GRACE_MS));
        if (!serverProcess.killed) {
          serverProcess.kill('SIGKILL');
        }
      }
    }

    summary.push({ name: app.name, generated });
  }

  console.log('\nResumen de Lighthouse:');
  for (const item of summary) {
    if (item.generated > 0) {
      console.log(`- ${item.name}: se generaron ${item.generated} archivos JSON en ${RESULTS_DIR}`);
    } else {
      console.log(`- ${item.name}: no se generaron archivos (ver errores anteriores)`);
    }
  }
}

main().catch((error) => {
  console.error(`Error inesperado: ${error.message}`);
  process.exit(1);
});
