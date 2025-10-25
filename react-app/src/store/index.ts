import { create } from 'zustand';

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

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

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
  metric?: typeof METRICS[keyof typeof METRICS];
  startMark?: string;
  detail?: Record<string, unknown>;
}

interface ItemsStore {
  items: Item[];
  total: number;
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  filters: FilterState;
  categories: string[];
  hasLoaded: boolean;
  firstPaintMeasured: boolean;
  stressCounter: number;
  summary: SummaryState;
  fetchItems: (options?: FetchOptions) => Promise<void>;
  refreshSummary: () => Promise<void>;
  setPage: (page: number) => Promise<void>;
  setPageSize: (size: number) => Promise<void>;
  applySearch: (search: string) => Promise<void>;
  applyCategory: (category: string) => Promise<void>;
  applySort: (sortBy: SortField, sortDir: SortDirection) => Promise<void>;
  loadCategories: () => void;
  createItem: (payload: Omit<Item, 'id' | 'sku' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<Item>;
  updateItem: (
    id: number,
    payload: Omit<Item, 'id' | 'sku' | 'status' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Item>;
  deleteItem: (id: number) => Promise<void>;
  runStressTest: () => Promise<void>;
}

export const useItemsStore = create<ItemsStore>((set, get) => ({
  items: [],
  total: 0,
  loading: false,
  error: null,
  pagination: { page: 1, pageSize: DEFAULT_PAGE_SIZE },
  filters: { search: '', category: 'all', sortBy: 'updatedAt', sortDir: 'desc' },
  categories: ['all'],
  hasLoaded: false,
  firstPaintMeasured: false,
  stressCounter: 0,
  summary: { total: 0, averagePrice: 0, averageRating: 0, outOfStock: 0 },
  async fetchItems(options?: FetchOptions) {
    const { pagination, filters, firstPaintMeasured } = get();
    const { page, pageSize } = pagination;
    const { search, category, sortBy, sortDir } = filters;
    const metric = options?.metric;
    const startMark = options?.startMark ?? (metric ? `${metric}:start` : undefined);

    if (startMark) {
      mark(startMark);
    }

    set({ loading: true, error: null });

    try {
      const response = await list({
        page,
        pageSize,
        search: search.trim() || undefined,
        category: category === 'all' ? undefined : category,
        sortBy,
        sortDir,
      });
      set({
        items: response.items,
        total: response.total,
        loading: false,
        hasLoaded: true,
        error: null,
      });

      if (!firstPaintMeasured && startMark === `${METRICS.ITEMS_TABLE_FIRST_PAINT}:start`) {
        measure(METRICS.ITEMS_TABLE_FIRST_PAINT, startMark);
        set({ firstPaintMeasured: true });
      }

      if (metric) {
        measure(metric, startMark!, `${metric}:end`, options?.detail);
      }
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred.',
      });
    }
  },
  async refreshSummary() {
    try {
      const snapshot = await summary();
      set({ summary: snapshot });
    } catch (error) {
      console.error('Failed to load summary', error);
    }
  },
  async setPage(page: number) {
    set((state) => ({ pagination: { ...state.pagination, page } }));
    await get().fetchItems({ metric: METRICS.PAGE_CHANGED });
  },
  async setPageSize(size: number) {
    set(() => ({ pagination: { page: 1, pageSize: size } }));
    await get().fetchItems({ metric: METRICS.PAGE_CHANGED });
  },
  async applySearch(search: string) {
    set((state) => ({
      filters: { ...state.filters, search },
      pagination: { ...state.pagination, page: 1 },
    }));
    await get().fetchItems({ metric: METRICS.FILTER_APPLIED, detail: { search } });
  },
  async applyCategory(category: string) {
    set((state) => ({
      filters: { ...state.filters, category },
      pagination: { ...state.pagination, page: 1 },
    }));
    await get().fetchItems({ metric: METRICS.FILTER_APPLIED, detail: { category } });
  },
  async applySort(sortBy: SortField, sortDir: SortDirection) {
    set((state) => ({
      filters: { ...state.filters, sortBy, sortDir },
      pagination: { ...state.pagination, page: 1 },
    }));
    await get().fetchItems({ metric: METRICS.SORT_APPLIED, detail: { sortBy, sortDir } });
  },
  loadCategories() {
    const categories = fetchCategories();
    set({ categories: ['all', ...categories] });
  },
  async createItem(payload) {
    const result = await createItemRequest(payload);
    await get().refreshSummary();
    await get().fetchItems();
    return result;
  },
  async updateItem(id, payload) {
    const result = await updateItemRequest(id, payload);
    await get().refreshSummary();
    await get().fetchItems();
    return result;
  },
  async deleteItem(id: number) {
    await removeItem(id);
    await get().refreshSummary();
    await get().fetchItems();
  },
  async runStressTest() {
    const state = get();
    const seedStart = getNextId();
    const generated = seedLargeDataset(500, seedStart);
    appendTemporaryItems(generated);
    await get().fetchItems();

    const { items } = get();
    const iterations = 20;
    for (let index = 0; index < iterations; index += 1) {
      const start = `stress_update_${index}:start`;
      mark(start);
      set((current) => ({
        stressCounter: current.stressCounter + 1,
        items: [...items].sort((a, b) => (index % 2 === 0 ? a.id - b.id : b.id - a.id)),
      }));
      measure(`stress_update_${index}`, start, `stress_update_${index}:end`, { iteration: index + 1 });
    }

    clearTemporaryItems();
    set({ stressCounter: 0 });
    await get().fetchItems();
  },
}));

export { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS };
