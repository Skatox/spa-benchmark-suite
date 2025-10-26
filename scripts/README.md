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
