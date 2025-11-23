<script setup>
import { onMounted, ref, computed } from 'vue';
import { useAuthStore } from '../store/auth';
import api from '../services/api';
import ArticleList from '../components/ArticleList.vue';
import TagList from '../components/TagList.vue';

const auth = useAuthStore();
const articles = ref([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);
const tags = ref([]);
const selectedTag = ref('');
const activeTab = ref('global');
const limit = 10;

const showFeedTab = computed(() => auth.isAuthenticated);

const loadTags = async () => {
  tags.value = await api.getTags();
};

const loadArticles = async () => {
  loading.value = true;
  const params = { limit, offset: (page.value - 1) * limit };
  try {
    if (activeTab.value === 'feed') {
      const { articles: feedArticles, articlesCount } = await api.getFeed(params);
      articles.value = feedArticles;
      total.value = articlesCount;
    } else {
      if (activeTab.value === 'tag' && selectedTag.value) {
        params.tag = selectedTag.value;
      }
      const { articles: allArticles, articlesCount } = await api.getArticles(params);
      articles.value = allArticles;
      total.value = articlesCount;
    }
  } finally {
    loading.value = false;
  }
};

const changeTab = (tab) => {
  activeTab.value = tab;
  selectedTag.value = tab === 'tag' ? selectedTag.value : '';
  page.value = 1;
  loadArticles();
};

const handleTagSelect = (tag) => {
  selectedTag.value = tag;
  activeTab.value = 'tag';
  page.value = 1;
  loadArticles();
};

const handleUpdateArticle = (updated) => {
  articles.value = articles.value.map((a) => (a.slug === updated.slug ? updated : a));
};

onMounted(() => {
  loadTags();
  loadArticles();
});
</script>

<template>
  <div class="home-page">
    <div class="banner">
      <div class="container">
        <h1 class="logo-font">conduit</h1>
        <p>A place to share your knowledge.</p>
      </div>
    </div>

    <div class="container page">
      <div class="row">
        <div class="col-md-9">
          <div class="feed-toggle">
            <ul class="nav nav-pills outline-active">
              <li class="nav-item" v-if="showFeedTab">
                <a class="nav-link" :class="{ active: activeTab === 'feed' }" href="#" @click.prevent="changeTab('feed')"
                  >Your Feed</a
                >
              </li>
              <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'global' }" href="#" @click.prevent="changeTab('global')"
                  >Global Feed</a
                >
              </li>
              <li class="nav-item" v-if="activeTab === 'tag'">
                <a class="nav-link active" href="#">
                  <i class="ion-pound"></i>
                  {{ selectedTag }}
                </a>
              </li>
            </ul>
          </div>

          <ArticleList
            :articles="articles"
            :total="total"
            :page="page"
            :loading="loading"
            @change-page="(p) => {
              page = p;
              loadArticles();
            }"
            @update-article="handleUpdateArticle"
          />
        </div>

        <div class="col-md-3">
          <div class="sidebar">
            <p>Popular Tags</p>
            <TagList :tags="tags" @select="handleTagSelect" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
