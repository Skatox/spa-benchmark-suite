<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import type { SortDirection, SortField } from '../api/items';

  export let category = 'all';
  export let categories: string[] = [];
  export let sortBy: SortField = 'updatedAt';
  export let sortDir: SortDirection = 'desc';

  const dispatch = createEventDispatcher<{
    category: string;
    sort: { field: SortField; direction: SortDirection };
  }>();

  function handleCategory(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    dispatch('category', value);
  }

  function handleSortField(event: Event) {
    const value = (event.target as HTMLSelectElement).value as SortField;
    dispatch('sort', { field: value, direction: sortDir });
  }

  function handleSortDirection(event: Event) {
    const value = (event.target as HTMLSelectElement).value as SortDirection;
    dispatch('sort', { field: sortBy, direction: value });
  }
</script>

<div class="flex flex-wrap items-center gap-4">
  <div>
    <label for="category" class="mb-1 block text-xs font-semibold uppercase text-slate-500">Category</label>
    <select
      id="category"
      class="rounded border border-slate-300 px-3 py-2 text-sm"
      bind:value={category}
      on:change={handleCategory}
    >
      {#each categories as option}
        <option value={option}>{option === 'all' ? 'All categories' : option}</option>
      {/each}
    </select>
  </div>
  <div class="flex items-end gap-2">
    <div>
      <label for="sort-field" class="mb-1 block text-xs font-semibold uppercase text-slate-500">Sort by</label>
      <select
        id="sort-field"
        class="rounded border border-slate-300 px-3 py-2 text-sm"
        bind:value={sortBy}
        on:change={handleSortField}
      >
        <option value="price">Price</option>
        <option value="rating">Rating</option>
        <option value="updatedAt">Last updated</option>
      </select>
    </div>
    <div>
      <label for="sort-direction" class="mb-1 block text-xs font-semibold uppercase text-slate-500">Direction</label>
      <select
        id="sort-direction"
        class="rounded border border-slate-300 px-3 py-2 text-sm"
        bind:value={sortDir}
        on:change={handleSortDirection}
      >
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  </div>
</div>
