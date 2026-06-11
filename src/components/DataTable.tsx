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
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-50 border-b border-gray-100" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b border-gray-50 bg-white" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <div className="w-full">{emptyState}</div>;
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((item, idx) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`
                  transition-all duration-150 group
                  ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                  ${onRowClick ? 'cursor-pointer hover:bg-indigo-50/40' : 'hover:bg-gray-50/50'}
                `}
              >
                {columns.map((column, index) => (
                  <td
                    key={index}
                    className={`px-6 py-4 text-sm text-gray-600 font-medium group-hover:text-gray-900 ${column.className || ''}`}
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
