# Vue SPA benchmark app

## Requirements
- Node.js LTS (18.x or newer)
- npm 9+ or pnpm/yarn with equivalent scripts support

## Available scripts
Run the commands from the `vue-app/` directory:

- `npm run dev` – Launch the Vite dev server on port 5174 with hot module replacement.
- `npm run build` – Generate the production bundle inside `dist/`.
- `npm run preview` – Serve the production build locally for smoke tests.
- `npm run lint` – Lint Vue SFCs and supporting TypeScript utilities via ESLint.
- `npm run test` – Execute the Vitest unit suite.
- `npm run start:prod` – Shortcut that builds and immediately previews the app.

## Routes and key flows
- `/` **Dashboard** – Fetches catalog summary metrics, shows KPI cards and a category snapshot chart, and measures `first_route_mounted`.
- `/items` **Catalog** – Displays the paginated 1,000-row table with debounced search, category filter, sort controls, CRUD actions, and the stress test routine.
- `/items/new` **Create item** – Validates the form inputs and emits `form_submit_success` on successful creation before routing back to `/items`.
- `/items/:id/edit` **Edit item** – Prefills form values through the mock API and updates the record using the same validations.
- `/items/:id` **Item detail** – Highlights price, rating, stock, and metadata along with a mini bar chart visualisation.
- `/about` **About** – Static documentation block covering stack details and instrumentation guidance.

## Performance instrumentation
- `src/utils/perf.ts` defines the shared `METRICS`, wraps `performance.mark`/`performance.measure`, buffers entries into `window.__appMetrics`, and captures CLS/FCP/LCP using `web-vitals`.
- `src/main.ts` records `app_start`, registers the performance observer before bootstrapping the Vue application, and initialises Web Vitals.
- The Pinia store (`src/store/index.ts`) and route components call `mark`/`measure` around data fetching, pagination, filters, sorting, stress updates, and form submissions.

### Inspecting metrics during a run
1. In the devtools console, inspect `performance.getEntriesByName('filter_applied')` to see the latest measurement for filter interactions.
2. Call `window.__appMetrics.getAndReset()` to grab the buffered metrics that the automation scripts export.
3. Web Vitals numbers update inside `window.__appMetrics.webVitals` after `captureWebVitals()` resolves.
4. Console output includes JSON strings containing `"__METRIC__": true`; filter the log by that token to follow the timeline live.
