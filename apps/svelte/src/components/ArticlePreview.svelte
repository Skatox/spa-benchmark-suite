<script>
  import { createEventDispatcher } from 'svelte'
  import ArticleMeta from './ArticleMeta.svelte'
  import { authStore } from '../stores/auth'
  import { articles as articleApi } from '../services/api'
  import { get } from 'svelte/store'

  export let article
  const dispatch = createEventDispatcher()

  async function onFavorite() {
    const currentToken = get(authStore).token
    if (!currentToken) return dispatch('favorite', article)
    const method = article.favorited ? articleApi.unfavorite : articleApi.favorite
    const response = await method(currentToken, article.slug)
    dispatch('favorite', response.article)
  }
</script>

<div class="article-preview">
  <div class="article-meta-row">
    <ArticleMeta {article} />
    <button class="btn small" on:click={onFavorite}>❤ {article.favoritesCount}</button>
  </div>
  <a href={`/article/${article.slug}`} style="color: inherit;">
    <h2>{article.title}</h2>
    <p>{article.description}</p>
    <span>Read more...</span>
  </a>
  {#if article.tagList?.length}
    <ul class="tag-list" style="margin-top: 10px;">
      {#each article.tagList as tag}
        <li>{tag}</li>
      {/each}
    </ul>
  {/if}
</div>
