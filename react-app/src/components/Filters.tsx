import { memo } from 'react';

import type { SortDirection, SortField } from '../api/items';

interface FiltersProps {
  category: string;
  categories: string[];
  sortBy: SortField;
  sortDir: SortDirection;
  onCategoryChange: (value: string) => void;
  onSortChange: (field: SortField, direction: SortDirection) => void;
}

const FiltersComponent = ({
  category,
  categories,
  sortBy,
  sortDir,
  onCategoryChange,
  onSortChange,
}: FiltersProps) => (
  <div className="flex flex-wrap items-center gap-4">
    <div>
      <label htmlFor="category" className="mb-1 block text-xs font-semibold uppercase text-slate-500">
        Category
      </label>
      <select
        id="category"
        value={category}
        onChange={(event) => onCategoryChange(event.target.value)}
        className="rounded border border-slate-300 px-3 py-2 text-sm"
      >
        {categories.map((option) => (
          <option key={option} value={option}>
            {option === 'all' ? 'All categories' : option}
          </option>
        ))}
      </select>
    </div>
    <div className="flex items-end gap-2">
      <div>
        <label htmlFor="sort-field" className="mb-1 block text-xs font-semibold uppercase text-slate-500">
          Sort by
        </label>
        <select
          id="sort-field"
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value as SortField, sortDir)}
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="price">Price</option>
          <option value="rating">Rating</option>
          <option value="updatedAt">Last updated</option>
        </select>
      </div>
      <div>
        <label htmlFor="sort-direction" className="mb-1 block text-xs font-semibold uppercase text-slate-500">
          Direction
        </label>
        <select
          id="sort-direction"
          value={sortDir}
          onChange={(event) => onSortChange(sortBy, event.target.value as SortDirection)}
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </div>
  </div>
);

const Filters = memo(FiltersComponent);

export default Filters;
