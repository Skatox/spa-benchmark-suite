# Utility Scripts

This repository includes automation for aggregating benchmark results that live in the `results/summary` directory.

## Available commands

- `npm run results:build` – Runs the aggregation, chart generation, and report creation pipeline in sequence. The command expects summary CSV files in `results/summary/` and produces:
  - `results/analysis/combined.csv` – A wide table containing average and p95 values per metric.
  - `results/analysis/data.json` – Structured data consumed by the chart and report steps.
  - `results/charts/*.png` – Bar/line charts per flow and metric.
  - `results/analysis/report.md` and `results/analysis/index.html` – Markdown and HTML reports linking to the generated charts.
