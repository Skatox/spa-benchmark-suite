<script lang="ts">
  export let values: number[] = [];
  export let labels: string[] | undefined = undefined;

  $: maxValue = values.length ? Math.max(...values) : 0;
</script>

<div class="flex items-end gap-1" aria-hidden="true">
  {#each values as value, index}
    <div class="flex flex-col items-center gap-1">
      <div
        class="w-3 rounded bg-brand-light"
        style={`height: ${maxValue === 0 ? 4 : Math.round((value / maxValue) * 56) || 4}px`}
        title={labels?.[index] ? `${labels[index]}: ${value}` : String(value)}
      />
      {#if labels?.[index]}
        <span class="text-[10px] text-slate-500">{labels[index]}</span>
      {/if}
    </div>
  {/each}
</div>
