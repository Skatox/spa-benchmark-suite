<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import ArticlePreview from '../components/ArticlePreview.vue'
import {
  favoriteArticle,
  fetchArticles,
  fetchTags,
  fetchUserFeed,
  type Article,
} from '../services/api'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const feedType = ref<'global' | 'personal' | 'tag'>('global')
const selectedTag = ref<string | null>(null)
const articles = ref<Article[]>([])
const tags = ref<string[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const heading = computed(() => {
  if (feedType.value === 'personal') return 'Your feed'
  if (feedType.value === 'tag' && selectedTag.value) return `#${selectedTag.value}`
  return 'Global feed'
})

const loadTags = async () => {
  const { tags: popularTags } = await fetchTags()
  tags.value = popularTags
}

const loadArticles = async () => {
  loading.value = true
  error.value = null

  try {
    if (feedType.value === 'personal') {
      const { articles: feed } = await fetchUserFeed({ limit: 10, offset: 0 })
      articles.value = feed
      return
    }

    const params: Record<string, string | number | undefined> = {
      limit: 10,
      offset: 0,
    }
    if (feedType.value === 'tag' && selectedTag.value) {
      params.tag = selectedTag.value
    }
    const { articles: list } = await fetchArticles(params)
    articles.value = list
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load articles'
  } finally {
    loading.value = false
  }
}

const setFeed = (type: 'global' | 'personal' | 'tag', tag?: string) => {
  if (type === 'personal' && !authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: '/' } })
    return
  }

  feedType.value = type
  selectedTag.value = tag ?? null
}

const handleFavorite = async (article: Article) => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: '/' } })
    return
  }

  try {
    const { article: updated } = await favoriteArticle(article.slug, article.favorited)
    articles.value = articles.value.map((item) => (item.slug === article.slug ? updated : item))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to update favorite'
  }
}

onMounted(async () => {
  await Promise.all([loadTags(), loadArticles()])
})

watch([feedType, selectedTag], loadArticles)
</script>

<template>
  <div>
    <section class="hero">
      <div class="container">
        <h1 style="margin: 0">conduit</h1>
        <p class="helper-text" style="color: #e6ffe6">A place to share your knowledge.</p>
      </div>
    </section>

    <section class="container" style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem">
      <div>
        <div class="feed-toggle">
          <button :class="{ active: feedType === 'global' }" @click="setFeed('global')">Global feed</button>
          <button :class="{ active: feedType === 'personal' }" @click="setFeed('personal')">
            Your feed
          </button>
          <button v-if="selectedTag" :class="{ active: feedType === 'tag' }" @click="setFeed('tag')">
            #{{ selectedTag }}
          </button>
        </div>

        <div class="card" style="padding: 0 1rem;">
          <header class="page-header">
            <h2 style="margin: 1rem 0">{{ heading }}</h2>
          </header>

          <p v-if="error" class="error-text">{{ error }}</p>
          <p v-else-if="loading" class="helper-text">Loading articles...</p>
          <template v-else>
            <ArticlePreview
              v-for="article in articles"
              :key="article.slug"
              :article="article"
              :on-toggle-favorite="handleFavorite"
            />
            <p v-if="!articles.length" class="empty-state">No articles are here yet.</p>
          </template>
        </div>
      </div>

      <aside class="card">
        <h3 style="margin-top: 0">Popular tags</h3>
        <div class="tag-list">
          <button
            v-for="tag in tags"
            :key="tag"
            class="tag-pill"
            style="border: none; cursor: pointer"
            @click="setFeed('tag', tag)"
          >
            {{ tag }}
          </button>
        </div>
      </aside>
    </section>
  </div>
</template>
