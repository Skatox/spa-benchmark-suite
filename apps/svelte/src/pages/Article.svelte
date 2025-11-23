<script>
  import { onMount } from 'svelte'
  import { articles as articleApi } from '../services/api'
  import { token, user } from '../stores/auth'
  import { get } from 'svelte/store'
  import CommentList from '../components/CommentList.svelte'
  import { goto } from 'svelte-spa-router'

  export let params
  let article

  async function loadArticle() {
    const response = await articleApi.get(params.slug, get(token) || undefined)
    article = response.article
  }

  onMount(loadArticle)

  async function toggleFavorite() {
    if (!get(token)) return
    const method = article.favorited ? articleApi.unfavorite : articleApi.favorite
    const response = await method(get(token), article.slug)
    article = response.article
  }

  async function toggleFollow() {
    if (!get(token)) return
    const method = article.author.following ? articleApi.unfollow : articleApi.follow
    const response = await method(get(token), article.author.username)
    article = { ...article, author: response.profile }
  }

  async function removeArticle() {
    if (!get(token)) return
    await articleApi.delete(get(token), article.slug)
    goto('/')
  }
</script>

{#if article}
  <div class="article-page">
    <div class="banner">
      <div class="container">
        <h1>{article.title}</h1>
        <div class="article-meta">
          <a href={`/profile/${article.author.username}`}>
            <img src={article.author.image || 'https://static.productionready.io/images/smiley-cyrus.jpg'} alt={article.author.username} />
          </a>
          <div class="info">
            <a href={`/profile/${article.author.username}`} class="author">{article.author.username}</a>
            <span class="date">{new Date(article.createdAt).toDateString()}</span>
          </div>
          <button class="btn small" on:click={toggleFollow}>{article.author.following ? 'Unfollow' : 'Follow'} {article.author.username}</button>
          <button class="btn small" on:click={toggleFavorite}>❤ {article.favoritesCount}</button>
          {#if $user?.username === article.author.username}
            <a class="btn small" href={`/editor/${article.slug}`}>Edit Article</a>
            <button class="btn small" on:click={removeArticle}>Delete Article</button>
          {/if}
        </div>
      </div>
    </div>

    <div class="container">
      <div>
        <p>{article.body}</p>
        {#if article.tagList?.length}
          <ul class="tag-list">
            {#each article.tagList as tag}
              <li>{tag}</li>
            {/each}
          </ul>
        {/if}
      </div>
      <hr />
      <CommentList slug={article.slug} />
    </div>
  </div>
{:else}
  <div class="container"><p>Loading article...</p></div>
{/if}
