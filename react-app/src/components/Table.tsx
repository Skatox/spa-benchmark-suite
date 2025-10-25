import { memo, ReactNode } from 'react';

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  emptyMessage?: string;
}

function TableComponent<T extends { id: number }>({ data, columns, emptyMessage }: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
        {emptyMessage ?? 'No records to display.'}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                  column.className ?? ''
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
              {columns.map((column) => (
                <td key={String(column.key)} className={`px-4 py-3 text-sm text-slate-700 ${column.className ?? ''}`}>
                  {column.render ? column.render(row) : (row as Record<string, ReactNode>)[column.key as string]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const Table = memo(TableComponent) as typeof TableComponent;

export default Table;
