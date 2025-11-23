<script setup>
import { defineEmits, defineProps, toRefs } from 'vue';
import ArticlePreview from './ArticlePreview.vue';
import Pagination from './Pagination.vue';

const { articles, total, page, loading } = toRefs(
  defineProps({
    articles: { type: Array, default: () => [] },
    total: { type: Number, default: 0 },
    page: { type: Number, default: 1 },
    loading: { type: Boolean, default: false },
  }),
);

const emit = defineEmits(['change-page', 'update-article']);
</script>

<template>
  <div>
    <p v-if="loading">Loading articles...</p>
    <p v-else-if="!articles.length">No articles are here... yet.</p>
    <template v-else>
      <ArticlePreview
        v-for="article in articles"
        :key="article.slug"
        :article="article"
        @update-article="emit('update-article', $event)"
      />
      <Pagination :total="total" :current-page="page" @change-page="emit('change-page', $event)" />
    </template>
  </div>
</template>
