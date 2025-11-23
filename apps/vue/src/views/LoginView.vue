<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)

const submit = async () => {
  try {
    await authStore.login(email.value, password.value)
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to sign in'
  }
}
</script>

<template>
  <section class="container" style="max-width: 500px; padding: 2rem 0">
    <h1>Sign in</h1>
    <RouterLink to="/register">Need an account?</RouterLink>

    <p v-if="authStore.error || error" class="error-text">{{ authStore.error || error }}</p>

    <form class="card" @submit.prevent="submit">
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" v-model="email" class="input" type="email" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input id="password" v-model="password" class="input" type="password" required />
      </div>
      <button class="button primary" type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Signing in...' : 'Sign in' }}
      </button>
    </form>
  </section>
</template>
