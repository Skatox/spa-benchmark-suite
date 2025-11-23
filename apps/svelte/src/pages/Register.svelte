<script>
  import { register } from '../stores/auth'
  import { goto } from 'svelte-spa-router'

  let username = ''
  let email = ''
  let password = ''
  let errors = null

  async function submit(event) {
    event.preventDefault()
    errors = null
    try {
      await register(username, email, password)
      goto('/')
    } catch (err) {
      errors = err
    }
  }
</script>

<div class="container" style="max-width: 540px; margin-top: 30px;">
  <h2>Sign up</h2>
  <p><a href="/login">Have an account?</a></p>

  {#if errors}
    <ul class="error-messages">
      {#each Object.entries(errors) as [key, value]}
        <li>{key} {value}</li>
      {/each}
    </ul>
  {/if}

  <form on:submit|preventDefault={submit}>
    <div class="form-group">
      <input type="text" placeholder="Username" bind:value={username} required />
    </div>
    <div class="form-group">
      <input type="email" placeholder="Email" bind:value={email} required />
    </div>
    <div class="form-group">
      <input type="password" placeholder="Password" bind:value={password} required />
    </div>
    <button class="btn primary" type="submit">Sign up</button>
  </form>
</div>
