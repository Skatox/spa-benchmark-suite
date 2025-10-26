<script lang="ts">
  import Router from 'svelte-spa-router';
  import { wrap } from 'svelte-spa-router/wrap';
  import { onMount } from 'svelte';

  import Nav from './components/Nav.svelte';
  import AboutRoute from './routes/About.svelte';
  import DashboardRoute from './routes/Dashboard.svelte';
  import ItemDetailRoute from './routes/ItemDetail.svelte';
  import ItemFormRoute from './routes/ItemForm.svelte';
  import ItemsRoute from './routes/Items.svelte';
  import RedirectRoute from './routes/Redirect.svelte';
  import { METRICS, measure } from './utils/perf';

  onMount(() => {
    measure(METRICS.FIRST_ROUTE_MOUNTED, METRICS.APP_START);
  });

  const routes = {
    '/': DashboardRoute,
    '/items': ItemsRoute,
    '/items/new': wrap(ItemFormRoute, { props: { mode: 'create' } }),
    '/items/:id': ItemDetailRoute,
    '/items/:id/edit': wrap(ItemFormRoute, { props: { mode: 'edit' } }),
    '/about': AboutRoute,
    '*': wrap(RedirectRoute, { props: { to: '/' } }),
  };
</script>

<div class="min-h-screen bg-slate-100">
  <header class="bg-white shadow">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <h1 class="text-xl font-semibold text-slate-900">SPA Benchmark Suite</h1>
      <Nav />
    </div>
  </header>
  <main class="mx-auto max-w-6xl px-6 py-8">
    <Router {routes} />
  </main>
</div>
