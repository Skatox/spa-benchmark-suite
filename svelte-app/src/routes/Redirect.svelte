<script lang="ts">
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';

  export let to = '/';

  onMount(() => {
    push(to);
  });
</script>

<p class="text-sm text-slate-500">Redirecting…</p>
