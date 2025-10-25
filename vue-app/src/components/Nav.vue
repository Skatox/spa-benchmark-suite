<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline';

const links = [
  { label: 'Dashboard', to: '/' },
  { label: 'Items', to: '/items' },
  { label: 'About', to: '/about' },
];

const route = useRoute();

const isActive = (target: string) => {
  if (target === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(target);
};

const desktopLinks = computed(() => links);
</script>

<template>
  <Disclosure as="nav" class="w-full" v-slot="{ open }">
    <div class="flex items-center gap-2 md:hidden">
      <DisclosureButton class="inline-flex items-center justify-center rounded border border-slate-300 p-2 text-slate-600 hover:bg-slate-100">
        <span class="sr-only">Toggle navigation</span>
        <component :is="open ? XMarkIcon : Bars3Icon" class="h-5 w-5" aria-hidden="true" />
      </DisclosureButton>
      <span class="text-sm font-medium text-slate-700">Menu</span>
    </div>
    <div class="hidden gap-2 md:flex">
      <RouterLink
        v-for="link in desktopLinks"
        :key="link.to"
        :to="link.to"
        class="rounded px-3 py-2 text-sm font-medium transition-colors"
        :class="isActive(link.to) ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-100'"
      >
        {{ link.label }}
      </RouterLink>
    </div>
    <DisclosurePanel class="mt-3 flex flex-col gap-2 md:hidden">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="rounded px-3 py-2 text-sm font-medium transition-colors"
        :class="isActive(link.to) ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-100'"
      >
        {{ link.label }}
      </RouterLink>
    </DisclosurePanel>
  </Disclosure>
</template>
