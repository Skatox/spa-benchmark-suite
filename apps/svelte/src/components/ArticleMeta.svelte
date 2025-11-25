<script>
  import { authStore } from '../stores/auth'
  import { articles as articleApi, profiles as profilesApi } from '../services/api'
  import { createEventDispatcher } from 'svelte'
  import { get } from 'svelte/store'

  export let article
  const dispatch = createEventDispatcher()

  async function toggleFavorite() {
    const currentToken = get(authStore).token
    if (!currentToken) return dispatch('favorite', article)
    const method = article.favorited ? articleApi.unfavorite : articleApi.favorite
    const response = await method(currentToken, article.slug)
    dispatch('favorite', response.article)
  }

  async function toggleFollow() {
    const currentToken = get(authStore).token
    if (!currentToken) return
    const method = article.author.following ? profilesApi.unfollow : profilesApi.follow
    const response = await method(currentToken, article.author.username)
    article = { ...article, author: response.profile }
  }
</script>

<div class="article-meta">
  <a href={`/profile/${article.author.username}`}>
    <img src={article.author.image || 'https://static.productionready.io/images/smiley-cyrus.jpg'} alt={article.author.username} />
  </a>
  <div class="info">
    <a href={`/profile/${article.author.username}`} class="author">{article.author.username}</a>
    <span class="date">{new Date(article.createdAt).toDateString()}</span>
  </div>
  <button class="btn small" on:click={toggleFollow}>
    {article.author.following ? 'Unfollow' : 'Follow'} {article.author.username}
  </button>
  <button class="btn small" on:click={toggleFavorite}>
    ❤ {article.favoritesCount}
  </button>
</div>
