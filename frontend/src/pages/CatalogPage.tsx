import React, { useState, useMemo } from 'react';
import { Layout } from '../components/layout/Layout';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { MOCK_TITLES } from '../mockData';
import { useToast } from '../components/ui/Toast';
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  BookOpenIcon,
  CheckBadgeIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

// ---------------------------------------------------------------------------
// Mock sales data per title (for demo)
// ---------------------------------------------------------------------------

const MOCK_SALES: Record<string, { units: number; revenue: number }> = {
  [MOCK_TITLES[0]?.id ?? '']: { units: 8420, revenue: 112680 },
  [MOCK_TITLES[1]?.id ?? '']: { units: 0, revenue: 0 },
  [MOCK_TITLES[2]?.id ?? '']: { units: 0, revenue: 0 },
  [MOCK_TITLES[3]?.id ?? '']: { units: 4427, revenue: 55752 },
  [MOCK_TITLES[4]?.id ?? '']: { units: 0, revenue: 0 },
};

const IMPRINTS = ['All Imprints', 'Horizon Press', 'Digital Ink'];

type SortKey =
  | 'title'
  | 'primary_author'
  | 'status'
  | 'format_count'
  | 'channel_count'
  | 'publication_date'
  | 'units'
  | 'revenue';

// ---------------------------------------------------------------------------
// CatalogPage
// ---------------------------------------------------------------------------

export const CatalogPage = () => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('title');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [imprintFilter, setImprintFilter] = useState('All Imprints');

  // Handle sort
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Filter & sort
  const filtered = useMemo(() => {
    let list = [...MOCK_TITLES];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.primary_author.toLowerCase().includes(q) ||
          t.genre.toLowerCase().includes(q),
      );
    }

    // Sort
    list.sort((a, b) => {
      let valA: string | number;
      let valB: string | number;

      switch (sortKey) {
        case 'title':
          valA = a.title.toLowerCase();
          valB = b.title.toLowerCase();
          break;
        case 'primary_author':
          valA = a.primary_author.toLowerCase();
          valB = b.primary_author.toLowerCase();
          break;
        case 'status':
          valA = a.status;
          valB = b.status;
          break;
        case 'format_count':
          valA = a.format_count;
          valB = b.format_count;
          break;
        case 'channel_count':
          valA = a.channel_count;
          valB = b.channel_count;
          break;
        case 'publication_date':
          valA = a.publication_date ?? '';
          valB = b.publication_date ?? '';
          break;
        case 'units':
          valA = MOCK_SALES[a.id]?.units ?? 0;
          valB = MOCK_SALES[b.id]?.units ?? 0;
          break;
        case 'revenue':
          valA = MOCK_SALES[a.id]?.revenue ?? 0;
          valB = MOCK_SALES[b.id]?.revenue ?? 0;
          break;
        default:
          valA = a.title;
          valB = b.title;
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [search, sortKey, sortDir]);

  // KPI calculations
  const totalTitles = MOCK_TITLES.length;
  const liveTitles = MOCK_TITLES.filter((t) => t.status === 'live').length;
  const totalRevenue = Object.values(MOCK_SALES).reduce((a, s) => a + s.revenue, 0);
  const totalUnits = Object.values(MOCK_SALES).reduce((a, s) => a + s.units, 0);

  // CSV export
  const handleExport = () => {
    const header = 'Title,Author,Status,Formats,Channels,Pub Date,Units,Revenue';
    const rows = filtered.map((t) => {
      const sales = MOCK_SALES[t.id] ?? { units: 0, revenue: 0 };
      return `"${t.title}","${t.primary_author}",${t.status},${t.format_count},${t.channel_count},${t.publication_date ?? ''},${sales.units},${sales.revenue}`;
    });
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guttenberg-catalog.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Catalog exported as CSV');
  };

  // Column headers
  const columns: { key: SortKey; label: string }[] = [
    { key: 'title', label: 'Title' },
    { key: 'primary_author', label: 'Author' },
    { key: 'status', label: 'Status' },
    { key: 'format_count', label: 'Formats' },
    { key: 'channel_count', label: 'Channels' },
    { key: 'publication_date', label: 'Pub Date' },
    { key: 'units', label: 'Sales' },
    { key: 'revenue', label: 'Revenue' },
  ];

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? (
      <ChevronUpIcon className="w-3.5 h-3.5 inline-block ml-0.5" />
    ) : (
      <ChevronDownIcon className="w-3.5 h-3.5 inline-block ml-0.5" />
    );
  };

  return (
    <Layout title="Publisher Catalog" breadcrumbs={[{ label: 'Publisher Catalog' }]}>
      {/* ------------------------------------------------------------------ */}
      {/* KPI Summary Cards                                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Titles"
          value={totalTitles}
          icon={<BookOpenIcon className="w-6 h-6" />}
          color="blue"
          trend={{ value: 12.5, label: 'vs last quarter' }}
        />
        <StatCard
          title="Live Titles"
          value={liveTitles}
          icon={<CheckBadgeIcon className="w-6 h-6" />}
          color="green"
          trend={{ value: 8.3, label: 'vs last quarter' }}
        />
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={<BanknotesIcon className="w-6 h-6" />}
          color="purple"
          trend={{ value: 22.1, label: 'vs last quarter' }}
        />
        <StatCard
          title="Total Units"
          value={totalUnits.toLocaleString()}
          icon={<ShoppingCartIcon className="w-6 h-6" />}
          color="amber"
          trend={{ value: 15.7, label: 'vs last quarter' }}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Search / Filter Bar                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="w-[18px] h-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-gray-400" />
            <select
              value={imprintFilter}
              onChange={(e) => setImprintFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {IMPRINTS.map((imp) => (
                <option key={imp} value={imp}>
                  {imp}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Data Table                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-800 select-none transition-colors"
                  >
                    <span className="inline-flex items-center gap-0.5">
                      {col.label}
                      <SortIcon col={col.key} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((t) => {
                const sales = MOCK_SALES[t.id] ?? { units: 0, revenue: 0 };
                return (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900 max-w-[240px] truncate">
                      {t.title}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{t.primary_author}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-5 py-4 text-gray-600 tabular-nums">
                      {t.format_count}
                    </td>
                    <td className="px-5 py-4 text-gray-600 tabular-nums">
                      {t.channel_count}
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {t.publication_date ?? '--'}
                    </td>
                    <td className="px-5 py-4 text-gray-600 tabular-nums">
                      {sales.units > 0 ? sales.units.toLocaleString() : '--'}
                    </td>
                    <td className="px-5 py-4 font-medium text-emerald-600 tabular-nums">
                      {sales.revenue > 0
                        ? `$${sales.revenue.toLocaleString()}`
                        : '--'}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-sm text-gray-400"
                  >
                    No titles match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};
