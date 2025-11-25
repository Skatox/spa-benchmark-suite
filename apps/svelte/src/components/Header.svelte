<script>
  import { derived } from 'svelte/store'
  import { location } from 'svelte-spa-router'
  import { authStore } from '../stores/auth'

  const username = derived(authStore, ($auth) => $auth.user?.username)
</script>

<header class="navbar">
  <div class="container navbar-content">
    <a class="navbar-logo" href="/">conduit</a>
    <nav class="navbar-links">
      <a class="navbar-link" class:active={$location === '/'} href="/">Home</a>
      {#if $username}
        <a class="navbar-link" class:active={$location.startsWith('/editor')} href="/editor">New Article</a>
        <a class="navbar-link" class:active={$location === '/settings'} href="/settings">Settings</a>
        <a
          class="navbar-link"
          class:active={$location.startsWith(`/profile/${$username}`)}
          href={`/profile/${$username}`}
        >
          {$username}
        </a>
      {:else}
        <a class="navbar-link" class:active={$location === '/login'} href="/login">Sign in</a>
        <a class="navbar-link" class:active={$location === '/register'} href="/register">Sign up</a>
      {/if}
    </nav>
  </div>
</header>
