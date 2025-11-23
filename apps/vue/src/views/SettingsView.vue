<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const image = ref(authStore.user?.image ?? '')
const username = ref(authStore.user?.username ?? '')
const bio = ref(authStore.user?.bio ?? '')
const email = ref(authStore.user?.email ?? '')
const password = ref('')
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const submit = async () => {
  try {
    await authStore.updateProfile({
      image: image.value,
      username: username.value,
      bio: bio.value,
      email: email.value,
      password: password.value || undefined,
    })
    success.value = 'Profile updated successfully'
    error.value = null
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to update profile'
  }
}

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <section class="container" style="max-width: 600px; padding: 2rem 0">
    <h1>Your settings</h1>
    <p v-if="error" class="error-text">{{ error }}</p>
    <p v-if="success" class="helper-text" style="color: #5cb85c">{{ success }}</p>

    <form class="card" @submit.prevent="submit">
      <div class="form-group">
        <label for="image">Profile image</label>
        <input id="image" v-model="image" class="input" placeholder="Image URL" />
      </div>
      <div class="form-group">
        <label for="username">Username</label>
        <input id="username" v-model="username" class="input" required />
      </div>
      <div class="form-group">
        <label for="bio">Bio</label>
        <textarea id="bio" v-model="bio" class="textarea" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" v-model="email" class="input" type="email" required />
      </div>
      <div class="form-group">
        <label for="password">New password</label>
        <input id="password" v-model="password" class="input" type="password" placeholder="Optional" />
      </div>
      <div class="flex-between">
        <button class="button danger" type="button" @click="logout">Log out</button>
        <button class="button primary" type="submit">Update settings</button>
      </div>
    </form>
  </section>
</template>
