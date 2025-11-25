<script>
  import { onMount } from 'svelte'
  import { profiles as profilesApi, articles as articleApi } from '../services/api'
  import { authStore } from '../stores/auth'
  import { get } from 'svelte/store'
  import ArticlePreview from '../components/ArticlePreview.svelte'
  import Pagination from '../components/Pagination.svelte'

  export let params
  let profile
  let articles = []
  let articlesCount = 0
  let tab = 'author'
  let page = 0
  const limit = 5

  async function loadProfile() {
    const response = await profilesApi.get(params.username, get(authStore).token || undefined)
    profile = response.profile
  }

  async function loadArticles() {
    const query = { limit, offset: page * limit }
    if (tab === 'favorites') {
      query.favorited = params.username
    } else {
      query.author = params.username
    }
    const response = await articleApi.list(query, get(authStore).token || undefined)
    articles = response.articles
    articlesCount = response.articlesCount
  }

  onMount(() => {
    loadProfile()
    loadArticles()
  })

  async function toggleFollow() {
    const currentToken = get(authStore).token
    if (!currentToken) return
    const method = profile.following ? profilesApi.unfollow : profilesApi.follow
    const response = await method(currentToken, params.username)
    profile = response.profile
  }

  function changeTab(name) {
    tab = name
    page = 0
    loadArticles()
  }

  function changePage(p) {
    page = p
    loadArticles()
  }

  function updateArticle(event) {
    const updated = event.detail
    articles = articles.map((a) => (a.slug === updated.slug ? updated : a))
  }
</script>

{#if profile}
  <div class="banner" style="background: #f3f3f3; color: #000;">
    <div class="container" style="text-align: center;">
      <img src={profile.image || 'https://static.productionready.io/images/smiley-cyrus.jpg'} alt={profile.username} width="100" height="100" style="border-radius: 50%;" />
      <h2>{profile.username}</h2>
      <p>{profile.bio}</p>
      {#if $authStore.user?.username !== profile.username}
        <button class="btn" on:click={toggleFollow}>{profile.following ? 'Unfollow' : 'Follow'} {profile.username}</button>
      {/if}
    </div>
  </div>
{/if}

<div class="container">
  <div class="feed-toggle">
    <ul>
      <li class:active={tab === 'author'}><a href="javascript:void(0)" on:click={() => changeTab('author')}>My Articles</a></li>
      <li class:active={tab === 'favorites'}><a href="javascript:void(0)" on:click={() => changeTab('favorites')}>Favorited Articles</a></li>
    </ul>
  </div>

  {#each articles as article}
    <ArticlePreview {article} on:favorite={updateArticle} />
  {/each}
  <Pagination total={articlesCount} limit={limit} current={page} on:change={(event) => changePage(event.detail)} />
</div>
