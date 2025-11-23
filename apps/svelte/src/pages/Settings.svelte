<script>
  import { user, token, updateUser, logout } from '../stores/auth'
  import { goto } from 'svelte-spa-router'
  import { get } from 'svelte/store'

  let image = $user?.image || ''
  let username = $user?.username || ''
  let bio = $user?.bio || ''
  let email = $user?.email || ''
  let password = ''
  let errors = null

  $: if ($user && !username) {
    image = $user.image || ''
    username = $user.username
    bio = $user.bio || ''
    email = $user.email
  }

  async function submit(event) {
    event.preventDefault()
    try {
      await updateUser(get(token), { image, username, bio, email, ...(password ? { password } : {}) })
      goto('/')
    } catch (err) {
      errors = err
    }
  }
</script>

<div class="container" style="max-width: 660px; margin-top: 30px;">
  <h2>Your Settings</h2>
  {#if errors}
    <ul class="error-messages">
      {#each Object.entries(errors) as [key, value]}
        <li>{key} {value}</li>
      {/each}
    </ul>
  {/if}

  <form on:submit|preventDefault={submit}>
    <div class="form-group">
      <input placeholder="URL of profile picture" bind:value={image} />
    </div>
    <div class="form-group">
      <input placeholder="Username" bind:value={username} />
    </div>
    <div class="form-group">
      <textarea placeholder="Short bio about you" bind:value={bio}></textarea>
    </div>
    <div class="form-group">
      <input type="email" placeholder="Email" bind:value={email} />
    </div>
    <div class="form-group">
      <input type="password" placeholder="New Password" bind:value={password} />
    </div>
    <button class="btn primary" type="submit">Update Settings</button>
  </form>
  <hr />
  <button class="btn" on:click={() => { logout(); goto('/') }}>Or click here to logout.</button>
</div>
