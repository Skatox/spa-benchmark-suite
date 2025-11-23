<script>
  import { createEventDispatcher } from 'svelte'
  import ArticleMeta from './ArticleMeta.svelte'

  export let article
  const dispatch = createEventDispatcher()

  function onFavorite() {
    dispatch('favorite', article)
  }
</script>

<div class="article-preview">
  <ArticleMeta {article} on:favorite={onFavorite} />
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
