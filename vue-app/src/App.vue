<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';

import Nav from './components/Nav.vue';
import { METRICS, measure } from './utils/perf';

onMounted(() => {
  measure(METRICS.FIRST_ROUTE_MOUNTED, METRICS.APP_START);
});
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <header class="bg-white shadow">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <h1 class="text-xl font-semibold text-slate-900">SPA Benchmark Suite</h1>
        <Nav />
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-6 py-8">
      <Suspense>
        <template #default>
          <RouterView />
        </template>
        <template #fallback>
          <p class="text-slate-500">Loading route…</p>
        </template>
      </Suspense>
    </main>
  </div>
</template>
