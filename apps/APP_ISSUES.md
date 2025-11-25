# App health check findings

## React (`apps/react`)
- Added a basic Vitest smoke test (`src/App.test.tsx`) that renders the app with a mocked auth store to confirm the navigation links appear for unauthenticated users and the store bootstrap hook runs. This guards against regressions and ensures the test command now has coverage to execute.

## Svelte (`apps/svelte`)
- Added a Vitest smoke test (`src/App.test.ts`) that mounts the root app with a stubbed auth store and verifies the public navigation renders. This provides minimal coverage and exercises the app bootstrap logic during tests.

## Vue (`apps/vue`)
- Expanded the router stub in `src/__tests__/App.spec.ts` to include `/login` and `/register` routes so the Vitest run mirrors real navigation without emitting router warnings about unknown paths.
