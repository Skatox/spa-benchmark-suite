<script>
  import { onMount } from 'svelte'
  import Router from 'svelte-spa-router'
  import routes from './routes'
  import Header from './components/Header.svelte'
  import Footer from './components/Footer.svelte'
  import { token, loadUser } from './stores/auth'
  import { get } from 'svelte/store'

  onMount(() => {
    const existingToken = get(token)
    if (existingToken) loadUser(existingToken)
  })
</script>

<Header />
<main>
  <Router {routes} />
</main>
<Footer />
