<script setup>
import { computed, ref, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import api from '../services/api';
import { useAuthStore } from '../store/auth';

const { article } = toRefs(
  defineProps({
    article: { type: Object, required: true },
  }),
);

const emit = defineEmits(['refresh', 'edit', 'delete']);
const auth = useAuthStore();
const busy = ref(false);

const isAuthor = computed(() => auth.username === article.value.author.username);

const toggleFollow = async () => {
  if (!auth.isAuthenticated) return;
  busy.value = true;
  try {
    const updatedProfile = article.value.author.following
      ? await api.unfollow(article.value.author.username)
      : await api.follow(article.value.author.username);
    emit('refresh', { ...article.value, author: updatedProfile });
  } finally {
    busy.value = false;
  }
};

const toggleFavorite = async () => {
  if (!auth.isAuthenticated) return;
  busy.value = true;
  try {
    const updated = article.value.favorited
      ? await api.unfavoriteArticle(article.value.slug)
      : await api.favoriteArticle(article.value.slug);
    emit('refresh', updated);
  } finally {
    busy.value = false;
  }
};
</script>

<template>
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

    <template v-if="isAuthor">
      <button class="btn btn-outline-secondary btn-sm" @click="emit('edit')">
        <i class="ion-edit"></i> Edit Article
      </button>
      <button class="btn btn-outline-danger btn-sm" :disabled="busy" @click="emit('delete')">
        <i class="ion-trash-a"></i> Delete Article
      </button>
    </template>
    <template v-else>
      <button class="btn btn-sm btn-outline-secondary" :disabled="busy" @click="toggleFollow">
        <i class="ion-plus-round"></i>
        {{ article.author.following ? 'Unfollow' : 'Follow' }} {{ article.author.username }}
      </button>
      <button class="btn btn-sm" :class="article.favorited ? 'btn-primary' : 'btn-outline-primary'" :disabled="busy" @click="toggleFavorite">
        <i class="ion-heart"></i>
        {{ article.favorited ? 'Unfavorite' : 'Favorite' }} Post ({{ article.favoritesCount }})
      </button>
    </template>
  </div>
</template>
