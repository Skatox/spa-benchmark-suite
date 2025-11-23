<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArticlePreview from '../components/ArticlePreview.vue'
import { favoriteArticle, fetchArticles, fetchProfile, followUser, type Article, type Profile } from '../services/api'
import { useAuthStore } from '../stores/auth'

const props = defineProps<{ username: string }>()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const profile = ref<Profile | null>(null)
const articles = ref<Article[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const isCurrentUser = computed(() => authStore.user?.username === props.username)
const showingFavorites = computed(() => route.name === 'profile-favorites')

const loadProfile = async () => {
  const { profile: userProfile } = await fetchProfile(props.username)
  profile.value = userProfile
}

const loadArticles = async () => {
  loading.value = true
  error.value = null
  try {
    const params = showingFavorites.value
      ? { favorited: props.username, limit: 10, offset: 0 }
      : { author: props.username, limit: 10, offset: 0 }
    const { articles: list } = await fetchArticles(params)
    articles.value = list
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load articles'
  } finally {
    loading.value = false
  }
}

const toggleFollow = async () => {
  if (!authStore.isAuthenticated || !profile.value) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  const { profile: updated } = await followUser(profile.value.username, profile.value.following)
  profile.value = updated
}

const handleFavorite = async (article: Article) => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  const { article: updated } = await favoriteArticle(article.slug, article.favorited)
  articles.value = articles.value.map((item) => (item.slug === article.slug ? updated : item))
}

onMounted(async () => {
  await Promise.all([loadProfile(), loadArticles()])
})

watch(showingFavorites, loadArticles)
watch(
  () => props.username,
  async () => {
    await Promise.all([loadProfile(), loadArticles()])
  },
)
</script>

<template>
  <section class="container" style="padding: 2rem 0">
    <p v-if="error" class="error-text">{{ error }}</p>

    <div v-else-if="profile" class="card" style="margin-bottom: 1rem">
      <div class="page-header">
        <div class="flex-between" style="width: 100%">
          <div style="display: flex; gap: 1rem; align-items: center">
            <img
              :src="profile.image || 'https://static.productionready.io/images/smiley-cyrus.jpg'"
              alt="Profile"
              style="width: 80px; height: 80px; border-radius: 50%"
            />
            <div>
              <h2 style="margin: 0">{{ profile.username }}</h2>
              <p class="helper-text" style="margin: 0">{{ profile.bio }}</p>
            </div>
          </div>
          <div>
            <RouterLink v-if="isCurrentUser" class="button secondary" to="/settings">
              Edit profile settings
            </RouterLink>
            <button v-else class="button secondary" type="button" @click="toggleFollow">
              {{ profile.following ? 'Unfollow' : 'Follow' }} {{ profile.username }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="feed-toggle" style="margin-bottom: 0">
        <RouterLink
          :class="['navbar-link', { active: !showingFavorites } ]"
          :to="`/profile/${props.username}`"
          style="padding: 0"
        >
          My articles
        </RouterLink>
        <RouterLink
          :class="['navbar-link', { active: showingFavorites } ]"
          :to="`/profile/${props.username}/favorites`"
          style="padding: 0"
        >
          Favorited articles
        </RouterLink>
      </div>

      <p v-if="loading" class="helper-text">Loading articles...</p>
      <template v-else>
        <ArticlePreview
          v-for="article in articles"
          :key="article.slug"
          :article="article"
          :on-toggle-favorite="handleFavorite"
        />
        <p v-if="!articles.length" class="empty-state">No articles to display.</p>
      </template>
    </div>
  </section>
</template>
