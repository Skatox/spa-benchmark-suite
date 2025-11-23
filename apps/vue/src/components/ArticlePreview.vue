<script setup>
import { useAuthStore } from '../store/auth';
import api from '../services/api';
import { RouterLink } from 'vue-router';
import { ref, toRefs } from 'vue';

const { article } = toRefs(
  defineProps({
    article: { type: Object, required: true },
  }),
);

const emit = defineEmits(['update-article']);
const auth = useAuthStore();
const toggling = ref(false);

const toggleFavorite = async () => {
  if (!auth.isAuthenticated) return;
  toggling.value = true;
  try {
    const updated = article.value.favorited
      ? await api.unfavoriteArticle(article.value.slug)
      : await api.favoriteArticle(article.value.slug);
    emit('update-article', updated);
  } finally {
    toggling.value = false;
  }
};
</script>

<template>
  <div class="article-preview">
    <div class="article-meta">
      <RouterLink :to="{ name: 'profile', params: { username: article.author.username } }">
        <img :src="article.author.image" alt="author avatar" />
      </RouterLink>
      <div class="info">
        <RouterLink class="author" :to="{ name: 'profile', params: { username: article.author.username } }">
          {{ article.author.username }}
        </RouterLink>
        <span class="date">{{ new Date(article.createdAt).toDateString() }}</span>
      </div>
      <button
        class="btn btn-sm pull-xs-right"
        :class="article.favorited ? 'btn-primary' : 'btn-outline-primary'"
        :disabled="toggling"
        @click="toggleFavorite"
      >
        <i class="ion-heart"></i> {{ article.favoritesCount }}
      </button>
    </div>

    <RouterLink class="preview-link" :to="{ name: 'article', params: { slug: article.slug } }">
      <h1>{{ article.title }}</h1>
      <p>{{ article.description }}</p>
      <span>Read more...</span>
      <ul class="tag-list">
        <li class="tag-default tag-pill tag-outline" v-for="tag in article.tagList" :key="tag">{{ tag }}</li>
      </ul>
    </RouterLink>
  </div>
</template>
