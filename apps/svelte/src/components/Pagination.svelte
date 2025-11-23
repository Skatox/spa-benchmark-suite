<script>
  import { createEventDispatcher } from 'svelte'

  export let total = 0
  export let limit = 10
  export let current = 0

  const dispatch = createEventDispatcher()

  $: pages = Math.ceil(total / limit)
  $: numbers = Array.from({ length: pages }, (_, i) => i)

  function select(page) {
    dispatch('change', page)
  }
</script>

{#if pages > 1}
  <ul class="pagination">
    {#each numbers as n}
      <li class:active={n === current} on:click={() => select(n)}>{n + 1}</li>
    {/each}
  </ul>
{/if}
