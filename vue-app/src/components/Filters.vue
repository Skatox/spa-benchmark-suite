<script setup lang="ts">
import { computed } from 'vue';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';

import type { SortDirection, SortField } from '../api/items';

const props = defineProps<{
  category: string;
  categories: string[];
  sortBy: SortField;
  sortDir: SortDirection;
}>();

const emit = defineEmits<{
  (e: 'update:category', value: string): void;
  (e: 'update:sort', field: SortField, direction: SortDirection): void;
}>();

const sortFields = [
  { label: 'Price', value: 'price' as SortField },
  { label: 'Rating', value: 'rating' as SortField },
  { label: 'Last updated', value: 'updatedAt' as SortField },
];

const sortDirections = [
  { label: 'Ascending', value: 'asc' as SortDirection },
  { label: 'Descending', value: 'desc' as SortDirection },
];

const selectedCategoryLabel = computed(() => (props.category === 'all' ? 'All categories' : props.category));
const selectedField = computed(() => sortFields.find((field) => field.value === props.sortBy)?.label ?? 'Price');
const selectedDirection = computed(
  () => sortDirections.find((option) => option.value === props.sortDir)?.label ?? 'Descending',
);

const changeCategory = (value: string) => {
  emit('update:category', value);
};

const changeSortField = (value: SortField) => {
  emit('update:sort', value, props.sortDir);
};

const changeSortDirection = (value: SortDirection) => {
  emit('update:sort', props.sortBy, value);
};
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <div class="w-48">
      <span class="mb-1 block text-xs font-semibold uppercase text-slate-500">Category</span>
      <Listbox :model-value="category" @update:model-value="changeCategory">
        <div class="relative">
          <ListboxButton class="flex w-full items-center justify-between gap-2 rounded border border-slate-300 px-3 py-2 text-sm">
            <span>{{ selectedCategoryLabel }}</span>
            <ChevronUpDownIcon class="h-4 w-4 text-slate-400" aria-hidden="true" />
          </ListboxButton>
          <ListboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border border-slate-200 bg-white py-1 shadow-lg">
            <ListboxOption
              v-for="option in categories"
              :key="option"
              :value="option"
              class="flex cursor-pointer items-center justify-between px-3 py-1 text-sm hover:bg-slate-100"
            >
              <span>{{ option === 'all' ? 'All categories' : option }}</span>
              <CheckIcon v-if="option === category" class="h-4 w-4 text-brand" />
            </ListboxOption>
          </ListboxOptions>
        </div>
      </Listbox>
    </div>
    <div class="flex items-end gap-2">
      <div class="w-44">
        <span class="mb-1 block text-xs font-semibold uppercase text-slate-500">Sort by</span>
        <Listbox :model-value="sortBy" @update:model-value="changeSortField">
          <div class="relative">
            <ListboxButton class="flex w-full items-center justify-between gap-2 rounded border border-slate-300 px-3 py-2 text-sm">
              <span>{{ selectedField }}</span>
              <ChevronUpDownIcon class="h-4 w-4 text-slate-400" aria-hidden="true" />
            </ListboxButton>
            <ListboxOptions class="absolute z-10 mt-1 w-full rounded border border-slate-200 bg-white py-1 shadow-lg">
              <ListboxOption
                v-for="option in sortFields"
                :key="option.value"
                :value="option.value"
                class="flex cursor-pointer items-center justify-between px-3 py-1 text-sm hover:bg-slate-100"
              >
                <span>{{ option.label }}</span>
                <CheckIcon v-if="option.value === sortBy" class="h-4 w-4 text-brand" />
              </ListboxOption>
            </ListboxOptions>
          </div>
        </Listbox>
      </div>
      <div class="w-40">
        <span class="mb-1 block text-xs font-semibold uppercase text-slate-500">Direction</span>
        <Listbox :model-value="sortDir" @update:model-value="changeSortDirection">
          <div class="relative">
            <ListboxButton class="flex w-full items-center justify-between gap-2 rounded border border-slate-300 px-3 py-2 text-sm">
              <span>{{ selectedDirection }}</span>
              <ChevronUpDownIcon class="h-4 w-4 text-slate-400" aria-hidden="true" />
            </ListboxButton>
            <ListboxOptions class="absolute z-10 mt-1 w-full rounded border border-slate-200 bg-white py-1 shadow-lg">
              <ListboxOption
                v-for="option in sortDirections"
                :key="option.value"
                :value="option.value"
                class="flex cursor-pointer items-center justify-between px-3 py-1 text-sm hover:bg-slate-100"
              >
                <span>{{ option.label }}</span>
                <CheckIcon v-if="option.value === sortDir" class="h-4 w-4 text-brand" />
              </ListboxOption>
            </ListboxOptions>
          </div>
        </Listbox>
      </div>
    </div>
  </div>
</template>
