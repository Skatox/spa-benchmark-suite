<script setup>
import { toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '../store/auth';

const { comments } = toRefs(
  defineProps({
    comments: { type: Array, default: () => [] },
  }),
);

const emit = defineEmits(['delete']);
const auth = useAuthStore();
</script>

<template>
  <div>
    <div class="card" v-for="comment in comments" :key="comment.id">
      <div class="card-block">
        <p class="card-text">{{ comment.body }}</p>
      </div>
      <div class="card-footer">
        <RouterLink class="comment-author" :to="{ name: 'profile', params: { username: comment.author.username } }">
          <img :src="comment.author.image" class="comment-author-img" />
        </RouterLink>
        &nbsp;
        <RouterLink class="comment-author" :to="{ name: 'profile', params: { username: comment.author.username } }">
          {{ comment.author.username }}
        </RouterLink>
        <span class="date-posted">{{ new Date(comment.createdAt).toDateString() }}</span>
        <span v-if="auth.username === comment.author.username" class="mod-options">
          <i class="ion-trash-a" @click="emit('delete', comment)"></i>
        </span>
      </div>
    </div>
  </div>
</template>
