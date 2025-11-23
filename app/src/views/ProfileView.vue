<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';
import { useAuthStore } from '../store/auth';
import ArticleList from '../components/ArticleList.vue';

const route = useRoute();
const auth = useAuthStore();
const profile = ref(null);
const articles = ref([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);
const limit = 10;

const isFavorites = computed(() => route.name === 'profile-favorites');
const isCurrentUser = computed(() => auth.username === profile.value?.username);

const loadProfile = async () => {
  profile.value = await api.getProfile(route.params.username);
};

const loadArticles = async () => {
  loading.value = true;
  try {
    const params = { limit, offset: (page.value - 1) * limit };
    if (isFavorites.value) {
      params.favorited = route.params.username;
    } else {
      params.author = route.params.username;
    }
    const { articles: list, articlesCount } = await api.getArticles(params);
    articles.value = list;
    total.value = articlesCount;
  } finally {
    loading.value = false;
  }
};

const toggleFollow = async () => {
  if (!auth.isAuthenticated || !profile.value) return;
  profile.value = profile.value.following
    ? await api.unfollow(profile.value.username)
    : await api.follow(profile.value.username);
};

const handleUpdateArticle = (updated) => {
  articles.value = articles.value.map((a) => (a.slug === updated.slug ? updated : a));
};

watch(
  () => route.fullPath,
  () => {
    page.value = 1;
    loadProfile();
    loadArticles();
  },
);

onMounted(() => {
  loadProfile();
  loadArticles();
});
</script>

<template>
  <div class="profile-page" v-if="profile">
    <div class="user-info">
      <div class="container">
        <div class="row">
          <div class="col-xs-12 col-md-10 offset-md-1">
            <img :src="profile.image" class="user-img" />
            <h4>{{ profile.username }}</h4>
            <p>{{ profile.bio }}</p>
            <button
              v-if="!isCurrentUser"
              class="btn btn-sm action-btn btn-outline-secondary"
              :class="{ active: profile.following }"
              @click="toggleFollow"
            >
              <i class="ion-plus-round"></i>
              {{ profile.following ? 'Unfollow' : 'Follow' }} {{ profile.username }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-xs-12 col-md-10 offset-md-1">
          <div class="articles-toggle">
            <ul class="nav nav-pills outline-active">
              <li class="nav-item">
                <a
                  class="nav-link"
                  :class="{ active: !isFavorites }"
                  :href="`/profile/${profile.username}`"
                  @click.prevent="$router.push({ name: 'profile', params: { username: profile.username } })"
                  >My Articles</a
                >
              </li>
              <li class="nav-item">
                <a
                  class="nav-link"
                  :class="{ active: isFavorites }"
                  :href="`/profile/${profile.username}/favorites`"
                  @click.prevent="$router.push({ name: 'profile-favorites', params: { username: profile.username } })"
                  >Favorited Articles</a
                >
              </li>
            </ul>
          </div>

          <ArticleList
            :articles="articles"
            :total="total"
            :page="page"
            :loading="loading"
            @change-page="(p) => { page = p; loadArticles(); }"
            @update-article="handleUpdateArticle"
          />
        </div>
      </div>
    </div>
  </div>
</template>
