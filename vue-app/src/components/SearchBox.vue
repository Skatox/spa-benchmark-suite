<script setup lang="ts">
defineProps<{
  value: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: 'update:value', value: string): void;
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:value', target.value);
};
</script>

<template>
  <div class="flex flex-1 items-center gap-2">
    <label for="search" class="sr-only">Search items</label>
    <input
      id="search"
      type="search"
      :value="value"
      :placeholder="placeholder ?? 'Search by name, SKU, or description'"
      class="w-full rounded border border-slate-300 px-3 py-2 text-sm"
      @input="handleInput"
    />
  </div>
</template>
