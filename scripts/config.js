import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

export const resultsDir = path.resolve(repoRoot, 'results');

export const apps = [
  {
    tech: 'react',
    label: 'React',
    rootDir: path.resolve(repoRoot, 'react-app'),
    port: 5173,
    buildCommand: ['npm', ['run', 'build']],
    previewCommand: ['npm', ['run', 'preview', '--', '--host', '0.0.0.0', '--port']],
  },
  {
    tech: 'vue',
    label: 'Vue',
    rootDir: path.resolve(repoRoot, 'vue-app'),
    port: 5174,
    buildCommand: ['npm', ['run', 'build']],
    previewCommand: ['npm', ['run', 'preview', '--', '--host', '0.0.0.0', '--port']],
  },
  {
    tech: 'svelte',
    label: 'Svelte',
    rootDir: path.resolve(repoRoot, 'svelte-app'),
    port: 5175,
    buildCommand: ['npm', ['run', 'build']],
    previewCommand: ['npm', ['run', 'preview', '--', '--host', '0.0.0.0', '--port']],
  },
];

export const flows = [
  {
    name: 'flow-cold-start',
    modulePath: new URL('./flows/flow-cold-start.js', import.meta.url).href,
    entryPath: '/',
  },
  {
    name: 'flow-items-browse',
    modulePath: new URL('./flows/flow-items-browse.js', import.meta.url).href,
    entryPath: '/items',
  },
  {
    name: 'flow-search-and-edit',
    modulePath: new URL('./flows/flow-search-and-edit.js', import.meta.url).href,
    entryPath: '/items',
  },
  {
    name: 'flow-stress',
    modulePath: new URL('./flows/flow-stress.js', import.meta.url).href,
    entryPath: '/items',
  },
];

export const runsPerFlow = 3;

export const waits = {
  serverReadyTimeoutMs: 60_000,
  serverReadyPollIntervalMs: 1_000,
  lighthouseTimeoutMs: 90_000,
  metricPollingTimeoutMs: 30_000,
  metricPollingIntervalMs: 200,
};

export const metrics = {
  customMarks: [
    'app_start',
    'first_route_mounted',
    'items_table_first_paint',
    'filter_applied',
    'sort_applied',
    'page_changed',
    'form_submit_success',
  ],
  units: {
    defaultDuration: 'ms',
    cls: 'score',
  },
};

export function resolvePreviewCommand([command, args], port) {
  const resolvedArgs = args.map((value) => (value === '--port' ? ['--port', String(port)] : value)).flat();
  if (!resolvedArgs.includes('--port')) {
    resolvedArgs.push('--port', String(port));
  }
  return [command, resolvedArgs];
}

export function isAppConfigured(appConfig) {
  return appConfig && typeof appConfig.rootDir === 'string';
}

