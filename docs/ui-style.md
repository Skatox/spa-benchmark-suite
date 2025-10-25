# Visual Style and Components Guide

## Core principles
- **Cross-stack parity:** reuse the same component names, props, and CSS class names in React, Vue, and Svelte.
- **Lightweight visual system:** define CSS custom properties in `:root` within `/src/styles/theme.css`.
- **No external dependencies:** rely solely on plain, component-scoped CSS.
- **Accessibility first:** maintain WCAG AA contrast, visible focus, and full keyboard support for forms, tables, and buttons.

## Design tokens
```css
/* src/styles/theme.css */
:root {
  --color-bg: #0f172a;
  --color-surface: #111827;
  --color-surface-alt: #1f2937;
  --color-primary: #38bdf8;
  --color-primary-strong: #0ea5e9;
  --color-accent: #f472b6;
  --color-success: #34d399;
  --color-warning: #facc15;
  --color-danger: #f87171;
  --color-text: #e2e8f0;
  --color-text-subtle: #94a3b8;
  --color-border: #1e293b;
  --shadow-elevated: 0 16px 32px rgba(8, 47, 73, 0.35);
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 22px;
  --font-sans: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", Menlo, monospace;
  --transition-fast: 120ms ease-out;
  --transition-slow: 280ms ease;
}
```

## Typography and hierarchy
| Element | Token | Usage |
| --- | --- | --- |
| Section headings | `font-family: var(--font-sans); font-size: clamp(1.75rem, 2vw, 2.25rem);` | Dashboard hero titles, table headers, `/items/*` pages. |
| Subheadings | `font-size: 1.125rem; color: var(--color-text-subtle);` | Metric labels, secondary headings. |
| Body text | `font-size: 0.95rem; line-height: 1.6;` | General content and descriptions. |
| Code / metrics | `font-family: var(--font-mono);` | KPI values and inline log readouts. |

## Layout
- Primary `AppShell` container with max-width 1280px, centered, padding 32px.
- Optional desktop sidebar with vertical navigation; use a `NavDrawer` overlay on mobile.
- Maintain consistent gaps: `gap: 24px` for card layouts, `gap: 16px` for forms.
- Use `display: grid` within `DashboardMetrics` for responsive columns (3 ≥ 1200px, 2 ≥ 768px, 1 otherwise).

## Key components

### Dashboard
- `DashboardMetrics`: cards with `var(--shadow-elevated)` shadow, `var(--color-surface-alt)` background, `1px solid var(--color-border)` border.
- `CounterWidget`: primary button with visual feedback per update (`transform: scale(0.98)` on active).
- `StressTestButton`: secondary-styled button using `var(--color-warning)` for border and label; display iteration counter.

### Items table (`ItemsTable`)
- Responsive table using `table-layout: fixed` and `white-space: nowrap` for critical cells (`title`, `category`).
- Clickable headers with sort caret via `::after` pseudo-element rotated based on `data-sort` attributes.
- Highlight rows on hover (`background: rgba(56, 189, 248, 0.08)`) and alternate colors with `nth-child(even)`.
- Row actions `View`, `Edit`, `Delete` rendered as inline-flex buttons with 8px gap; `Delete` uses `var(--color-danger)`.
- Pagination (`PaginationControls`) uses compact buttons, disabled states, and a page-size selector.
- `ItemsFilters` includes `search`, `category`, `pageSize` controls; inputs should stay at `min-width: 220px`.

### Forms (`ItemForm`)
- Vertical layout, `max-width: 640px`, `gap: 20px`.
- Inputs with `1px solid var(--color-border)` borders and `border-radius: var(--radius-sm)`; focus state uses `outline: 2px solid var(--color-primary)`.
- Validation messages rendered via `FormError` with CSS icon (`content: "⚠"; color: var(--color-warning);`).
- Buttons: `Save` primary, `Cancel` text-style. Keep `aria-live="polite"` for success/error messaging.

### Detail view (`ItemDetailRoute`)
- `KpiList`: 4-column grid on desktop with gradient `linear-gradient(135deg, rgba(14,165,233,0.25), transparent)`.
- `MiniBarChart`: ordered list with `display: flex; align-items: flex-end; height: 120px;`. Each bar is an `li` with width 12px and color `var(--color-primary-strong)`.
- Metadata section (`MetaPanel`) uses card styling with monospace typography for `id` and `updatedAt`.

### About
- `AboutRoute` centers informative cards and uses links with `text-decoration: underline dashed`.

### Utility components
- `AppHeader`: includes text logo, `NavLinks`, and stress-mode toggle.
- `Toast`: global feedback anchored top-right (`position: fixed`) with slide-in animation.
- `Modal`: reusable overlay with `backdrop-filter: blur(6px)` and accessible close options (Esc key and close button).

## States and feedback
- Define `is-loading`, `is-error`, `is-success` classes with matching color cues.
- Optional skeletons for tables (`SkeletonRow`), forms, and detail view using animated shimmer backgrounds.
- Stress mode displays a persistent `StressBanner` indicating temporary data load.

## Interactions and animation
- Apply smooth transitions (`var(--transition-fast)`) for hover and focus.
- `CounterWidget` and `StressTestButton` show badges with `transition: transform 120ms`.
- Avoid expensive animations (e.g., animated `box-shadow` loops).

## Visual instrumentation
- Components emitting metrics include `data-metric="<name>"` on the root node for quick inspection.
- Stress-mode banner displays iteration count and dismisses automatically when the test finishes.

## Snippets and conventions
```jsx
// Button group usage in React (mirror markup in Vue/Svelte)
<div className="table-actions" data-metric="row-actions">
  <button className="btn btn--ghost">View</button>
  <button className="btn btn--ghost">Edit</button>
  <button className="btn btn--danger">Delete</button>
</div>
```

```css
/* Generic buttons */
.btn {
  font: inherit;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  transition: background var(--transition-fast), transform var(--transition-fast);
}
.btn--primary { background: var(--color-primary); color: #0f172a; }
.btn--ghost { background: transparent; color: var(--color-text); border-color: var(--color-border); }
.btn--danger { background: var(--color-danger); color: #0f172a; }
.btn:focus-visible { outline: 2px solid var(--color-primary-strong); outline-offset: 2px; }
.btn:active { transform: scale(0.97); }
```

```html
<!-- Markup for MiniBarChart (identical across frameworks) -->
<ol class="mini-bar-chart" data-metric="mini-bar">
  <li style="height: 40%"></li>
  <li style="height: 65%"></li>
  <li style="height: 80%"></li>
  <li style="height: 55%"></li>
</ol>
```

## Cross-document links
- Document per-stack implementation details in `/docs/tech/<framework>.md` (outside the scope of this guide).
- Keep the visual changelog in `/docs/ui-changelog.md` aligned with this document.
