<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '../store/auth';

const auth = useAuthStore();
const route = useRoute();

const isActive = (name) => route.name === name;
const currentUser = computed(() => auth.user);
</script>

<template>
  <nav class="navbar navbar-light">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">conduit</RouterLink>

      <ul class="nav navbar-nav pull-xs-right">
        <li class="nav-item">
          <RouterLink class="nav-link" :class="{ active: isActive('home') }" to="/">Home</RouterLink>
        </li>
        <template v-if="auth.isAuthenticated">
          <li class="nav-item">
            <RouterLink class="nav-link" :class="{ active: isActive('new-article') }" to="/editor">
              <i class="ion-compose"></i>&nbsp;New Article
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :class="{ active: isActive('settings') }" to="/settings">
              <i class="ion-gear-a"></i>&nbsp;Settings
            </RouterLink>
          </li>
          <li class="nav-item" v-if="currentUser">
            <RouterLink
              class="nav-link"
              :class="{ active: route.params.username === currentUser.username }"
              :to="{ name: 'profile', params: { username: currentUser.username } }"
            >
              <img v-if="currentUser.image" :src="currentUser.image" class="user-pic" alt="avatar" />
              {{ currentUser.username }}
            </RouterLink>
          </li>
        </template>
        <template v-else>
          <li class="nav-item">
            <RouterLink class="nav-link" :class="{ active: isActive('login') }" to="/login">Sign in</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :class="{ active: isActive('register') }" to="/register">Sign up</RouterLink>
          </li>
        </template>
      </ul>
    </div>
  </nav>
</template>
