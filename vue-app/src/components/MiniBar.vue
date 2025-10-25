<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  values: number[];
  labels?: string[];
}>();

const maxValue = computed(() => (props.values.length ? Math.max(...props.values) : 0));
</script>

<template>
  <div class="flex items-end gap-1" aria-hidden="true">
    <div v-for="(value, index) in values" :key="index" class="flex flex-col items-center gap-1">
      <div
        class="w-3 rounded bg-brand-light"
        :style="{ height: `${maxValue === 0 ? 4 : Math.round((value / maxValue) * 56)}px` }"
        :title="labels?.[index] ? `${labels[index]}: ${value}` : String(value)"
      />
      <span v-if="labels?.[index]" class="text-[10px] text-slate-500">{{ labels[index] }}</span>
    </div>
  </div>
</template>
