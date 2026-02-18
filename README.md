# spa-benchmark-suite

A benchmark suite for comparing SPA (Single Page Application) frameworks using RealWorld App examples.

## Overview

This repository contains RealWorld App implementations for React, Vue, and Svelte to facilitate performance benchmarking and comparison between these popular SPA frameworks.

## Structure

```
apps/
├── react/      - React implementation
├── vue/        - Vue implementation
└── svelte/     - Svelte implementation
```

Each subfolder in `apps/` contains a standalone implementation of the RealWorld SPA for its respective framework.

## Getting Started

### Cloning the Repository

To clone this repository with all submodules:

```bash
git clone --recursive https://github.com/Skatox/spa-benchmark-suite.git
```

Or if you've already cloned the repository:

```bash
git submodule update --init --recursive
```

### Running the Examples

#### React
```bash
cd apps/react
npm install
npm run dev -- --host --port 3000
```

#### Vue
```bash
cd apps/vue
npm install
npm run dev -- --host --port 3001
```

#### Svelte
```bash
cd apps/svelte
npm install
npm run dev -- --host --port 3002
```

### Running all apps together

From the repository root, you can start all three examples at once using npm scripts defined in the top-level `package.json`:

```bash
npm install
npm run start:all
```

Each app runs on its own port (`react`: 3000, `vue`: 3001, `svelte`: 3002) so they won't conflict with one another.

## Benchmarking

Each RealWorld App implementation provides the same functionality, making them ideal for performance comparisons. You can benchmark:

- Initial load time
- Runtime performance
- Bundle size
- Memory usage
- And more...

### Lighthouse + Excel report for multiple runs

From the repository root you can run multiple benchmark batches and generate a timestamped Excel file:

```bash
npm install
npm run benchmark:multi -- --iterations 3 --runs 5
```

This runs Lighthouse for each framework in every iteration and then generates a file like:

```text
results/lighthouse/benchmark-report-YYYY-MM-DDTHH-mm-ss-sssZ.xls
```

The Excel file includes:

- `raw-runs`: one row per Lighthouse run (across all iterations).
- `framework-averages`: averages per framework to help with decision-making.
- `execution-meta`: metadata for each execution (generated/skipped files, bundle size).

## License

See individual submodules for their respective licenses.
