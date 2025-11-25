<script>
  import { onMount } from 'svelte'
  import ArticlePreview from '../components/ArticlePreview.svelte'
  import TagSidebar from '../components/TagSidebar.svelte'
  import Pagination from '../components/Pagination.svelte'
  import { articles as articleApi } from '../services/api'
  import { authStore } from '../stores/auth'
  import { get } from 'svelte/store'

  let articles = []
  let articlesCount = 0
  let selectedTag = ''
  let page = 0
  let feed = 'global'
  const limit = 10

  async function loadArticles() {
    const params = { limit, offset: page * limit }
    if (selectedTag) params.tag = selectedTag
    let response
    if (feed === 'personal') {
      response = await articleApi.feed(params, get(authStore).token)
    } else {
      response = await articleApi.list(params, get(authStore).token || undefined)
    }
    articles = response.articles
    articlesCount = response.articlesCount
  }

  onMount(loadArticles)

  function setTag(tag) {
    selectedTag = tag
    feed = 'tag'
    page = 0
    loadArticles()
  }

  function selectFeed(name) {
    feed = name
    selectedTag = name === 'tag' ? selectedTag : ''
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

<section class="banner">
  <div class="container">
    <h1>conduit</h1>
    <p>A place to share your knowledge.</p>
  </div>
</section>

<div class="container" style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px;">
  <div>
    <div class="feed-toggle">
      <ul>
        {#if $authStore.user}
          <li class:active={feed === 'personal'}><a href="javascript:void(0)" on:click={() => selectFeed('personal')}>Your Feed</a></li>
        {/if}
        <li class:active={feed === 'global'}><a href="javascript:void(0)" on:click={() => selectFeed('global')}>Global Feed</a></li>
        {#if selectedTag}
          <li class:active={feed === 'tag'}><a href="javascript:void(0)"><i class="ion-pound"></i> #{selectedTag}</a></li>
        {/if}
      </ul>
    </div>

    {#if !articles.length}
      <p>No articles are here... yet.</p>
    {/if}

    {#each articles as article}
      <ArticlePreview {article} on:favorite={updateArticle} />
    {/each}

    <Pagination total={articlesCount} limit={limit} current={page} on:change={(event) => changePage(event.detail)} />
  </div>
  <div>
    <TagSidebar on:select={(event) => setTag(event.detail)} />
  </div>
</div>
