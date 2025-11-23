<script setup>
import { toRefs } from 'vue';

const { tags } = toRefs(
  defineProps({
    tags: { type: Array, default: () => [] },
  }),
);

const emit = defineEmits(['select']);
</script>

<template>
  <div class="tag-list">
    <span
      v-for="tag in tags"
      :key="tag"
      class="tag-default tag-pill"
      @click="emit('select', tag)"
    >
      {{ tag }}
    </span>
  </div>
</template>
