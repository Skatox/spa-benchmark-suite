<script>
  import { tags as tagApi } from '../services/api'
  import { onMount, createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()
  let tagList = []

  onMount(async () => {
    const response = await tagApi.all()
    tagList = response.tags
  })

  function selectTag(tag) {
    dispatch('select', tag)
  }
</script>

<div>
  <p>Popular Tags</p>
  <ul class="tag-list">
    {#each tagList as tag}
      <li on:click={() => selectTag(tag)}>{tag}</li>
    {/each}
  </ul>
</div>
