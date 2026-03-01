import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { StatusBadge } from '../components/ui/StatusBadge';
import { MOCK_TITLES } from '../mockData';
import { useToast } from '../components/ui/Toast';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export const CatalogPage = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string>('title');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const toast = useToast();

  const titles = MOCK_TITLES.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.authorName.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(prev => prev.length === titles.length ? [] : titles.map(t => t.id));

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const stats = [
    { label: 'Total Titles', value: MOCK_TITLES.length },
    { label: 'Published', value: MOCK_TITLES.filter(t => t.status === 'published').length },
    { label: 'Active Channels', value: MOCK_TITLES.reduce((a, t) => a + t.channels.filter(c => c.status === 'live').length, 0) },
    { label: 'Imprints', value: 2 },
  ];

  return (
    <Layout title="Catalog" breadcrumbs={[{ label: 'Catalog' }]}>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search catalog…" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          {selected.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-600">{selected.length} selected</span>
              <button onClick={() => { toast.info('Updating pricing for selected titles…'); }} className="px-3 py-2 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700">Update Pricing</button>
              <button onClick={() => { toast.info('Exporting CSV…'); setSelected([]); }} className="px-3 py-2 text-xs border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Export CSV</button>
              <button onClick={() => { toast.info('Updating channel distribution…'); }} className="px-3 py-2 text-xs border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Add/Remove Channels</button>
            </div>
          )}
        </div>
      </div>

      {/* Data grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left w-8">
                <input type="checkbox" checked={selected.length === titles.length && titles.length > 0} onChange={toggleAll} className="rounded" />
              </th>
              {[
                { key: 'title', label: 'Title' },
                { key: 'authorName', label: 'Author' },
                { key: 'status', label: 'Status' },
                { key: 'formats', label: 'Formats' },
                { key: 'channels', label: 'Channels' },
                { key: 'publicationDate', label: 'Pub Date' },
                { key: 'units', label: 'Units' },
                { key: 'revenue', label: 'Revenue' },
              ].map(col => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-800" onClick={() => handleSort(col.key)}>
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {titles.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggleSelect(t.id)} className="rounded" />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{t.title}</td>
                <td className="px-4 py-3 text-gray-600">{t.authorName}</td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-4 py-3 text-gray-500">{t.formats.map(f => f.type).join(', ')}</td>
                <td className="px-4 py-3 text-gray-600">{t.channels.filter(c => c.status === 'live').length} live</td>
                <td className="px-4 py-3 text-gray-500">{t.publicationDate || '—'}</td>
                <td className="px-4 py-3 text-gray-600">—</td>
                <td className="px-4 py-3 text-green-600 font-medium">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Imprint management */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Imprint Management</h3>
          <button onClick={() => toast.info('Imprint creation coming soon!')} className="text-sm text-primary-600 hover:text-primary-700 font-medium">+ New Imprint</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: 'Horizon Press', titles: 3, status: 'Active' },
            { name: 'Digital Ink', titles: 2, status: 'Active' },
          ].map(imprint => (
            <div key={imprint.name} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{imprint.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{imprint.titles} titles</p>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">{imprint.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};
