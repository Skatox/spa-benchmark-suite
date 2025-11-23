# spa-benchmark-suite

A benchmark suite for comparing SPA (Single Page Application) frameworks using reference applications.

## Overview

This repository contains SPA implementations meant to facilitate performance benchmarking and comparison between popular frameworks. It currently includes a Vue + Vite implementation of the RealWorld specification so it can be compared against future apps built with other stacks.

## Structure

```
app/            - Vue + Vite RealWorld SPA implementation
```

The Vue app is a first-class project scaffolded with Vite and aligned to the RealWorld feature set.

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

#### Vue (RealWorld)
```bash
cd app
npm install
npm run dev -- --host --port 4173
```

### Running all apps together

From the repository root, you can start the Vue example using npm scripts defined in the top-level `package.json`:

```bash
npm install
npm run start:vue
```

## Benchmarking

Each app aims to provide the same functionality, making them ideal for performance comparisons. You can benchmark:

- Initial load time
- Runtime performance
- Bundle size
- Memory usage
- And more...

## License

See individual app folders for their respective licenses.