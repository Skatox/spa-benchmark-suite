# Svelte SPA benchmark app

## Requirements
- Node.js LTS (18.x or newer)
- npm 9+ (or pnpm/yarn)

## Available scripts
Run the commands from the `svelte-app/` directory:

- `npm run dev` – Start the Vite dev server (defaults to port 5175) with hot reloading.
- `npm run build` – Compile the production bundle into `dist/`.
- `npm run preview` – Serve the production build locally.
- `npm run lint` – Lint Svelte components and utilities with ESLint + svelte-check.
- `npm run test` – Execute the Vitest suite.
- `npm run start:prod` – Build and preview in a single step for production-like smoke tests.

## Routes and key flows
- `/` **Dashboard** – Renders KPI cards and a category snapshot chart, refreshing summary data and emitting `first_route_mounted` once mounted.
- `/items` **Catalog** – Shows the paginated 1,000-row table with debounced search, category filter, sorting controls, CRUD actions, and the stress test routine that seeds 500 temporary records before running 20 rapid updates.
- `/items/new` **Create item** – Form validations ensure name, price, rating, stock, and description constraints; successful submissions log `form_submit_success` and redirect to the catalog.
- `/items/:id/edit` **Edit item** – Prefills the form through the mock API and persists updates with identical validation and instrumentation.
- `/items/:id` **Item detail** – Displays KPI cards, metadata fields, and a mini bar chart summarising the item distribution.
- `/about` **About** – Static documentation describing stack decisions and instrumentation guidelines.

## Performance instrumentation
- `src/utils/perf.ts` exposes the `METRICS` constants plus helpers that wrap `performance.mark`/`performance.measure`, buffer entries into `window.__appMetrics`, and capture CLS/FCP/LCP with `web-vitals`.
- `src/main.ts` (or `main.tsx` depending on setup) marks `app_start`, registers the performance observer prior to mounting the Svelte app, and initialises Web Vitals collection.
- Svelte stores and components call the helpers to emit `items_table_first_paint`, `filter_applied`, `sort_applied`, `page_changed`, and `form_submit_success` during user flows, including stress updates.

### Inspecting metrics during a run
1. Use `performance.getEntriesByName('page_changed')` from devtools to inspect pagination timings.
2. Invoke `window.__appMetrics.getAndReset()` to export the buffered JSON payloads.
3. Check `window.__appMetrics.webVitals` to observe CLS/FCP/LCP values gathered via `web-vitals`.
4. Filter the console by `__METRIC__` to follow structured logs emitted for every measurement.
