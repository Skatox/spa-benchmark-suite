<script>
  import { onMount } from 'svelte'
  import Router from 'svelte-spa-router'
  import routes from './routes'
  import Header from './components/Header.svelte'
  import Footer from './components/Footer.svelte'
  import { authStore } from './stores/auth'

  onMount(() => {
    authStore.bootstrap()
  })
</script>

<Header />
<main>
  <Router {routes} />
</main>
<Footer />
