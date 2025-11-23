<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { createArticle, fetchArticle, updateArticle } from '../services/api'

const props = defineProps<{ slug?: string }>()
const router = useRouter()

const title = ref('')
const description = ref('')
const body = ref('')
const tagList = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

const loadArticle = async () => {
  if (!props.slug) return
  const { article } = await fetchArticle(props.slug)
  title.value = article.title
  description.value = article.description
  body.value = article.body
  tagList.value = article.tagList.join(', ')
}

const submit = async () => {
  loading.value = true
  error.value = null
  try {
    const payload = {
      title: title.value,
      description: description.value,
      body: body.value,
      tagList: tagList.value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    }

    const { article } = props.slug
      ? await updateArticle(props.slug, payload)
      : await createArticle(payload)

    router.push(`/article/${article.slug}`)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to save article'
  } finally {
    loading.value = false
  }
}

onMounted(loadArticle)

watchEffect(() => {
  document.title = props.slug ? 'Edit Article - Conduit' : 'New Article - Conduit'
})
</script>

<template>
  <section class="container" style="max-width: 800px; padding: 2rem 0">
    <h1>{{ props.slug ? 'Edit article' : 'New article' }}</h1>
    <p v-if="error" class="error-text">{{ error }}</p>

    <form class="card" @submit.prevent="submit">
      <div class="form-group">
        <label for="title">Title</label>
        <input id="title" v-model="title" class="input" required />
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <input id="description" v-model="description" class="input" required />
      </div>
      <div class="form-group">
        <label for="body">Body</label>
        <textarea id="body" v-model="body" class="textarea" rows="8" required></textarea>
      </div>
      <div class="form-group">
        <label for="tagList">Tags (comma separated)</label>
        <input id="tagList" v-model="tagList" class="input" placeholder="tag1, tag2" />
      </div>
      <button class="button primary" type="submit" :disabled="loading">
        {{ loading ? 'Saving...' : 'Publish' }}
      </button>
    </form>
  </section>
</template>
