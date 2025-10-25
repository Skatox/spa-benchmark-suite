import { memo } from 'react';

interface PaginatorProps {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const range = (from: number, to: number) => {
  const values: number[] = [];
  for (let value = from; value <= to; value += 1) {
    values.push(value);
  }
  return values;
};

const PaginatorComponent = ({
  page,
  pageSize,
  total,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: PaginatorProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pages = range(1, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span>Rows per page</span>
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="rounded border border-slate-300 px-3 py-1 text-sm"
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded border border-slate-300 px-2 py-1 text-sm disabled:opacity-40"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          {pages.slice(0, 5).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={`rounded px-3 py-1 text-sm ${
                pageNumber === page ? 'bg-brand text-white' : 'border border-slate-300 text-slate-600'
              }`}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            className="rounded border border-slate-300 px-2 py-1 text-sm disabled:opacity-40"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

const Paginator = memo(PaginatorComponent);

export default Paginator;
