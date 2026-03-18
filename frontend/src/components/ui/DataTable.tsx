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

export function DataTable<T extends Record<string, unknown>>({
  columns, data, keyField, emptyMessage, loading,
}: DataTableProps<T>) {
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
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 rounded-lg skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-xl"
      style={{ border: '1px solid rgba(61,96,128,0.20)' }}
    >
      <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr
            style={{
              background: 'linear-gradient(180deg, #0f2040 0%, #0a1628 100%)',
              borderBottom: '1px solid rgba(61,96,128,0.22)',
            }}
          >
            {columns.map(col => (
              <th
                key={String(col.key)}
                className={clsx('px-4 py-3 text-left', col.className)}
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'rgba(90,127,160,0.65)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {col.sortable ? (
                  <button
                    className="flex items-center gap-1 transition-colors hover:text-white"
                    style={{ color: 'rgba(90,127,160,0.65)' }}
                    onClick={() => handleSort(String(col.key))}
                    onMouseEnter={e => (e.currentTarget.style.color = '#c5d8e8')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(90,127,160,0.65)')}
                  >
                    {col.header}
                    {sortKey === String(col.key)
                      ? sortDir === 'asc'
                        ? <ChevronUpIcon className="w-3.5 h-3.5" />
                        : <ChevronDownIcon className="w-3.5 h-3.5" />
                      : <ChevronUpDownIcon className="w-3.5 h-3.5" style={{ opacity: 0.50 }} />}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm"
                style={{ color: 'rgba(90,127,160,0.55)', background: 'rgba(10,22,40,0.30)' }}
              >
                {emptyMessage || 'No data available'}
              </td>
            </tr>
          ) : (
            sorted.map((row) => (
              <tr
                key={String(row[keyField])}
                className="transition-colors duration-100"
                style={{ borderBottom: '1px solid rgba(61,96,128,0.12)', background: 'rgba(10,22,40,0.20)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(61,96,128,0.10)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(10,22,40,0.20)')}
              >
                {columns.map(col => (
                  <td
                    key={String(col.key)}
                    className={clsx('px-4 py-3 text-sm', col.className)}
                    style={{ color: '#c5d8e8', fontFamily: 'Inter, sans-serif' }}
                  >
                    {col.render ? col.render(row) : String(row[String(col.key)] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
