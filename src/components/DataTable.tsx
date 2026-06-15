import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
}

function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading,
  emptyState,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-app-card rounded-2xl shadow-sm border border-app-border overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-app-bg/50 border-b border-app-border" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b border-app-border bg-app-card" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <div className="w-full">{emptyState}</div>;
  }

  return (
    <div className="w-full bg-app-card rounded-2xl shadow-sm border border-app-border overflow-hidden transition-all duration-200 hover:shadow-md hover:border-brand-primary/30">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="bg-app-bg/80 backdrop-blur-sm border-b border-app-border sticky top-0 z-10">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 text-[11px] font-black text-app-text-secondary uppercase tracking-[0.2em] ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border/30">
            {data.map((item, idx) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`
                  transition-all duration-150 group
                  ${idx % 2 === 0 ? 'bg-app-card' : 'bg-app-bg/20'}
                  ${onRowClick ? 'cursor-pointer hover:bg-brand-primary/5' : 'hover:bg-brand-primary/5'}
                `}
              >
                {columns.map((column, index) => (
                  <td
                    key={index}
                    className={`px-6 py-4 text-sm text-app-text-secondary font-bold group-hover:text-app-text-primary ${column.className || ''}`}
                  >
                    {typeof column.accessor === 'function'
                      ? column.accessor(item)
                      : (item[column.accessor] as unknown as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
