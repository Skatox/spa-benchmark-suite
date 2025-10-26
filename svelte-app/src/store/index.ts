import { get, writable } from 'svelte/store';

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
  metric?: (typeof METRICS)[keyof typeof METRICS];
  startMark?: string;
  detail?: Record<string, unknown>;
}

interface ItemsState {
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
}

const initialState: ItemsState = {
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
};

function createItemsStore() {
  const state = writable<ItemsState>(initialState);

  async function fetchItems(options?: FetchOptions): Promise<void> {
    const snapshot = get(state);
    const { pagination, filters, firstPaintMeasured } = snapshot;
    const { page, pageSize } = pagination;
    const { search, category, sortBy, sortDir } = filters;
    const metric = options?.metric;
    const startMark = options?.startMark ?? (metric ? `${metric}:start` : undefined);

    if (startMark) {
      mark(startMark);
    }

    state.update((current) => ({ ...current, loading: true, error: null }));

    try {
      const response = await list({
        page,
        pageSize,
        search: search.trim() || undefined,
        category: category === 'all' ? undefined : category,
        sortBy,
        sortDir,
      });

      state.update((current) => ({
        ...current,
        items: response.items,
        total: response.total,
        loading: false,
        hasLoaded: true,
        error: null,
      }));

      if (!firstPaintMeasured && startMark === `${METRICS.ITEMS_TABLE_FIRST_PAINT}:start`) {
        measure(METRICS.ITEMS_TABLE_FIRST_PAINT, startMark);
        state.update((current) => ({ ...current, firstPaintMeasured: true }));
      }

      if (metric && startMark) {
        measure(metric, startMark, `${metric}:end`, options?.detail);
      }
    } catch (error) {
      state.update((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred.',
      }));
    }
  }

  async function refreshSummary(): Promise<void> {
    try {
      const snapshot = await summary();
      state.update((current) => ({ ...current, summary: snapshot }));
    } catch (error) {
      console.error('Failed to load summary', error);
    }
  }

  async function setPage(page: number): Promise<void> {
    state.update((current) => ({
      ...current,
      pagination: { ...current.pagination, page },
    }));
    await fetchItems({ metric: METRICS.PAGE_CHANGED });
  }

  async function setPageSize(size: number): Promise<void> {
    state.update((current) => ({
      ...current,
      pagination: { page: 1, pageSize: size },
    }));
    await fetchItems({ metric: METRICS.PAGE_CHANGED });
  }

  async function applySearch(search: string): Promise<void> {
    state.update((current) => ({
      ...current,
      filters: { ...current.filters, search },
      pagination: { ...current.pagination, page: 1 },
    }));
    await fetchItems({ metric: METRICS.FILTER_APPLIED, detail: { search } });
  }

  async function applyCategory(category: string): Promise<void> {
    state.update((current) => ({
      ...current,
      filters: { ...current.filters, category },
      pagination: { ...current.pagination, page: 1 },
    }));
    await fetchItems({ metric: METRICS.FILTER_APPLIED, detail: { category } });
  }

  async function applySort(sortBy: SortField, sortDir: SortDirection): Promise<void> {
    state.update((current) => ({
      ...current,
      filters: { ...current.filters, sortBy, sortDir },
      pagination: { ...current.pagination, page: 1 },
    }));
    await fetchItems({ metric: METRICS.SORT_APPLIED, detail: { sortBy, sortDir } });
  }

  function loadCategories(): void {
    const categories = fetchCategories();
    state.update((current) => ({ ...current, categories: ['all', ...categories] }));
  }

  async function createItem(
    payload: Omit<Item, 'id' | 'sku' | 'status' | 'createdAt' | 'updatedAt'>,
  ): Promise<Item> {
    const result = await createItemRequest(payload);
    await refreshSummary();
    await fetchItems();
    return result;
  }

  async function updateItem(
    id: number,
    payload: Omit<Item, 'id' | 'sku' | 'status' | 'createdAt' | 'updatedAt'>,
  ): Promise<Item> {
    const result = await updateItemRequest(id, payload);
    await refreshSummary();
    await fetchItems();
    return result;
  }

  async function deleteItem(id: number): Promise<void> {
    await removeItem(id);
    await refreshSummary();
    await fetchItems();
  }

  async function runStressTest(): Promise<void> {
    const seedStart = getNextId();
    const generated = seedLargeDataset(500, seedStart);
    appendTemporaryItems(generated);
    await fetchItems();

    const iterations = 20;
    for (let index = 0; index < iterations; index += 1) {
      const start = `stress_update_${index}:start`;
      mark(start);
      state.update((current) => {
        const sorted = [...current.items].sort((a, b) =>
          index % 2 === 0 ? a.id - b.id : b.id - a.id,
        );
        return {
          ...current,
          stressCounter: current.stressCounter + 1,
          items: sorted,
        };
      });
      measure(`stress_update_${index}`, start, `stress_update_${index}:end`, { iteration: index + 1 });
    }

    clearTemporaryItems();
    state.update((current) => ({ ...current, stressCounter: 0 }));
    await fetchItems();
  }

  return {
    subscribe: state.subscribe,
    fetchItems,
    refreshSummary,
    setPage,
    setPageSize,
    applySearch,
    applyCategory,
    applySort,
    loadCategories,
    createItem,
    updateItem,
    deleteItem,
    runStressTest,
  };
}

export const itemsStore = createItemsStore();
export { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS };
