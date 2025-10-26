<script lang="ts">
  import { derived } from 'svelte/store';
  import { link, location } from 'svelte-spa-router';

  const currentRoute = derived(location, ($location) => $location ?? '/');

  const links = [
    { href: '/', label: 'Dashboard', exact: true },
    { href: '/items', label: 'Items' },
    { href: '/about', label: 'About' },
  ];

  function isActive(current: string, href: string, exact = false): boolean {
    if (exact) {
      return current === href;
    }
    return current === href || current.startsWith(`${href}/`);
  }
</script>

<nav class="flex gap-2">
  {#each links as item}
    <a
      href={item.href}
      use:link
      class={`rounded px-3 py-2 text-sm font-medium transition-colors ${
        isActive($currentRoute, item.href, item.exact)
          ? 'bg-brand text-white'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
      aria-current={isActive($currentRoute, item.href, item.exact) ? 'page' : undefined}
    >
      {item.label}
    </a>
  {/each}
</nav>
