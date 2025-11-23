<script setup>
import { computed, toRefs } from 'vue';

const { total, currentPage, limit } = toRefs(
  defineProps({
    total: { type: Number, required: true },
    currentPage: { type: Number, default: 1 },
    limit: { type: Number, default: 10 },
  }),
);

const emit = defineEmits(['change-page']);

const pages = computed(() => {
  const count = Math.ceil(total.value / limit.value);
  return Array.from({ length: count }, (_, i) => i + 1);
});
</script>

<template>
  <nav v-if="pages.length > 1">
    <ul class="pagination">
      <li
        v-for="page in pages"
        :key="page"
        class="page-item"
        :class="{ active: page === currentPage }"
        @click="emit('change-page', page)"
      >
        <a class="page-link" href="#">{{ page }}</a>
      </li>
    </ul>
  </nav>
</template>
