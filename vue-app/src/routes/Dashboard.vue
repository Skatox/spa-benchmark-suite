<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';

import KpiCard from '../components/KpiCard.vue';
import MiniBar from '../components/MiniBar.vue';
import { useItemsStore } from '../store';

const itemsStore = useItemsStore();
const { summary, items, hasLoaded } = storeToRefs(itemsStore);

onMounted(() => {
  itemsStore.refreshSummary();
  if (!hasLoaded.value) {
    itemsStore.fetchItems();
  }
});

const categorySnapshot = computed(() => {
  const counts = new Map<string, number>();
  items.value.forEach((item) => {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  });
  const entries = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  return {
    labels: entries.map(([label]) => label.slice(0, 4)),
    values: entries.map(([, value]) => value),
  };
});
</script>

<template>
  <section class="space-y-8">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 class="text-2xl font-semibold text-slate-900">Dashboard</h2>
        <p class="text-sm text-slate-600">
          Track overall catalog performance and jump into item management flows.
        </p>
      </div>
      <RouterLink
        to="/items"
        class="inline-flex items-center justify-center rounded bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-dark"
      >
        Manage items
      </RouterLink>
    </div>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard label="Total items" :value="summary.total" />
      <KpiCard label="Average price" :value="`$${summary.averagePrice.toLocaleString()}`" />
      <KpiCard label="Average rating" :value="summary.averageRating.toFixed(1)" />
      <KpiCard label="Out of stock" :value="summary.outOfStock" helper-text="Records currently unavailable" />
    </div>
    <div class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-900">Category snapshot</h3>
      <p class="text-sm text-slate-600">
        Based on the currently loaded data set. Navigate to the items page for richer exploration.
      </p>
      <div class="mt-6">
        <MiniBar v-if="categorySnapshot.values.length" :values="categorySnapshot.values" :labels="categorySnapshot.labels" />
        <p v-else class="text-sm text-slate-500">Load the catalog to see category distribution.</p>
      </div>
    </div>
  </section>
</template>
