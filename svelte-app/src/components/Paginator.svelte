<script lang="ts">
  export let page = 1;
  export let pageSize = 25;
  export let total = 0;
  export let pageSizeOptions: number[] = [10, 25, 50, 100];
  export let onPageChange: (page: number) => void;
  export let onPageSizeChange: (size: number) => void;

  const range = (from: number, to: number) => {
    const values: number[] = [];
    for (let value = from; value <= to; value += 1) {
      values.push(value);
    }
    return values;
  };

  $: totalPages = Math.max(1, Math.ceil(total / pageSize));
  $: pages = range(1, totalPages).slice(0, 5);
</script>

<div class="flex flex-wrap items-center justify-between gap-4">
  <div class="flex items-center gap-2 text-sm text-slate-600">
    <span>Rows per page</span>
    <select
      class="rounded border border-slate-300 px-3 py-1 text-sm"
      bind:value={pageSize}
      on:change={(event) => onPageSizeChange(Number((event.target as HTMLSelectElement).value))}
    >
      {#each pageSizeOptions as option}
        <option value={option}>{option}</option>
      {/each}
    </select>
  </div>
  <div class="flex items-center gap-2 text-sm text-slate-600">
    <span>Page {page} of {totalPages}</span>
    <div class="flex items-center gap-1">
      <button
        type="button"
        class="rounded border border-slate-300 px-2 py-1 text-sm disabled:opacity-40"
        on:click={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        Prev
      </button>
      {#each pages as pageNumber}
        <button
          type="button"
          class={`rounded px-3 py-1 text-sm ${
            pageNumber === page ? 'bg-brand text-white' : 'border border-slate-300 text-slate-600'
          }`}
          on:click={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </button>
      {/each}
      <button
        type="button"
        class="rounded border border-slate-300 px-2 py-1 text-sm disabled:opacity-40"
        on:click={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  </div>
</div>
