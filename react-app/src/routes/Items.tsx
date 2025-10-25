import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import ConfirmDialog from '../components/ConfirmDialog';
import Filters from '../components/Filters';
import Paginator from '../components/Paginator';
import SearchBox from '../components/SearchBox';
import Table, { TableColumn } from '../components/Table';
import type { Item, SortDirection, SortField } from '../api/items';
import { PAGE_SIZE_OPTIONS, useItemsStore } from '../store';
import { METRICS } from '../utils/perf';

const ItemsRoute = () => {
  const navigate = useNavigate();
  const items = useItemsStore((state) => state.items);
  const total = useItemsStore((state) => state.total);
  const loading = useItemsStore((state) => state.loading);
  const error = useItemsStore((state) => state.error);
  const filters = useItemsStore((state) => state.filters);
  const categories = useItemsStore((state) => state.categories);
  const pagination = useItemsStore((state) => state.pagination);
  const fetchItems = useItemsStore((state) => state.fetchItems);
  const applySearch = useItemsStore((state) => state.applySearch);
  const applyCategory = useItemsStore((state) => state.applyCategory);
  const applySort = useItemsStore((state) => state.applySort);
  const setPage = useItemsStore((state) => state.setPage);
  const setPageSize = useItemsStore((state) => state.setPageSize);
  const loadCategories = useItemsStore((state) => state.loadCategories);
  const deleteItem = useItemsStore((state) => state.deleteItem);
  const runStressTest = useItemsStore((state) => state.runStressTest);

  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [itemToRemove, setItemToRemove] = useState<Item | null>(null);
  const initialFetchRef = useRef(false);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (!initialFetchRef.current) {
      initialFetchRef.current = true;
      fetchItems({ startMark: `${METRICS.ITEMS_TABLE_FIRST_PAINT}:start` });
    }
  }, [fetchItems]);

  useEffect(() => {
    setSearchTerm(filters.search);
  }, [filters.search]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (searchTerm !== filters.search) {
        applySearch(searchTerm);
      }
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchTerm, filters.search, applySearch]);

  const handleCategoryChange = (value: string) => {
    applyCategory(value);
  };

  const handleSortChange = (field: SortField, direction: SortDirection) => {
    applySort(field, direction);
  };

  const columns: TableColumn<Item>[] = useMemo(
    () => [
      { key: 'id', header: 'ID', className: 'w-16' },
      { key: 'name', header: 'Name' },
      { key: 'category', header: 'Category', className: 'w-32' },
      {
        key: 'price',
        header: 'Price',
        className: 'w-24 text-right',
        render: (row) => <span>${row.price.toFixed(2)}</span>,
      },
      {
        key: 'rating',
        header: 'Rating',
        className: 'w-20 text-right',
        render: (row) => <span>{row.rating.toFixed(1)}</span>,
      },
      {
        key: 'updatedAt',
        header: 'Updated',
        className: 'w-40',
        render: (row) => new Date(row.updatedAt).toLocaleString(),
      },
      {
        key: 'actions',
        header: 'Actions',
        className: 'w-40',
        render: (row) => (
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              className="rounded border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-100"
              onClick={() => navigate(`/items/${row.id}`)}
            >
              View
            </button>
            <button
              type="button"
              className="rounded border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-100"
              onClick={() => navigate(`/items/${row.id}/edit`)}
            >
              Edit
            </button>
            <button
              type="button"
              className="rounded border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50"
              onClick={() => setItemToRemove(row)}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [navigate],
  );

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Items</h2>
          <p className="text-sm text-slate-600">
            Browse the catalog with pagination, search, filters, and stress testing utilities.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/items/new"
            className="rounded bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-dark"
          >
            New item
          </Link>
          <button
            type="button"
            onClick={runStressTest}
            className="rounded border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/10"
          >
            Stress test
          </button>
        </div>
      </header>
      <div className="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <SearchBox value={searchTerm} onChange={setSearchTerm} />
        <Filters
          category={filters.category}
          categories={categories}
          sortBy={filters.sortBy}
          sortDir={filters.sortDir}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
        />
      </div>
      {error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : null}
      {loading ? <p className="text-sm text-slate-500">Loading items…</p> : null}
      <Table data={items} columns={columns} emptyMessage="No items matched your criteria." />
      <Paginator
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={total}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
      <ConfirmDialog
        open={Boolean(itemToRemove)}
        title="Delete item"
        description={`Are you sure you want to delete ${itemToRemove?.name ?? 'this item'}?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setItemToRemove(null)}
        onConfirm={async () => {
          if (itemToRemove) {
            await deleteItem(itemToRemove.id);
            setItemToRemove(null);
          }
        }}
      />
    </section>
  );
};

export default ItemsRoute;
