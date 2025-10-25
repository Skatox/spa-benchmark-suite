<script setup lang="ts">
import { computed } from 'vue';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';

const props = defineProps<{
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}>();

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));
const pages = computed(() => {
  const values: number[] = [];
  for (let value = 1; value <= totalPages.value; value += 1) {
    values.push(value);
  }
  return values;
});

const changePage = (page: number) => {
  props.onPageChange(page);
};

const changePageSize = (size: number) => {
  props.onPageSizeChange(size);
};
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div class="flex items-center gap-2 text-sm text-slate-600">
      <span>Rows per page</span>
      <Listbox :model-value="pageSize" @update:model-value="changePageSize">
        <div class="relative">
          <ListboxButton class="flex min-w-[72px] items-center justify-between gap-2 rounded border border-slate-300 px-3 py-1 text-sm">
            <span>{{ pageSize }}</span>
            <ChevronUpDownIcon class="h-4 w-4 text-slate-400" aria-hidden="true" />
          </ListboxButton>
          <ListboxOptions class="absolute z-10 mt-1 w-full rounded border border-slate-200 bg-white py-1 shadow-lg">
            <ListboxOption
              v-for="option in pageSizeOptions"
              :key="option"
              :value="option"
              class="flex cursor-pointer items-center justify-between px-3 py-1 text-sm hover:bg-slate-100"
            >
              <span>{{ option }}</span>
              <CheckIcon v-if="option === pageSize" class="h-4 w-4 text-brand" />
            </ListboxOption>
          </ListboxOptions>
        </div>
      </Listbox>
    </div>
    <div class="flex items-center gap-2 text-sm text-slate-600">
      <span>Page {{ page }} of {{ totalPages }}</span>
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="rounded border border-slate-300 px-2 py-1 text-sm disabled:opacity-40"
          :disabled="page === 1"
          @click="changePage(Math.max(1, page - 1))"
        >
          Prev
        </button>
        <button
          v-for="pageNumber in pages.slice(0, 5)"
          :key="pageNumber"
          type="button"
          class="rounded px-3 py-1 text-sm"
          :class="pageNumber === page ? 'bg-brand text-white' : 'border border-slate-300 text-slate-600'"
          @click="changePage(pageNumber)"
        >
          {{ pageNumber }}
        </button>
        <button
          type="button"
          class="rounded border border-slate-300 px-2 py-1 text-sm disabled:opacity-40"
          :disabled="page === totalPages"
          @click="changePage(Math.min(totalPages, page + 1))"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
