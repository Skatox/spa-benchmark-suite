# spa-benchmark-suite

A benchmark suite for comparing SPA (Single Page Application) frameworks using RealWorld App examples.

## Overview

This repository contains RealWorld App implementations for React, Vue, and Svelte, plus a reproducible benchmarking and qualitative-evaluation pipeline aligned with a Molin-style method for academic comparison.

## Structure

```
apps/
├── react/
├── vue/
└── svelte/
config/
├── benchmark.config.json      # Reproducible benchmark setup
└── molin-template.json        # Qualitative matrix template (1-5)
scripts/benchmark/
├── pipeline.js                # Quantitative capture + persistence + stats
├── stats.js                   # Descriptive statistics
├── molin.js                   # Molin matrix validation and summary
├── init-molin.js              # Creates editable Molin matrix file
└── report.js                  # Final thesis-oriented report export
results/
└── benchmark/
```

## Getting Started

### Install dependencies

```bash
npm install
npm --prefix apps/react install
npm --prefix apps/vue install
npm --prefix apps/svelte install
```

### Start all frameworks in homogeneous conditions

```bash
npm run start:all
```

## Methodological pipeline

### 1) Configure reproducible environment

Edit `config/benchmark.config.json` to define:
- browser and cache mode (`cold`/`warm`)
- network profile
- runs per scenario
- frameworks and URLs
- scenario paths

### 2) Execute quantitative benchmark

```bash
npm run benchmark:pipeline
```

This captures, per run and scenario:
- Load: FCP, LCP, TTFB, CLS
- Interaction: TTI, TBT, max-potential-FID (as input-delay equivalent)
- Resources: CPU task duration (CDP), JS heap memory (CDP), total downloaded bytes
- Metadata: framework, scenario, run number, timestamp, environment, observations

Artifacts are stored in `results/benchmark/<runId>/raw/*.json` and `aggregated.json`.

### 3) Create and fill Molin qualitative matrix (1-5)

```bash
npm run molin:init
```

Then edit `results/molin-evaluation.json` and add all criteria scores with:
- score 1..5
- mandatory textual justification
- mandatory evidence list (URLs, files, notes, quantitative references)

### 4) Generate thesis report

```bash
npm run report:thesis
```

Exports in the latest benchmark run folder:
- `thesis-report.md`
- `quantitative-summary.csv`
- `molin-summary.json`

## Validation rules implemented

- Qualitative entries are rejected if score is outside 1-5.
- Qualitative entries are rejected without justification.
- Qualitative entries are rejected without evidence.
- Report generation fails if there is no minimum quantitative data.
- Report generation fails if scenarios are incompatible across frameworks.
- Missing quantitative metrics are surfaced as validity warnings.

## Tests

```bash
npm test
```

Covers:
- descriptive statistics
- Molin justification/evidence mandatory constraints
- minimum dataset and scenario-compatibility validations
