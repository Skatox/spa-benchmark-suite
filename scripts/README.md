# Benchmark scripts

The `scripts/` workspace orchestrates end-to-end benchmarks for the three SPA implementations. It spins up the production preview of each framework, drives a headless browser through the critical flows, and exports the collected metrics under `../results/`.

## Dependencies
- Node.js LTS (18.x or newer)
- npm 9+
- Google Chrome or Chromium (Playwright/Chrome DevTools Protocol is used to gather traces)
- macOS, Linux, or Windows with the ability to launch headless browsers

Install the workspace dependencies once:
```bash
cd scripts
npm install
```

## Commands
- `npm run bench:react` – Build the React app, launch its preview server, execute the benchmark scenarios, and store raw metrics.
- `npm run bench:vue` – Repeat the flow for the Vue implementation.
- `npm run bench:svelte` – Repeat the flow for the Svelte implementation.
- `npm run bench:all` – Run the three suites sequentially (React → Vue → Svelte) and consolidate the results.
- `npm run results:build` – Post-process raw traces into aggregated CSV/Markdown summaries and refresh comparison charts.

Each `bench:*` command accepts the optional `--runs=<n>` flag to repeat the suite multiple times (default is 3). Use `--browser=chrome|edge|chromium` to switch the driver; the default is `chromium` bundled with Playwright.

## Flow summary
1. **Prepare** – Build the target app (or reuse an existing `dist/`), boot the preview server, and warm the cache with a no-op visit.
2. **Measure** – Launch the browser with caching disabled, navigate through the dashboard, catalog (including pagination, filtering, sorting, and the stress test), item form submission, and the detail view.
3. **Collect metrics** – Read `performance.getEntriesByName` for navigation timings, poll `window.__appMetrics.getAndReset()` for custom marks/measures, and capture Web Vitals reported by the app.
4. **Persist** – Write a timestamped folder under `../results/raw/` containing the raw JSON traces for each scenario and run.
5. **Summarise** – Merge raw data into median/percentile tables, generate per-framework comparisons, and emit Markdown + CSV under `../results/summaries/`. Charts or dashboards are emitted to `../results/reports/`.

## Metrics captured
- Navigation timings: `domContentLoaded`, `firstContentfulPaint`, `largestContentfulPaint`, `totalBlockingTime`, and `timeToInteractive` when available.
- Custom app metrics: `app_start`, `first_route_mounted`, `items_table_first_paint`, `filter_applied`, `sort_applied`, `page_changed`, `form_submit_success`, plus stress update timings.
- Web Vitals (CLS, FCP, LCP) sourced from `window.__appMetrics.webVitals`.
- Resource stats: bundle size, JS heap size, and network payloads (pulled via the Chrome DevTools Protocol).

## Results directory layout
```
results/
  raw/
    2024-03-18T21-15-00Z/
      react/
        dashboard.json
        items.json
        stress.json
        form.json
      vue/
      svelte/
  summaries/
    2024-03-18T21-15-00Z/
      overview.csv
      overview.md
      vitals.csv
  reports/
    2024-03-18T21-15-00Z/
      comparison.html
      charts/
```
`raw/` keeps the exact payloads from the browser automation runs. `summaries/` contains aggregated data ready for spreadsheets or documentation, and `reports/` stores rendered charts or HTML dashboards.
# Utility Scripts

This repository includes automation for aggregating benchmark results that live in the `results/summary` directory.

## Available commands

- `npm run results:build` – Runs the aggregation, chart generation, and report creation pipeline in sequence. The command expects summary CSV files in `results/summary/` and produces:
  - `results/analysis/combined.csv` – A wide table containing average and p95 values per metric.
  - `results/analysis/data.json` – Structured data consumed by the chart and report steps.
  - `results/charts/*.png` – Bar/line charts per flow and metric.
  - `results/analysis/report.md` and `results/analysis/index.html` – Markdown and HTML reports linking to the generated charts.
# Benchmark Scripts

These Node.js scripts orchestrate automated performance benchmarks for the SPA implementations in this repository using Playwright user flows and Lighthouse audits.

## Prerequisites

- Node.js LTS (18.x or newer is recommended)
- npm 9+
- Chrome installation available on the host (required by Lighthouse)

Install project-level dependencies and the framework-specific app dependencies before running any benchmarks:

```bash
npm install
npm run install:apps
```

The helper script `npm run install:apps` (see root `package.json`) installs dependencies for each framework app. Run it again whenever the app dependencies change.

## Configuration

All runtime options live in [`config.js`](./config.js):

- `apps`: framework descriptors (tech name, root directory, port, build/preview commands).
- `flows`: Playwright flow definitions, their module paths, and entry routes.
- `runsPerFlow`: number of repetitions per flow.
- `waits`: timeouts for server readiness, Lighthouse, and metric polling.
- `metrics`: list of custom mark names, metric units, and summary reporting controls.

Adjust these values if you need different repetition counts, ports, or flow coverage.

## Running benchmarks

Use the npm scripts defined at the repository root:

```bash
npm run bench:react
npm run bench:vue
npm run bench:svelte
npm run bench:all
```

Each command performs the following steps for the selected technology (or all of them):

1. Install dependencies (if missing), build the production bundle, and start a Vite preview server on the configured port.
2. For every flow, run the configured number of repetitions:
   - Execute the Playwright user journey.
   - Collect in-app metrics exposed through `window.__appMetrics` and `performance.getEntriesByName`.
   - Run a Lighthouse audit (FCP, LCP, TTI, TBT, CLS, Speed Index) against the route covered by the flow.
3. Persist raw measurements and compute summary statistics.

You can narrow the run from the CLI as well:

```bash
node scripts/run.js --tech react --flow flow-items-browse
```

Multiple `--tech` and `--flow` arguments are allowed.

## Output

Results are stored under `/results`:

- `results/raw/{tech}/{flow}/run-<index>.json` — raw record from each repetition.
- `results/summary/{tech}-{flow}.csv` — aggregate statistics (mean, p95, standard deviation) for every reported metric.

### Raw JSON structure

Each raw JSON file contains:

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "tech": "react",
  "flow": "flow-items-browse",
  "flow_name": "flow-items-browse",
  "run": 0,
  "run_idx": 0,
  "lighthouse": {
    "FCP": 912.36,
    "LCP": 1244.12,
    "TTI": 1588.27,
    "TBT": 34.51,
    "CLS": 0.01,
    "SpeedIndex": 1178.05
  },
  "customMetrics": {
    "app_start": 382.14,
    "first_route_mounted": 415.23,
    "items_table_first_paint": 621.41,
    "filter_applied": 188.02,
    "sort_applied": 146.45,
    "page_changed": 210.53,
    "form_submit_success": 532.09
  },
  "webVitals": {
    "FCP": 910.12,
    "LCP": 1235.88,
    "CLS": 0.01
  },
  "performanceEntries": {
    "app_start": { "duration": 382.14, "startTime": 0 }
  },
  "extraMetrics": {
    "stress_update": [
      { "name": "stress_update_1", "duration": 42.1 },
      { "name": "stress_update_2", "duration": 39.6 }
    ]
  }
}
```

### Summary CSV columns

| Column | Description |
| --- | --- |
| `metric` | Metric identifier (e.g., `FCP`, `items_table_first_paint`). |
| `source` | Origin of the metric (`lighthouse`, `custom`, `web-vitals`, `stress`). |
| `mean` | Arithmetic mean across repetitions. |
| `p95` | 95th percentile. |
| `stddev` | Sample standard deviation. |
| `unit` | `ms` for durations, `score` for unitless values such as CLS. |
| `runs` | Number of samples used in the calculation. |

## Troubleshooting

- Ensure the configured ports (React 5173, Vue 5174, Svelte 5175) are free before launching benchmarks.
- Lighthouse requires a Chrome installation available on the host system. When running in CI, install the stable channel beforehand.
- To inspect Playwright runs interactively, change the `headless` flag in [`run.js`](./run.js) to `false` and rerun the command.

