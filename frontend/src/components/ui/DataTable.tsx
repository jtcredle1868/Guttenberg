import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import { ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  emptyMessage?: string;
  loading?: boolean;
}

export function DataTable<T extends Record<string, unknown>>({ columns, data, keyField, emptyMessage, loading }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av === bv) return 0;
      const cmp = av! < bv! ? -1 : 1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th key={String(col.key)} className={clsx('px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide', col.className)}>
                {col.sortable ? (
                  <button className="flex items-center gap-1 hover:text-gray-900" onClick={() => handleSort(String(col.key))}>
                    {col.header}
                    {sortKey === String(col.key)
                      ? sortDir === 'asc' ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />
                      : <ChevronUpDownIcon className="w-3.5 h-3.5" />}
                  </button>
                ) : col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 bg-white">
          {sorted.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-400">{emptyMessage || 'No data'}</td></tr>
          ) : sorted.map((row) => (
            <tr key={String(row[keyField])} className="hover:bg-gray-50 transition-colors">
              {columns.map(col => (
                <td key={String(col.key)} className={clsx('px-4 py-3 text-sm text-gray-700', col.className)}>
                  {col.render ? col.render(row) : String(row[String(col.key)] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
