<script>
  import { onMount } from 'svelte'
  import { articles as articleApi } from '../services/api'
  import { token } from '../stores/auth'
  import { get } from 'svelte/store'
  import { push } from 'svelte-spa-router'

  export let params = {}
  let slug = params.slug
  let title = ''
  let description = ''
  let body = ''
  let tagInput = ''
  let tagList = []
  let errors = null

  onMount(async () => {
    if (slug) {
      const response = await articleApi.get(slug, get(token) || undefined)
      const article = response.article
      title = article.title
      description = article.description
      body = article.body
      tagList = article.tagList
    }
  })

  function addTag() {
    if (tagInput && !tagList.includes(tagInput)) {
      tagList = [...tagList, tagInput]
      tagInput = ''
    }
  }

  function removeTag(tag) {
    tagList = tagList.filter((t) => t !== tag)
  }

  async function submit(event) {
    event.preventDefault()
    errors = null
    const payload = { title, description, body, tagList }
    try {
      let response
      if (slug) {
        response = await articleApi.update(get(token), slug, payload)
      } else {
        response = await articleApi.create(get(token), payload)
      }
      push(`/article/${response.article.slug}`)
    } catch (err) {
      errors = err
    }
  }
</script>

<div class="container editor-page" style="max-width: 760px; margin-top: 20px;">
  {#if errors}
    <ul class="error-messages">
      {#each Object.entries(errors) as [key, value]}
        <li>{key} {value}</li>
      {/each}
    </ul>
  {/if}

  <form on:submit|preventDefault={submit}>
    <div class="form-group">
      <input placeholder="Article Title" bind:value={title} required />
    </div>
    <div class="form-group">
      <input placeholder="What's this article about?" bind:value={description} required />
    </div>
    <div class="form-group">
      <textarea placeholder="Write your article (in markdown)" bind:value={body} required></textarea>
    </div>
    <div class="form-group">
      <input placeholder="Enter tags" bind:value={tagInput} on:keydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
      <div style="margin-top: 10px;">
        {#each tagList as tag}
          <span style="margin-right: 5px;">{tag} <button class="btn small" type="button" on:click={() => removeTag(tag)}>x</button></span>
        {/each}
      </div>
    </div>
    <button class="btn primary" type="submit">Publish Article</button>
  </form>
</div>
