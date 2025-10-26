<script lang="ts">
  export let label: string;
  export let value: string | number;
  export let helperText: string | undefined = undefined;
</script>

<div class="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
  <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
  <span class="text-2xl font-bold text-slate-900">{value}</span>
  {#if helperText}
    <span class="text-xs text-slate-500">{helperText}</span>
  {/if}
</div>
