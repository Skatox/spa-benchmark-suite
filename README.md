# spa-benchmark-suite

A benchmark suite for comparing SPA (Single Page Application) frameworks using TodoMVC examples.

## Overview

This repository contains TodoMVC implementations for React, Vue, and Svelte to facilitate performance benchmarking and comparison between these popular SPA frameworks.

## Structure

```
apps/
├── react/      - TodoMVC repository (use examples/react/)
├── vue/        - TodoMVC repository (use examples/vue/)
└── svelte/     - TodoMVC repository (use examples/svelte/)
```

Each subfolder in `apps/` contains the complete TodoMVC repository as a git submodule. The specific framework implementations are located in the `examples/<framework>/` directory within each submodule.

## Getting Started

### Cloning the Repository

To clone this repository with all submodules:

```bash
git clone --recursive https://github.com/Skatox/spa-benchmark-suite.git
```

Or if you've already cloned the repository:

```bash
git submodule update --init --recursive
```

### Running the Examples

#### React
```bash
cd apps/react/examples/react
npm install
npm start
```

#### Vue
```bash
cd apps/vue/examples/vue
npm install
npm run dev
```

#### Svelte
```bash
cd apps/svelte/examples/svelte
npm install
npm run dev
```

### Running all apps together

From the repository root, you can start all three examples at once using npm scripts defined in the top-level `package.json`:

```bash
npm install
npm run start:all
```

Each app runs on its own port (`react`: 3000, `vue`: 4173, `svelte`: 4174) so they won't conflict with one another.

## Benchmarking

Each TodoMVC implementation provides the same functionality, making them ideal for performance comparisons. You can benchmark:

- Initial load time
- Runtime performance
- Bundle size
- Memory usage
- And more...

## License

See individual submodules for their respective licenses.