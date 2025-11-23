<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Article } from '../services/api'

const props = defineProps<{
  article: Article
  onToggleFavorite?: (article: Article) => void
}>()

const formattedDate = computed(() => new Date(props.article.createdAt).toLocaleDateString())
</script>

<template>
  <article class="article-preview">
    <div class="flex-between">
      <div class="article-meta">
        <RouterLink :to="`/profile/${article.author.username}`">
          <img :src="article.author.image || 'https://static.productionready.io/images/smiley-cyrus.jpg'" />
        </RouterLink>
        <div>
          <RouterLink :to="`/profile/${article.author.username}`">
            <strong>{{ article.author.username }}</strong>
          </RouterLink>
          <div>{{ formattedDate }}</div>
        </div>
      </div>
      <button class="button secondary" type="button" @click="onToggleFavorite?.(article)">
        ❤ {{ article.favoritesCount }}
      </button>
    </div>
    <RouterLink :to="`/article/${article.slug}`">
      <h3 style="margin-bottom: 0.35rem">{{ article.title }}</h3>
      <p class="helper-text" style="margin: 0">{{ article.description }}</p>
    </RouterLink>
    <div class="tag-list" style="margin-top: 0.75rem">
      <span v-for="tag in article.tagList" :key="tag" class="tag-pill">{{ tag }}</span>
    </div>
  </article>
</template>
