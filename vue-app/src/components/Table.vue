<script setup lang="ts">
import { computed, defineComponent, h, isVNode } from 'vue';
import type { PropType, VNodeChild } from 'vue';

interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => VNodeChild;
  className?: string;
}

const props = defineProps<{
  data: Array<Record<string, unknown> & { id: number }>;
  columns: TableColumn[];
  emptyMessage?: string;
}>();

const rows = computed(() => props.data);
const columns = computed(() => props.columns);

const CellRenderer = defineComponent({
  name: 'CellRenderer',
  props: {
    row: {
      type: Object as PropType<Record<string, unknown> & { id: number }>,
      required: true,
    },
    column: {
      type: Object as PropType<TableColumn>,
      required: true,
    },
  },
  setup(cellProps) {
    return () => {
      const value = cellProps.column.render
        ? cellProps.column.render(cellProps.row)
        : (cellProps.row as Record<string, unknown>)[cellProps.column.key as string];

      if (isVNode(value)) {
        return value;
      }
      if (Array.isArray(value)) {
        return value.map((entry, index) => (isVNode(entry) ? entry : h('span', { key: index }, String(entry ?? ''))));
      }
      if (typeof value === 'string' || typeof value === 'number') {
        return value;
      }
      if (value === null || value === undefined) {
        return '';
      }
      return String(value);
    };
  },
});
</script>

<template>
  <div v-if="!rows.length" class="rounded border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
    {{ emptyMessage ?? 'No records to display.' }}
  </div>
  <div v-else class="overflow-x-auto rounded-lg border border-slate-200 bg-white">
    <table class="min-w-full divide-y divide-slate-200">
      <thead class="bg-slate-50">
        <tr>
          <th
            v-for="column in columns"
            :key="String(column.key)"
            class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            :class="column.className"
          >
            {{ column.header }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 bg-white">
        <tr v-for="row in rows" :key="row.id" class="hover:bg-slate-50">
          <td
            v-for="column in columns"
            :key="String(column.key)"
            class="px-4 py-3 text-sm text-slate-700"
            :class="column.className"
          >
            <CellRenderer :row="row" :column="column" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
