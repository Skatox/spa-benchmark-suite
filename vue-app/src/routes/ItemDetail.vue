<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';

import KpiCard from '../components/KpiCard.vue';
import MiniBar from '../components/MiniBar.vue';
import type { Item } from '../api/items';
import { get } from '../api/items';

const route = useRoute();
const router = useRouter();

const item = ref<Item | null>(null);
const error = ref<string | null>(null);
const loading = ref(true);

onMounted(() => {
  const idParam = route.params.id;
  if (!idParam) {
    error.value = 'Item identifier is missing.';
    loading.value = false;
    return;
  }

  loading.value = true;
  get(Number(idParam))
    .then((record) => {
      item.value = record;
      error.value = null;
    })
    .catch((err: unknown) => {
      error.value = err instanceof Error ? err.message : 'Unable to load the item.';
    })
    .finally(() => {
      loading.value = false;
    });
});

const goBack = () => {
  router.back();
};
</script>

<template>
  <section class="space-y-6">
    <p v-if="loading" class="text-sm text-slate-500">Loading item…</p>
    <div v-else-if="error" class="space-y-4">
      <p class="text-sm text-red-600">{{ error }}</p>
      <button
        type="button"
        class="rounded border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
        @click="goBack"
      >
        Go back
      </button>
    </div>
    <p v-else-if="!item" class="text-sm text-slate-500">Item was not found.</p>
    <div v-else class="space-y-6">
      <header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-slate-900">{{ item.name }}</h2>
          <p class="text-sm text-slate-600">SKU {{ item.sku }}</p>
        </div>
        <div class="flex gap-2">
          <RouterLink
            :to="`/items/${item.id}/edit`"
            class="rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Edit item
          </RouterLink>
          <button
            type="button"
            class="rounded border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            @click="goBack"
          >
            Back
          </button>
        </div>
      </header>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Price" :value="`$${item.price.toFixed(2)}`" />
        <KpiCard label="Rating" :value="item.rating.toFixed(1)" />
        <KpiCard label="Stock" :value="item.stock" :helper-text="item.status === 'active' ? 'In stock' : 'Out of stock'" />
        <KpiCard label="Category" :value="item.category" />
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-slate-900">Details</h3>
        <dl class="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-semibold uppercase text-slate-500">Created</dt>
            <dd class="text-sm text-slate-700">{{ new Date(item.createdAt).toLocaleString() }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase text-slate-500">Updated</dt>
            <dd class="text-sm text-slate-700">{{ new Date(item.updatedAt).toLocaleString() }}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-xs font-semibold uppercase text-slate-500">Description</dt>
            <dd class="text-sm text-slate-700">{{ item.description }}</dd>
          </div>
        </dl>
        <div class="mt-6">
          <h4 class="text-sm font-semibold text-slate-700">Performance ratio</h4>
          <MiniBar :values="[item.rating, Math.max(0, 5 - item.rating), item.price / 100]" :labels="['Rate', 'Gap', 'Price']" />
        </div>
      </div>
    </div>
  </section>
</template>
