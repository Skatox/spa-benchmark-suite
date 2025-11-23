<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import { useAuthStore } from '../store/auth';
import ArticleMeta from '../components/ArticleMeta.vue';
import CommentList from '../components/CommentList.vue';

const route = useRoute();
const router = useRouter();
const slug = route.params.slug;
const article = ref(null);
const comments = ref([]);
const newComment = ref('');
const commentLoading = ref(false);
const auth = useAuthStore();

const isAuthor = computed(() => auth.username === article.value?.author?.username);

const loadArticle = async () => {
  article.value = await api.getArticle(slug);
};

const loadComments = async () => {
  comments.value = await api.getComments(slug);
};

const removeArticle = async () => {
  if (!isAuthor.value) return;
  await api.deleteArticle(slug);
  router.push('/');
};

const submitComment = async () => {
  if (!auth.isAuthenticated || !newComment.value) return;
  commentLoading.value = true;
  try {
    const comment = await api.addComment(slug, newComment.value);
    comments.value.unshift(comment);
    newComment.value = '';
  } finally {
    commentLoading.value = false;
  }
};

const deleteComment = async (comment) => {
  await api.deleteComment(slug, comment.id);
  comments.value = comments.value.filter((c) => c.id !== comment.id);
};

const refreshArticle = (updated) => {
  article.value = updated;
};

const goToEdit = () => {
  router.push({ name: 'edit-article', params: { slug } });
};

onMounted(() => {
  loadArticle();
  loadComments();
});
</script>

<template>
  <div class="article-page" v-if="article">
    <div class="banner">
      <div class="container">
        <h1>{{ article.title }}</h1>
        <ArticleMeta :article="article" @refresh="refreshArticle" @edit="goToEdit" @delete="removeArticle" />
      </div>
    </div>

    <div class="container page">
      <div class="row article-content">
        <div class="col-md-12">
          <p>{{ article.body }}</p>
          <ul class="tag-list">
            <li class="tag-default tag-pill tag-outline" v-for="tag in article.tagList" :key="tag">{{ tag }}</li>
          </ul>
        </div>
      </div>

      <hr />

      <div class="article-actions">
        <ArticleMeta :article="article" @refresh="refreshArticle" @edit="goToEdit" @delete="removeArticle" />
      </div>

      <div class="row">
        <div class="col-xs-12 col-md-8 offset-md-2">
          <div v-if="auth.isAuthenticated" class="card comment-form">
            <div class="card-block">
              <textarea
                class="form-control"
                placeholder="Write a comment..."
                rows="3"
                v-model="newComment"
              ></textarea>
            </div>
            <div class="card-footer">
              <img :src="auth.user?.image" class="comment-author-img" />
              <button class="btn btn-sm btn-primary" :disabled="commentLoading" @click="submitComment">Post Comment</button>
            </div>
          </div>
          <p v-else>
            <a href="/login">Sign in</a> or <a href="/register">sign up</a> to add comments.
          </p>

          <CommentList :comments="comments" @delete="deleteComment" />
        </div>
      </div>
    </div>
  </div>
</template>
