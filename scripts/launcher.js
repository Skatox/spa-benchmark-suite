import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

import { resolvePreviewCommand, waits } from './config.js';

function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      ...options,
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

async function ensureDependencies(rootDir) {
  const nodeModules = path.join(rootDir, 'node_modules');
  try {
    await fs.access(nodeModules);
  } catch {
    await runCommand('npm', ['install'], { cwd: rootDir });
  }
}

export async function buildApp(appConfig) {
  await ensureDependencies(appConfig.rootDir);
  await runCommand(appConfig.buildCommand[0], appConfig.buildCommand[1], { cwd: appConfig.rootDir });
}

async function waitForServer(url) {
  const deadline = Date.now() + waits.serverReadyTimeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) {
        return;
      }
    } catch (error) {
      if (process.env.DEBUG) {
        console.debug('Server check failed', error);
      }
    }
    await sleep(waits.serverReadyPollIntervalMs);
  }
  throw new Error(`Server did not become ready at ${url} within ${waits.serverReadyTimeoutMs}ms`);
}

export async function launchPreview(appConfig) {
  const [command, argsTemplate] = resolvePreviewCommand(appConfig.previewCommand, appConfig.port);
  const previewProcess = spawn(command, argsTemplate, {
    cwd: appConfig.rootDir,
    stdio: ['ignore', 'inherit', 'inherit'],
  });

  const baseURL = `http://127.0.0.1:${appConfig.port}`;
  try {
    await waitForServer(baseURL);
  } catch (error) {
    previewProcess.kill('SIGTERM');
    throw error;
  }

  return {
    baseURL,
    async close() {
      if (!previewProcess.killed) {
        previewProcess.kill('SIGTERM');
        await sleep(500);
      }
    },
  };
}

