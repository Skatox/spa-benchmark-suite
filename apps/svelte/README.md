# Svelte RealWorld App

A single-page application built with Svelte that implements the RealWorld spec against the public conduit API.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) with the [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) extension and the official [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) integration keeps linting, formatting, and type hints consistent with the project configuration.

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.): [Svelte Devtools](https://chromewebstore.google.com/detail/svelte-devtools/ckolcbmkjpjmfifdboeojogkafhmcfem)
- Firefox: [Svelte Devtools](https://addons.mozilla.org/en-US/firefox/addon/svelte-devtools/)

## Type Support

The app uses `svelte-check` for static analysis of `.svelte` and `.ts` files. Run `npm run type-check` (or `npm run build`, which bundles the check) to surface editor-quality diagnostics in CI.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Preview the Production Build

```sh
npm run preview
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/) and Format with [Prettier](https://prettier.io/)

```sh
npm run lint
npm run format
```
