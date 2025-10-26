<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let value = '';
  export let placeholder = 'Search by name, SKU, or description';

  const dispatch = createEventDispatcher<{ change: string }>();

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    dispatch('change', target.value);
  }
</script>

<div class="flex flex-1 items-center gap-2">
  <label for="search" class="sr-only">Search items</label>
  <input
    id="search"
    type="search"
    class="w-full rounded border border-slate-300 px-3 py-2 text-sm"
    {placeholder}
    bind:value
    on:input={handleInput}
  />
</div>
