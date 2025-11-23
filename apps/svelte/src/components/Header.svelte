<script>
  import { user } from '../stores/auth'
  import { derived } from 'svelte/store'

  const username = derived(user, ($user) => $user?.username)
</script>

<header class="navbar">
  <div class="container" style="display: flex; align-items: center; justify-content: space-between;">
    <a class="logo" href="/">conduit</a>
    <nav class="nav-links">
      <a href="/">Home</a>
      {#if $username}
        <a href="/editor">New Article</a>
        <a href="/settings">Settings</a>
        <a href={`/profile/${$username}`}>{$username}</a>
      {:else}
        <a href="/login">Sign in</a>
        <a href="/register">Sign up</a>
      {/if}
    </nav>
  </div>
</header>
