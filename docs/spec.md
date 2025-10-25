# Reference SPA Specification

## A. Scope
- **Application type:** 100% client-side Single Page Application with no Server Side Rendering.
- **Target frameworks:** React, Vue, and Svelte sharing the exact same route tree and component structure.
- **Build tooling:** Vite with vanilla JavaScript to keep parity (TypeScript is intentionally disabled by default).
- **Styling approach:** Plain CSS with CSS custom properties; no preprocessors or third-party UI libraries.
- **Directory layout:** `/src/{api,components,routes,store,styles,utils}` is mirrored across the three stacks.

## B. Routes and flows
| Route | Key components | Functional requirements |
| --- | --- | --- |
| `/` (Dashboard) | `DashboardRoute`, metric widgets, `CounterWidget` | Surface local metrics, provide navigation shortcuts, include an interactive counter to observe DOM updates. Emit `app_start` and `first_route_mounted` marks. |
| `/items` | `ItemsRoute`, `ItemsTable`, `ItemsFilters`, `PaginationControls` | Render a 1,000-row mock table with columns `id`, `title`, `category`, `price`, `rating`, `updatedAt`. Provide client-side pagination (configurable page size), search with 300 ms debounce, category filter, sorting by `price` and `rating`. Each row exposes View, Edit, Delete actions. Emit `items_table_first_paint`, `filter_applied`, `sort_applied`, `page_changed`. |
| `/items/new` | `ItemFormRoute`, `ItemForm` | Create form with validations: `title` required, `price > 0`, `rating` between 1–5. Emit `form_submit_success` on success. |
| `/items/:id/edit` | `ItemFormRoute`, `ItemForm` | Same form as `/items/new` but pre-filled via the mock API and persisting updates. |
| `/items/:id` | `ItemDetailRoute`, `KpiList`, `MiniBarChart` | Display highlighted KPIs, field details, and a CSS-only mini bar chart. |
| `/about` | `AboutRoute` | Static app information and documentation links. |

### Stress mode
- Dashboard includes a `StressTestButton` that calls `seedLargeDataset(500)` to append 500 temporary in-memory items.
- Trigger 20 rapid state updates (e.g., counter increments and table refreshes) to pressure rendering.
- Emit metrics for each update and remove temporary data when finished.

## C. Data and mock API
- **Primary source:** `/public/data/items.json` with the initial 1,000 records.
- **Persistence model:** A mock API client at `/src/api/itemsClient.js` (identical API across frameworks) simulating local `fetch` calls with 150–250 ms randomized latency and jitter.
- **Exposed endpoints:**
  - `list({ page, pageSize, search, category, sortBy, sortDir })`.
  - `get(id)`.
  - `create(payload)`.
  - `update(id, payload)`.
  - `remove(id)`.
- The mock API keeps in-memory state synchronized by route; all mutations must update the collection.
- **Utility seeder:** `seedLargeDataset(n)` produces additional records (sequential ids, reproducible randomized fields) and returns the augmented list for stress mode.
- Simulate error cases (5% probability) with consistent messaging across frameworks.

## D. Performance instrumentation
- Use `performance.mark` and `performance.measure` for the milestones: `app_start`, `first_route_mounted`, `items_table_first_paint`, `filter_applied`, `sort_applied`, `page_changed`, `form_submit_success`.
- Log each measurement via `console.log(JSON.stringify({ "__METRIC__": true, ...payload }))` preserving timestamp and duration.
- Expose `window.__appMetrics` with:
  - A `getAndReset()` method returning the latest batch of measurements and clearing the buffer.
  - A `webVitals` object holding the latest FCP, LCP, CLS readings (when reported by `PerformanceObserver`).
- Centralize instrumentation in shared hooks/utilities so React, Vue, and Svelte reuse the same semantics.

## E. Parity between technologies
- Keep route names, component names, and prop signatures identical; align with `/docs/ui-style.md`.
- Events (submit, filters, table actions) share the same payload structure and console messages.
- Validation messaging lives in `/src/utils/validationMessages.js` and is reused everywhere.
- Global store/state structures expose equivalent fields (`items`, `filters`, `pagination`, `metrics`).

## F. Acceptance criteria
1. Cold-start dashboard renders in under 2 s using a standard development build.
2. The `/items` table renders 1,000 rows in under 1.5 s on a local production build.
3. Every listed event triggers its `performance.mark` plus a `__METRIC__` JSON log.
4. Stress mode appends 500 items, performs 20 rapid updates, and emits metrics without freezing the UI.

## Annexes
### Metrics initialization snippet
```js
// src/utils/metrics.js
export function markAndMeasure(name, startMark, endMark = `${name}:end`) {
  performance.mark(endMark);
  performance.measure(name, startMark, endMark);
  const entry = performance.getEntriesByName(name).pop();
  window.__appMetrics.buffer.push({ name, duration: entry?.duration, ts: Date.now() });
  console.log(JSON.stringify({ "__METRIC__": true, name, duration: entry?.duration }));
}
```

### Baseline pagination config
```js
const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
```
