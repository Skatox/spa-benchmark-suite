<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ArticlePreview from '../components/ArticlePreview.vue'
import {
  addComment,
  deleteArticle,
  deleteComment,
  favoriteArticle,
  fetchArticle,
  fetchComments,
  followUser,
  type Article,
  type Comment,
} from '../services/api'
import { useAuthStore } from '../stores/auth'

const props = defineProps<{ slug: string }>()
const authStore = useAuthStore()
const router = useRouter()

const article = ref<Article | null>(null)
const comments = ref<Comment[]>([])
const loading = ref(true)
const commentText = ref('')
const error = ref<string | null>(null)

const isOwner = computed(() =>
  Boolean(authStore.user && article.value && authStore.user.username === article.value.author.username),
)

const loadArticle = async () => {
  loading.value = true
  error.value = null
  try {
    const [{ article: loaded }, { comments: loadedComments }] = await Promise.all([
      fetchArticle(props.slug),
      fetchComments(props.slug),
    ])
    article.value = loaded
    comments.value = loadedComments
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load article'
  } finally {
    loading.value = false
  }
}

const toggleFavorite = async () => {
  if (!authStore.isAuthenticated || !article.value) {
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }
  const { article: updated } = await favoriteArticle(article.value.slug, article.value.favorited)
  article.value = updated
}

const toggleFollow = async () => {
  if (!authStore.isAuthenticated || !article.value) {
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }
  const { profile } = await followUser(article.value.author.username, article.value.author.following)
  article.value = { ...article.value, author: profile }
}

const submitComment = async () => {
  if (!authStore.isAuthenticated || !article.value) {
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }

  if (!commentText.value.trim()) return

  const { comment } = await addComment(article.value.slug, commentText.value)
  comments.value.unshift(comment)
  commentText.value = ''
}

const removeComment = async (commentId: number) => {
  if (!article.value) return
  await deleteComment(article.value.slug, commentId)
  comments.value = comments.value.filter((comment) => comment.id !== commentId)
}

const removeArticle = async () => {
  if (!article.value) return
  await deleteArticle(article.value.slug)
  router.push('/')
}

onMounted(loadArticle)
</script>

<template>
  <section class="container" style="padding: 2rem 0">
    <p v-if="error" class="error-text">{{ error }}</p>
    <p v-else-if="loading" class="helper-text">Loading article...</p>

    <template v-else-if="article">
      <div class="card" style="margin-bottom: 1rem">
        <div class="page-header">
          <div>
            <h1 style="margin: 0">{{ article.title }}</h1>
            <p class="helper-text">{{ new Date(article.createdAt).toLocaleString() }}</p>
          </div>
          <div class="article-actions">
            <button class="button secondary" type="button" @click="toggleFollow">
              {{ article.author.following ? 'Unfollow' : 'Follow' }} {{ article.author.username }}
            </button>
            <button class="button secondary" type="button" @click="toggleFavorite">
              ❤ {{ article.favoritesCount }}
            </button>
            <button v-if="isOwner" class="button primary" type="button" @click="router.push(`/editor/${article.slug}`)">
              Edit
            </button>
            <button v-if="isOwner" class="button danger" type="button" @click="removeArticle">
              Delete
            </button>
          </div>
        </div>
        <p style="white-space: pre-wrap">{{ article.body }}</p>
        <div class="tag-list">
          <span v-for="tag in article.tagList" :key="tag" class="tag-pill">{{ tag }}</span>
        </div>
      </div>

      <section class="card" style="margin-bottom: 1rem">
        <h3>Comments</h3>
        <div v-if="authStore.isAuthenticated" class="form-group">
          <textarea
            v-model="commentText"
            class="textarea"
            rows="3"
            placeholder="Write a comment..."
          ></textarea>
          <button class="button primary" type="button" @click="submitComment">Post comment</button>
        </div>
        <div v-else class="helper-text">
          <RouterLink to="/login">Sign in</RouterLink>
          <span> or </span>
          <RouterLink to="/register">sign up</RouterLink>
          <span> to add comments.</span>
        </div>

        <div v-if="comments.length" style="display: flex; flex-direction: column; gap: 0.75rem">
          <article v-for="comment in comments" :key="comment.id" class="comment">
            <div class="comment-header">
              <div>
                <strong>{{ comment.author.username }}</strong>
                <span class="helper-text"> · {{ new Date(comment.createdAt).toLocaleString() }}</span>
              </div>
              <button
                v-if="comment.author.username === authStore.user?.username"
                class="button secondary"
                type="button"
                @click="removeComment(comment.id)"
              >
                Delete
              </button>
            </div>
            <p style="margin: 0">{{ comment.body }}</p>
          </article>
        </div>
        <p v-else class="helper-text">No comments yet.</p>
      </section>

      <section class="card">
        <h3>More from {{ article.author.username }}</h3>
        <ArticlePreview :article="article" :on-toggle-favorite="toggleFavorite" />
      </section>
    </template>
  </section>
</template>
