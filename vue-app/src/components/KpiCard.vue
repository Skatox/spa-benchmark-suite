<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  helperText?: string;
}>();
</script>

<template>
  <div class="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ label }}</span>
    <span class="text-2xl font-bold text-slate-900">{{ value }}</span>
    <span v-if="helperText" class="text-xs text-slate-500">{{ helperText }}</span>
  </div>
</template>
