<script lang="ts">
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';

  import type { Item } from '../api/items';
  import { get as fetchItem } from '../api/items';
  import { itemsStore } from '../store';
  import { METRICS, mark, measure } from '../utils/perf';
  import {
    validateItemForm,
    type ItemFormValues,
    type ValidationErrors,
  } from '../utils/validators';

  export let params: { id?: string } = {};
  export let mode: 'create' | 'edit' = 'create';

  const emptyForm: ItemFormValues = {
    name: '',
    category: '',
    price: '',
    rating: '',
    stock: '',
    description: '',
  };

  let values: ItemFormValues = { ...emptyForm };
  let errors: ValidationErrors = {};
  let loading = mode === 'edit';
  let submitError: string | null = null;

  onMount(async () => {
    itemsStore.loadCategories();
    if (mode === 'edit' && params.id) {
      try {
        const record: Item = await fetchItem(Number(params.id));
        values = {
          name: record.name,
          category: record.category,
          price: record.price,
          rating: record.rating,
          stock: record.stock,
          description: record.description,
        };
      } catch (error) {
        submitError = error instanceof Error ? error.message : 'Unable to load the item.';
      } finally {
        loading = false;
      }
    } else {
      loading = false;
    }
  });

  $: categories = $itemsStore.categories.filter((category) => category !== 'all');

  function handleChange(field: keyof ItemFormValues, value: string | number) {
    values = { ...values, [field]: value };
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    errors = validateItemForm(values);
    if (Object.keys(errors).length > 0) {
      return;
    }

    submitError = null;
    const payload = {
      name: values.name,
      category: values.category,
      price: Number(values.price),
      rating: Number(values.rating),
      stock: Number(values.stock),
      description: values.description,
    };

    mark(`${METRICS.FORM_SUBMIT_SUCCESS}:start`);

    try {
      if (mode === 'edit' && params.id) {
        await itemsStore.updateItem(Number(params.id), payload);
      } else {
        await itemsStore.createItem(payload);
      }
      measure(METRICS.FORM_SUBMIT_SUCCESS, `${METRICS.FORM_SUBMIT_SUCCESS}:start`);
      push('/items');
    } catch (error) {
      submitError = error instanceof Error ? error.message : 'Unable to submit the form.';
    }
  }
</script>

<section class="space-y-6">
  <header class="flex flex-col gap-2">
    <h2 class="text-2xl font-semibold text-slate-900">
      {mode === 'edit' ? 'Edit item' : 'Create item'}
    </h2>
    <p class="text-sm text-slate-600">
      Provide accurate product details to keep the catalog consistent and actionable.
    </p>
  </header>
  {#if submitError}
    <div class="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
      {submitError}
    </div>
  {/if}
  {#if loading}
    <p class="text-sm text-slate-500">Loading form…</p>
  {:else}
    <form class="space-y-4" on:submit|preventDefault={handleSubmit} novalidate>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="name" class="mb-1 block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            id="name"
            name="name"
            class="w-full rounded border border-slate-300 px-3 py-2"
            value={values.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
            on:input={(event) => handleChange('name', (event.target as HTMLInputElement).value)}
          />
          {#if errors.name}
            <p id="name-error" class="mt-1 text-xs text-red-600">{errors.name}</p>
          {/if}
        </div>
        <div>
          <label for="category" class="mb-1 block text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            class="w-full rounded border border-slate-300 px-3 py-2"
            value={values.category}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? 'category-error' : undefined}
            on:change={(event) => handleChange('category', (event.target as HTMLSelectElement).value)}
          >
            <option value="">Select a category</option>
            {#each categories as category}
              <option value={category}>{category}</option>
            {/each}
          </select>
          {#if errors.category}
            <p id="category-error" class="mt-1 text-xs text-red-600">{errors.category}</p>
          {/if}
        </div>
      </div>
      <div class="grid gap-4 sm:grid-cols-3">
        <div>
          <label for="price" class="mb-1 block text-sm font-medium text-slate-700">
            Price
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            class="w-full rounded border border-slate-300 px-3 py-2"
            value={values.price}
            aria-invalid={Boolean(errors.price)}
            aria-describedby={errors.price ? 'price-error' : undefined}
            on:input={(event) => handleChange('price', (event.target as HTMLInputElement).value)}
          />
          {#if errors.price}
            <p id="price-error" class="mt-1 text-xs text-red-600">{errors.price}</p>
          {/if}
        </div>
        <div>
          <label for="rating" class="mb-1 block text-sm font-medium text-slate-700">
            Rating
          </label>
          <input
            id="rating"
            name="rating"
            type="number"
            step="0.1"
            min="1"
            max="5"
            class="w-full rounded border border-slate-300 px-3 py-2"
            value={values.rating}
            aria-invalid={Boolean(errors.rating)}
            aria-describedby={errors.rating ? 'rating-error' : undefined}
            on:input={(event) => handleChange('rating', (event.target as HTMLInputElement).value)}
          />
          {#if errors.rating}
            <p id="rating-error" class="mt-1 text-xs text-red-600">{errors.rating}</p>
          {/if}
        </div>
        <div>
          <label for="stock" class="mb-1 block text-sm font-medium text-slate-700">
            Stock
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            class="w-full rounded border border-slate-300 px-3 py-2"
            value={values.stock}
            aria-invalid={Boolean(errors.stock)}
            aria-describedby={errors.stock ? 'stock-error' : undefined}
            on:input={(event) => handleChange('stock', (event.target as HTMLInputElement).value)}
          />
          {#if errors.stock}
            <p id="stock-error" class="mt-1 text-xs text-red-600">{errors.stock}</p>
          {/if}
        </div>
      </div>
      <div>
        <label for="description" class="mb-1 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows="4"
          class="w-full rounded border border-slate-300 px-3 py-2"
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? 'description-error' : undefined}
          on:input={(event) => handleChange('description', (event.target as HTMLTextAreaElement).value)}
        >{values.description}</textarea>
        {#if errors.description}
          <p id="description-error" class="mt-1 text-xs text-red-600">{errors.description}</p>
        {/if}
      </div>
      <div class="flex items-center gap-2">
        <button type="submit" class="rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          {mode === 'edit' ? 'Save changes' : 'Create item'}
        </button>
        <button
          type="button"
          class="rounded border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
          on:click={() => window.history.back()}
        >
          Cancel
        </button>
      </div>
    </form>
  {/if}
</section>
