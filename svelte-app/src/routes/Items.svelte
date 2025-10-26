<script lang="ts">
  import { get } from 'svelte/store';
  import { onDestroy, onMount } from 'svelte';
  import { link, push } from 'svelte-spa-router';

  import ConfirmDialog from '../components/ConfirmDialog.svelte';
  import Filters from '../components/Filters.svelte';
  import Paginator from '../components/Paginator.svelte';
  import SearchBox from '../components/SearchBox.svelte';
  import Table from '../components/Table.svelte';
  import type { Item, SortDirection, SortField } from '../api/items';
  import { PAGE_SIZE_OPTIONS, itemsStore } from '../store';
  import { METRICS } from '../utils/perf';

  interface ColumnDefinition {
    key: string;
    header: string;
    className?: string;
    render?: (row: Item) => unknown;
  }

  const columns: ColumnDefinition[] = [
    { key: 'id', header: 'ID', className: 'w-16' },
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category', className: 'w-32' },
    {
      key: 'price',
      header: 'Price',
      className: 'w-24 text-right',
      render: (row) => `$${row.price.toFixed(2)}`,
    },
    {
      key: 'rating',
      header: 'Rating',
      className: 'w-20 text-right',
      render: (row) => row.rating.toFixed(1),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      className: 'w-40',
      render: (row) => new Date(row.updatedAt).toLocaleString(),
    },
    { key: 'actions', header: 'Actions', className: 'w-40' },
  ];

  let searchTerm = '';
  let itemToRemove: Item | null = null;
  let debounceHandle: ReturnType<typeof window.setTimeout> | null = null;
  let pendingSearchUpdate = false;
  let initialFetch = false;

  onMount(() => {
    itemsStore.loadCategories();
    const snapshot = get(itemsStore);
    searchTerm = snapshot.filters.search;
    if (!initialFetch) {
      initialFetch = true;
      itemsStore.fetchItems({ startMark: `${METRICS.ITEMS_TABLE_FIRST_PAINT}:start` });
    }
  });

  onDestroy(() => {
    if (debounceHandle) {
      window.clearTimeout(debounceHandle);
    }
  });

  $: state = $itemsStore;
  $: filters = state.filters;
  $: pagination = state.pagination;
  $: items = state.items;
  $: total = state.total;
  $: loading = state.loading;
  $: error = state.error;
  $: categories = state.categories;

  $: if (!pendingSearchUpdate && filters.search !== searchTerm) {
    searchTerm = filters.search;
  }

  function handleSearchChange(value: string) {
    searchTerm = value;
    pendingSearchUpdate = true;
    if (debounceHandle) {
      window.clearTimeout(debounceHandle);
    }
    debounceHandle = window.setTimeout(async () => {
      try {
        if (filters.search !== searchTerm) {
          await itemsStore.applySearch(searchTerm);
        }
      } finally {
        pendingSearchUpdate = false;
      }
    }, 300);
  }

  function handleCategoryChange(value: string) {
    itemsStore.applyCategory(value);
  }

  function handleSortChange(field: SortField, direction: SortDirection) {
    itemsStore.applySort(field, direction);
  }

  async function confirmDeletion() {
    if (itemToRemove) {
      await itemsStore.deleteItem(itemToRemove.id);
      itemToRemove = null;
    }
  }
</script>

<section class="space-y-6">
  <header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <h2 class="text-2xl font-semibold text-slate-900">Items</h2>
      <p class="text-sm text-slate-600">
        Browse the catalog with pagination, search, filters, and stress testing utilities.
      </p>
    </div>
    <div class="flex flex-wrap gap-3">
      <a
        href="/items/new"
        use:link
        class="rounded bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-dark"
      >
        New item
      </a>
      <button
        type="button"
        class="rounded border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/10"
        on:click={itemsStore.runStressTest}
      >
        Stress test
      </button>
    </div>
  </header>
  <div class="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <SearchBox value={searchTerm} on:change={({ detail }) => handleSearchChange(detail)} />
    <Filters
      category={filters.category}
      {categories}
      sortBy={filters.sortBy}
      sortDir={filters.sortDir}
      on:category={({ detail }) => handleCategoryChange(detail)}
      on:sort={({ detail }) => handleSortChange(detail.field, detail.direction)}
    />
  </div>
  {#if error}
    <div class="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
      {error}
    </div>
  {/if}
  {#if loading}
    <p class="text-sm text-slate-500">Loading items…</p>
  {/if}
  <Table {columns} data={items} emptyMessage="No items matched your criteria.">
    <svelte:fragment slot="cell-price" let:row>
      ${row.price.toFixed(2)}
    </svelte:fragment>
    <svelte:fragment slot="cell-rating" let:row>
      {row.rating.toFixed(1)}
    </svelte:fragment>
    <svelte:fragment slot="cell-updatedAt" let:row>
      {new Date(row.updatedAt).toLocaleString()}
    </svelte:fragment>
    <svelte:fragment slot="cell-actions" let:row>
      <div class="flex gap-2 text-sm">
        <button
          type="button"
          class="rounded border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-100"
          on:click={() => push(`/items/${row.id}`)}
        >
          View
        </button>
        <button
          type="button"
          class="rounded border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-100"
          on:click={() => push(`/items/${row.id}/edit`)}
        >
          Edit
        </button>
        <button
          type="button"
          class="rounded border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50"
          on:click={() => (itemToRemove = row)}
        >
          Delete
        </button>
      </div>
    </svelte:fragment>
  </Table>
  <Paginator
    page={pagination.page}
    pageSize={pagination.pageSize}
    total={total}
    pageSizeOptions={PAGE_SIZE_OPTIONS}
    onPageChange={(value) => itemsStore.setPage(value)}
    onPageSizeChange={(size) => itemsStore.setPageSize(size)}
  />
  <ConfirmDialog
    open={Boolean(itemToRemove)}
    title="Delete item"
    description={`Are you sure you want to delete ${itemToRemove?.name ?? 'this item'}?`}
    confirmLabel="Delete"
    cancelLabel="Cancel"
    on:cancel={() => (itemToRemove = null)}
    on:confirm={confirmDeletion}
  />
</section>
