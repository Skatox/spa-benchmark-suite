<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)

const submit = async () => {
  try {
    await authStore.register(username.value, email.value, password.value)
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to sign up'
  }
}
</script>

<template>
  <section class="container" style="max-width: 500px; padding: 2rem 0">
    <h1>Sign up</h1>
    <RouterLink to="/login">Have an account?</RouterLink>

    <p v-if="authStore.error || error" class="error-text">{{ authStore.error || error }}</p>

    <form class="card" @submit.prevent="submit">
      <div class="form-group">
        <label for="username">Username</label>
        <input id="username" v-model="username" class="input" required />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" v-model="email" class="input" type="email" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input id="password" v-model="password" class="input" type="password" required />
      </div>
      <button class="button primary" type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Creating account...' : 'Sign up' }}
      </button>
    </form>
  </section>
</template>
