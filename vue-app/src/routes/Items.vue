<script setup lang="ts">
import { h, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import ConfirmDialog from '../components/ConfirmDialog.vue';
import Filters from '../components/Filters.vue';
import Paginator from '../components/Paginator.vue';
import SearchBox from '../components/SearchBox.vue';
import Table from '../components/Table.vue';
import type { Item, SortDirection, SortField } from '../api/items';
import { PAGE_SIZE_OPTIONS, useItemsStore } from '../store';
import { METRICS } from '../utils/perf';

const router = useRouter();
const itemsStore = useItemsStore();
const { items, total, loading, error, filters, categories, pagination } = storeToRefs(itemsStore);

const searchTerm = ref(filters.value.search);
const itemToRemove = ref<Item | null>(null);
const initialFetchPerformed = ref(false);

onMounted(() => {
  itemsStore.loadCategories();
  if (!initialFetchPerformed.value) {
    initialFetchPerformed.value = true;
    itemsStore.fetchItems({ startMark: `${METRICS.ITEMS_TABLE_FIRST_PAINT}:start` });
  }
});

watch(
  () => filters.value.search,
  (next) => {
    searchTerm.value = next;
  },
);

watch(
  searchTerm,
  (next, _, onCleanup) => {
    const handle = window.setTimeout(() => {
      if (next !== filters.value.search) {
        itemsStore.applySearch(next);
      }
    }, 300);
    onCleanup(() => window.clearTimeout(handle));
  },
);

const handleCategoryChange = (value: string) => {
  itemsStore.applyCategory(value);
};

const handleSortChange = (field: SortField, direction: SortDirection) => {
  itemsStore.applySort(field, direction);
};

const closeDialog = () => {
  itemToRemove.value = null;
};

const confirmDelete = async () => {
  if (itemToRemove.value) {
    await itemsStore.deleteItem(itemToRemove.value.id);
    itemToRemove.value = null;
  }
};

const columns = [
  { key: 'id', header: 'ID', className: 'w-16' },
  { key: 'name', header: 'Name' },
  { key: 'category', header: 'Category', className: 'w-32' },
  {
    key: 'price',
    header: 'Price',
    className: 'w-24 text-right',
    render: (row: Item) => h('span', `$${row.price.toFixed(2)}`),
  },
  {
    key: 'rating',
    header: 'Rating',
    className: 'w-20 text-right',
    render: (row: Item) => h('span', row.rating.toFixed(1)),
  },
  {
    key: 'updatedAt',
    header: 'Updated',
    className: 'w-40',
    render: (row: Item) => h('span', new Date(row.updatedAt).toLocaleString()),
  },
  {
    key: 'actions',
    header: 'Actions',
    className: 'w-44',
    render: (row: Item) =>
      h('div', { class: 'flex gap-2 text-sm' }, [
        h(
          'button',
          {
            type: 'button',
            class: 'rounded border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-100',
            onClick: () => router.push(`/items/${row.id}`),
          },
          'View',
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'rounded border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-100',
            onClick: () => router.push(`/items/${row.id}/edit`),
          },
          'Edit',
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'rounded border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50',
            onClick: () => {
              itemToRemove.value = row;
            },
          },
          'Delete',
        ),
      ]),
  },
];
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 class="text-2xl font-semibold text-slate-900">Items</h2>
        <p class="text-sm text-slate-600">
          Browse the catalog with pagination, search, filters, and stress testing utilities.
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="rounded bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-dark"
          @click="router.push('/items/new')"
        >
          New item
        </button>
        <button
          type="button"
          class="rounded border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/10"
          @click="itemsStore.runStressTest()"
        >
          Stress test
        </button>
      </div>
    </header>
    <div class="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <SearchBox v-model:value="searchTerm" />
      <Filters
        :category="filters.category"
        :categories="categories"
        :sort-by="filters.sortBy"
        :sort-dir="filters.sortDir"
        @update:category="handleCategoryChange"
        @update:sort="handleSortChange"
      />
    </div>
    <div v-if="error" class="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
      {{ error }}
    </div>
    <p v-if="loading" class="text-sm text-slate-500">Loading items…</p>
    <Table :data="items" :columns="columns" empty-message="No items matched your criteria." />
    <Paginator
      :page="pagination.page"
      :page-size="pagination.pageSize"
      :total="total"
      :page-size-options="PAGE_SIZE_OPTIONS"
      :on-page-change="itemsStore.setPage"
      :on-page-size-change="itemsStore.setPageSize"
    />
    <ConfirmDialog
      :open="Boolean(itemToRemove)"
      title="Delete item"
      :description="`Are you sure you want to delete ${itemToRemove?.name ?? 'this item'}?`"
      confirm-label="Delete"
      cancel-label="Cancel"
      :on-cancel="closeDialog"
      :on-confirm="confirmDelete"
    />
  </section>
</template>
