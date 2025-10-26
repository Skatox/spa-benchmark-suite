# React SPA benchmark app

## Requirements
- Node.js LTS (18.x or newer)
- npm 9+ (or a compatible package manager)

## Available scripts
Run the commands from the `react-app/` directory:

- `npm run dev` – Start the Vite development server (hot module replacement on port 5173).
- `npm run build` – Produce the production bundle in `dist/`.
- `npm run preview` – Serve the production build locally to validate deployment artefacts.
- `npm run lint` – Lint the TypeScript and JSX sources with the project ESLint configuration.
- `npm run test` – Execute the Vitest unit suite.
- `npm run start:prod` – Convenience command that runs `build` and then `preview`.

## Routes and key flows
- `/` **Dashboard** – Loads KPI cards and a category snapshot mini bar chart. Triggers `first_route_mounted` once the first view is ready and refreshes the catalog summary on mount.
- `/items` **Catalog** – Renders the 1,000-row table with pagination, 300 ms debounced search, category and sort controls, CRUD action buttons, and a “Stress test” mode that seeds 500 temporary records before performing 20 rapid state updates.
- `/items/new` **Create item** – Form with validation for title, category, price, rating, stock, and description. On success it emits `form_submit_success` and returns to the catalog.
- `/items/:id/edit` **Edit item** – Prefills the same form using the mock API and persists updates with identical validation rules.
- `/items/:id` **Item detail** – Shows KPI cards, metadata fields, and a mini bar chart summarising rating, gap to five stars, and normalised price.
- `/about` **About** – Static copy that documents the stack, data model, and instrumentation strategy.

## Performance instrumentation
- `src/utils/perf.ts` centralises all metric helpers (`mark`, `measure`, `registerPerformanceObservers`, `captureWebVitals`) and exposes the `METRICS` constants shared across routes. It writes structured payloads to `window.__appMetrics.buffer` and mirrors Web Vitals in `window.__appMetrics.webVitals`.
- `src/main.tsx` marks `app_start`, registers observers, and bootstraps Web Vitals collection before mounting React.
- Feature code (e.g., the catalog store and form route) wraps significant flows with `mark`/`measure` to emit `items_table_first_paint`, `filter_applied`, `sort_applied`, `page_changed`, and `form_submit_success`.

### Inspecting metrics during a run
1. Open the browser devtools console and call `performance.getEntriesByName('items_table_first_paint')` to read the latest `PerformanceEntry`.
2. Access `window.__appMetrics.getAndReset()` to retrieve the buffered JSON payloads that the benchmark scripts consume.
3. Web Vitals values (CLS, FCP, LCP) surface under `window.__appMetrics.webVitals` once `captureWebVitals()` resolves.
4. Every measurement is also printed as `console.log(JSON.stringify({ "__METRIC__": true, ... }))`, making it easy to filter logs by searching for `__METRIC__`.
