import itemsSeed from '../../../data/items.json';
import { withLatency } from './client';

export type SortField = 'price' | 'rating' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

export interface Item {
  id: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  status: 'active' | 'out_of_stock';
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListParams {
  page: number;
  pageSize: number;
  search?: string;
  category?: string;
  sortBy?: SortField;
  sortDir?: SortDirection;
}

export interface ListResponse {
  items: Item[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ItemPayload {
  name: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  description: string;
}

interface Summary {
  total: number;
  averagePrice: number;
  averageRating: number;
  outOfStock: number;
}

let items: Item[] = (itemsSeed as Item[]).map((item) => ({ ...item }));
let temporaryItems: Item[] = [];
let nextId = Math.max(...items.map((item) => item.id)) + 1;

function getCollection(): Item[] {
  return [...items, ...temporaryItems];
}

function applyFilters(collection: Item[], params: ListParams): { items: Item[]; total: number } {
  const { search, category, sortBy, sortDir } = params;
  let filtered = [...collection];

  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query),
    );
  }

  if (category) {
    filtered = filtered.filter((item) => item.category === category);
  }

  if (sortBy) {
    filtered.sort((a, b) => {
      const direction = sortDir === 'desc' ? -1 : 1;
      if (sortBy === 'price' || sortBy === 'rating') {
        return (a[sortBy] - b[sortBy]) * direction;
      }
      return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * direction;
    });
  }

  const total = filtered.length;
  const page = Math.max(params.page, 1);
  const pageSize = Math.max(params.pageSize, 1);
  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  return { items: paginated, total };
}

export async function list(params: ListParams): Promise<ListResponse> {
  return withLatency(() => {
    const collection = getCollection();
    const { items: slice, total } = applyFilters(collection, params);
    return {
      items: slice,
      total,
      page: params.page,
      pageSize: params.pageSize,
    };
  });
}

export async function get(id: number): Promise<Item> {
  return withLatency(() => {
    const record = getCollection().find((item) => item.id === id);
    if (!record) {
      throw new Error(`Item ${id} was not found.`);
    }
    return { ...record };
  });
}

export async function create(payload: ItemPayload): Promise<Item> {
  return withLatency(() => {
    const timestamp = new Date().toISOString();
    const newItem: Item = {
      id: nextId,
      sku: `SKU${nextId.toString().padStart(5, '0')}`,
      status: payload.stock > 0 ? 'active' : 'out_of_stock',
      createdAt: timestamp,
      updatedAt: timestamp,
      ...payload,
    };
    nextId += 1;
    items = [...items, newItem];
    return { ...newItem };
  });
}

export async function update(id: number, payload: ItemPayload): Promise<Item> {
  return withLatency(() => {
    let updated: Item | null = null;
    items = items.map((item) => {
      if (item.id === id) {
        updated = {
          ...item,
          ...payload,
          status: payload.stock > 0 ? 'active' : 'out_of_stock',
          updatedAt: new Date().toISOString(),
        };
        return updated;
      }
      return item;
    });

    if (!updated) {
      temporaryItems = temporaryItems.map((item) => {
        if (item.id === id) {
          updated = {
            ...item,
            ...payload,
            status: payload.stock > 0 ? 'active' : 'out_of_stock',
            updatedAt: new Date().toISOString(),
          };
          return updated;
        }
        return item;
      });
    }

    if (!updated) {
      throw new Error(`Item ${id} was not found.`);
    }

    return { ...updated };
  });
}

export async function remove(id: number): Promise<void> {
  return withLatency(() => {
    const before = items.length + temporaryItems.length;
    items = items.filter((item) => item.id !== id);
    temporaryItems = temporaryItems.filter((item) => item.id !== id);
    if (items.length + temporaryItems.length === before) {
      throw new Error(`Item ${id} was not found.`);
    }
  });
}

export function getCategories(): string[] {
  return Array.from(new Set(getCollection().map((item) => item.category))).sort();
}

export function appendTemporaryItems(records: Item[]): void {
  temporaryItems = [...temporaryItems, ...records];
}

export function clearTemporaryItems(): void {
  temporaryItems = [];
}

export function getNextId(): number {
  return nextId;
}

export async function summary(): Promise<Summary> {
  return withLatency(() => {
    const collection = getCollection();
    const total = collection.length;
    const totalPrice = collection.reduce((sum, item) => sum + item.price, 0);
    const totalRating = collection.reduce((sum, item) => sum + item.rating, 0);
    const outOfStock = collection.filter((item) => item.status === 'out_of_stock').length;
    return {
      total,
      averagePrice: total === 0 ? 0 : Number((totalPrice / total).toFixed(2)),
      averageRating: total === 0 ? 0 : Number((totalRating / total).toFixed(2)),
      outOfStock,
    };
  }, { failRate: 0 });
}
