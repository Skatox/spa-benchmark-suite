<script>
  import { comments as commentsApi } from '../services/api'
  import { authStore } from '../stores/auth'
  import { get } from 'svelte/store'
  import { onMount } from 'svelte'

  export let slug
  let list = []
  let body = ''

  async function load() {
    const response = await commentsApi.list(slug, get(authStore).token || undefined)
    list = response.comments
  }

  onMount(load)

  async function submit() {
    const currentToken = get(authStore).token
    if (!currentToken) return
    const response = await commentsApi.create(currentToken, slug, body)
    list = [response.comment, ...list]
    body = ''
  }

  async function remove(id) {
    await commentsApi.delete(get(authStore).token, slug, id)
    list = list.filter((c) => c.id !== id)
  }
</script>

<div class="comment-section">
  {#if $authStore.user}
    <div class="comment comment-form">
      <textarea placeholder="Write a comment..." bind:value={body}></textarea>
      <div style="display: flex; justify-content: flex-end; align-items: center; margin-top: 10px; gap: 10px;">
        <img
          src={$authStore.user.image || 'https://static.productionready.io/images/smiley-cyrus.jpg'}
          alt={$authStore.user.username}
          width="32"
          height="32"
          style="border-radius: 50%;"
        />
        <button class="btn primary" on:click={submit}>Post Comment</button>
      </div>
    </div>
  {:else}
    <p style="text-align: center;"> <a href="/login">Sign in</a> or <a href="/register">sign up</a> to add comments.</p>
  {/if}

  {#each list as comment}
    <div class="comment">
      <p>{comment.body}</p>
      <div class="article-meta" style="justify-content: space-between;">
        <div class="article-meta">
          <a href={`/profile/${comment.author.username}`}>
            <img src={comment.author.image || 'https://static.productionready.io/images/smiley-cyrus.jpg'} alt={comment.author.username} />
          </a>
          <div class="info">
            <a href={`/profile/${comment.author.username}`} class="author">{comment.author.username}</a>
            <span class="date">{new Date(comment.createdAt).toDateString()}</span>
          </div>
        </div>
        {#if $authStore.user && comment.author.username === $authStore.user.username}
          <button class="btn small" on:click={() => remove(comment.id)}>Delete</button>
        {/if}
      </div>
    </div>
  {/each}
</div>
