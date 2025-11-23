<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const currentUser = computed(() => authStore.user)

onMounted(() => {
  authStore.bootstrap()
})

const isActive = (path: string) => route.path === path
</script>

<template>
  <div>
    <header class="navbar">
      <div class="container navbar-content">
        <RouterLink to="/" class="navbar-logo">conduit</RouterLink>
        <nav class="navbar-links">
          <RouterLink :class="['navbar-link', { active: isActive('/') }]" to="/">
            Home
          </RouterLink>
          <template v-if="currentUser">
            <RouterLink
              :class="['navbar-link', { active: isActive('/editor') }]"
              to="/editor"
            >
              New Article
            </RouterLink>
            <RouterLink
              :class="['navbar-link', { active: isActive('/settings') }]"
              to="/settings"
            >
              Settings
            </RouterLink>
            <RouterLink
              :class="['navbar-link', { active: route.path.startsWith('/profile') }]"
              :to="`/profile/${currentUser.username}`"
            >
              {{ currentUser.username }}
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink :class="['navbar-link', { active: isActive('/login') }]" to="/login">
              Sign in
            </RouterLink>
            <RouterLink
              :class="['navbar-link', { active: isActive('/register') }]"
              to="/register"
            >
              Sign up
            </RouterLink>
          </template>
        </nav>
      </div>
    </header>
    <main>
      <RouterView />
    </main>
    <footer class="hero" style="margin-top: 3rem">
      <div class="container">
        <p>RealWorld implementation built with Vue 3, Vite, and Pinia.</p>
      </div>
    </footer>
  </div>
</template>
