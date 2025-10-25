import { defineStore } from 'pinia';

import type { Item, SortDirection, SortField } from '../api/items';
import {
  appendTemporaryItems,
  clearTemporaryItems,
  create as createItemRequest,
  getCategories as fetchCategories,
  getNextId,
  list,
  remove as removeItem,
  summary,
  update as updateItemRequest,
} from '../api/items';
import { METRICS, mark, measure } from '../utils/perf';
import { seedLargeDataset } from '../utils/seed';

export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

interface PaginationState {
  page: number;
  pageSize: number;
}

interface FilterState {
  search: string;
  category: string;
  sortBy: SortField;
  sortDir: SortDirection;
}

interface SummaryState {
  total: number;
  averagePrice: number;
  averageRating: number;
  outOfStock: number;
}

interface FetchOptions {
  metric?: (typeof METRICS)[keyof typeof METRICS];
  startMark?: string;
  detail?: Record<string, unknown>;
}

interface ItemFormPayload extends Omit<Item, 'id' | 'sku' | 'status' | 'createdAt' | 'updatedAt'> {}

export const useItemsStore = defineStore('items', {
  state: () => ({
    items: [] as Item[],
    total: 0,
    loading: false,
    error: null as string | null,
    pagination: { page: 1, pageSize: DEFAULT_PAGE_SIZE } as PaginationState,
    filters: { search: '', category: 'all', sortBy: 'updatedAt', sortDir: 'desc' } as FilterState,
    categories: ['all'] as string[],
    hasLoaded: false,
    firstPaintMeasured: false,
    stressCounter: 0,
    summary: { total: 0, averagePrice: 0, averageRating: 0, outOfStock: 0 } as SummaryState,
  }),
  actions: {
    async fetchItems(options?: FetchOptions) {
      const { page, pageSize } = this.pagination;
      const { search, category, sortBy, sortDir } = this.filters;
      const metric = options?.metric;
      const startMark = options?.startMark ?? (metric ? `${metric}:start` : undefined);

      if (startMark) {
        mark(startMark);
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await list({
          page,
          pageSize,
          search: search.trim() || undefined,
          category: category === 'all' ? undefined : category,
          sortBy,
          sortDir,
        });

        this.items = response.items;
        this.total = response.total;
        this.loading = false;
        this.hasLoaded = true;
        this.error = null;

        if (!this.firstPaintMeasured && startMark === `${METRICS.ITEMS_TABLE_FIRST_PAINT}:start`) {
          measure(METRICS.ITEMS_TABLE_FIRST_PAINT, startMark);
          this.firstPaintMeasured = true;
        }

        if (metric && startMark) {
          measure(metric, startMark, `${metric}:end`, options?.detail);
        }
      } catch (error) {
        this.loading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error occurred.';
      }
    },
    async refreshSummary() {
      try {
        const snapshot = await summary();
        this.summary = snapshot;
      } catch (error) {
        console.error('Failed to load summary', error);
      }
    },
    async setPage(page: number) {
      this.pagination = { ...this.pagination, page };
      await this.fetchItems({ metric: METRICS.PAGE_CHANGED });
    },
    async setPageSize(size: number) {
      this.pagination = { page: 1, pageSize: size };
      await this.fetchItems({ metric: METRICS.PAGE_CHANGED });
    },
    async applySearch(search: string) {
      this.filters = { ...this.filters, search };
      this.pagination = { ...this.pagination, page: 1 };
      await this.fetchItems({ metric: METRICS.FILTER_APPLIED, detail: { search } });
    },
    async applyCategory(category: string) {
      this.filters = { ...this.filters, category };
      this.pagination = { ...this.pagination, page: 1 };
      await this.fetchItems({ metric: METRICS.FILTER_APPLIED, detail: { category } });
    },
    async applySort(sortBy: SortField, sortDir: SortDirection) {
      this.filters = { ...this.filters, sortBy, sortDir };
      this.pagination = { ...this.pagination, page: 1 };
      await this.fetchItems({ metric: METRICS.SORT_APPLIED, detail: { sortBy, sortDir } });
    },
    loadCategories() {
      const categories = fetchCategories();
      this.categories = ['all', ...categories];
    },
    async createItem(payload: ItemFormPayload) {
      const result = await createItemRequest(payload);
      await this.refreshSummary();
      await this.fetchItems();
      return result;
    },
    async updateItem(id: number, payload: ItemFormPayload) {
      const result = await updateItemRequest(id, payload);
      await this.refreshSummary();
      await this.fetchItems();
      return result;
    },
    async deleteItem(id: number) {
      await removeItem(id);
      await this.refreshSummary();
      await this.fetchItems();
    },
    async runStressTest() {
      const seedStart = getNextId();
      const generated = seedLargeDataset(500, seedStart);
      appendTemporaryItems(generated);
      await this.fetchItems();

      const snapshot = [...this.items];
      const iterations = 20;
      for (let index = 0; index < iterations; index += 1) {
        const start = `stress_update_${index}:start`;
        mark(start);
        this.stressCounter += 1;
        const sorted = [...snapshot].sort((a, b) => (index % 2 === 0 ? a.id - b.id : b.id - a.id));
        this.items = sorted;
        measure(`stress_update_${index}`, start, `stress_update_${index}:end`, { iteration: index + 1 });
      }

      clearTemporaryItems();
      this.stressCounter = 0;
      await this.fetchItems();
    },
  },
});
