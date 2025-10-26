<script lang="ts">
  import { onMount } from 'svelte';
  import { link } from 'svelte-spa-router';

  import KpiCard from '../components/KpiCard.svelte';
  import MiniBar from '../components/MiniBar.svelte';
  import type { Item } from '../api/items';
  import { get as fetchItem } from '../api/items';

  export let params: { id: string };

  let item: Item | null = null;
  let error: string | null = null;
  let loading = true;

  onMount(async () => {
    const identifier = Number(params.id);
    if (!identifier) {
      error = 'Invalid item id.';
      loading = false;
      return;
    }
    try {
      item = await fetchItem(identifier);
      error = null;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to load the item.';
    } finally {
      loading = false;
    }
  });

  $: ratingBars = item ? [item.rating, Math.max(0, 5 - item.rating), item.price / 100] : [];
  $: stockStatus = item?.status === 'active' ? 'In stock' : 'Out of stock';
</script>

{#if loading}
  <p class="text-sm text-slate-500">Loading item…</p>
{:else if error}
  <div class="space-y-4">
    <p class="text-sm text-red-600">{error}</p>
    <button
      type="button"
      class="rounded border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
      on:click={() => window.history.back()}
    >
      Go back
    </button>
  </div>
{:else if !item}
  <p class="text-sm text-slate-500">Item was not found.</p>
{:else}
  <section class="space-y-6">
    <header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 class="text-2xl font-semibold text-slate-900">{item.name}</h2>
        <p class="text-sm text-slate-600">SKU {item.sku}</p>
      </div>
      <div class="flex gap-2">
        <a
          href={`/items/${item.id}/edit`}
          use:link
          class="rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Edit item
        </a>
        <button
          type="button"
          class="rounded border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
          on:click={() => window.history.back()}
        >
          Back
        </button>
      </div>
    </header>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard label="Price" value={`$${item.price.toFixed(2)}`} />
      <KpiCard label="Rating" value={item.rating.toFixed(1)} />
      <KpiCard label="Stock" value={item.stock} helperText={stockStatus} />
      <KpiCard label="Category" value={item.category} />
    </div>
    <div class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-900">Details</h3>
      <dl class="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <dt class="text-xs font-semibold uppercase text-slate-500">Created</dt>
          <dd class="text-sm text-slate-700">{new Date(item.createdAt).toLocaleString()}</dd>
        </div>
        <div>
          <dt class="text-xs font-semibold uppercase text-slate-500">Updated</dt>
          <dd class="text-sm text-slate-700">{new Date(item.updatedAt).toLocaleString()}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-xs font-semibold uppercase text-slate-500">Description</dt>
          <dd class="text-sm text-slate-700">{item.description}</dd>
        </div>
      </dl>
      <div class="mt-6">
        <h4 class="text-sm font-semibold text-slate-700">Performance ratio</h4>
        <MiniBar values={ratingBars} labels={['Rate', 'Gap', 'Price']} />
      </div>
    </div>
  </section>
{/if}
