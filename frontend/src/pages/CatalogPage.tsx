import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { StatusBadge } from '../components/ui/StatusBadge';
import { MOCK_TITLES } from '../mockData';
import { useToast } from '../components/ui/Toast';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
  border: '1px solid rgba(61,96,128,0.22)',
  boxShadow: '0 1px 3px rgba(5,13,26,0.35)',
  borderRadius: '1rem',
};

export const CatalogPage = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string>('title');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [searchFocused, setSearchFocused] = useState(false);
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
      <div className="grid grid-cols-4 gap-4 mb-5">
        {stats.map(s => (
          <div key={s.label} style={{ ...cardStyle, padding: '1rem', textAlign: 'center' }}>
            <p
              className="text-2xl font-bold"
              style={{ color: '#d4af37', fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              {s.value}
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: 'rgba(90,127,160,0.60)', fontFamily: 'Inter, sans-serif' }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ ...cardStyle, padding: '1rem', marginBottom: '1rem' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <MagnifyingGlassIcon
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: searchFocused ? '#d4af37' : 'rgba(90,127,160,0.55)' }}
            />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search catalog…"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: '100%',
                paddingLeft: '2.25rem',
                paddingRight: '1rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                background: 'rgba(10,22,40,0.60)',
                border: searchFocused ? '1px solid rgba(212,175,55,0.50)' : '1px solid rgba(61,96,128,0.35)',
                borderRadius: '0.75rem',
                color: '#c5d8e8',
                fontSize: '0.875rem',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
                boxShadow: searchFocused ? '0 0 0 3px rgba(201,162,39,0.10)' : 'none',
              }}
            />
          </div>
          {selected.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm" style={{ color: 'rgba(138,175,200,0.70)' }}>{selected.length} selected</span>
              <button
                onClick={() => { toast.info('Updating pricing for selected titles…'); }}
                className="px-3 py-2 text-xs font-semibold rounded-lg transition-all"
                style={{ background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 100%)', color: '#0a1628' }}
              >
                Update Pricing
              </button>
              <button
                onClick={() => { toast.info('Exporting CSV…'); setSelected([]); }}
                className="px-3 py-2 text-xs rounded-lg transition-colors"
                style={{ border: '1px solid rgba(61,96,128,0.40)', color: '#8aafc8', background: 'transparent' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,175,55,0.35)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#d4af37';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(61,96,128,0.40)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#8aafc8';
                }}
              >
                Export CSV
              </button>
              <button
                onClick={() => { toast.info('Updating channel distribution…'); }}
                className="px-3 py-2 text-xs rounded-lg transition-colors"
                style={{ border: '1px solid rgba(61,96,128,0.40)', color: '#8aafc8', background: 'transparent' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,175,55,0.35)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#d4af37';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(61,96,128,0.40)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#8aafc8';
                }}
              >
                Add/Remove Channels
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Data grid */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'rgba(5,13,26,0.60)', borderBottom: '1px solid rgba(61,96,128,0.22)' }}>
              <th className="px-4 py-3 text-left w-8">
                <input
                  type="checkbox"
                  checked={selected.length === titles.length && titles.length > 0}
                  onChange={toggleAll}
                  className="rounded"
                  style={{ accentColor: '#d4af37' }}
                />
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
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-bold uppercase cursor-pointer transition-colors"
                  style={{ color: 'rgba(90,127,160,0.60)', letterSpacing: '0.06em', fontFamily: 'Inter, sans-serif' }}
                  onClick={() => handleSort(col.key)}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableCellElement).style.color = '#d4af37'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableCellElement).style.color = 'rgba(90,127,160,0.60)'; }}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && <span style={{ color: '#d4af37' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {titles.map(t => (
              <tr
                key={t.id}
                style={{ borderBottom: '1px solid rgba(61,96,128,0.12)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(61,96,128,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(t.id)}
                    onChange={() => toggleSelect(t.id)}
                    className="rounded"
                    style={{ accentColor: '#d4af37' }}
                  />
                </td>
                <td className="px-4 py-3 font-semibold max-w-xs truncate" style={{ color: '#c5d8e8', fontFamily: '"Playfair Display", Georgia, serif' }}>
                  {t.title}
                </td>
                <td className="px-4 py-3" style={{ color: 'rgba(138,175,200,0.65)' }}>{t.authorName}</td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-4 py-3" style={{ color: 'rgba(138,175,200,0.60)', fontFamily: '"Source Code Pro", monospace', fontSize: '0.75rem' }}>
                  {t.formats.map(f => f.type).join(', ')}
                </td>
                <td className="px-4 py-3" style={{ color: 'rgba(138,175,200,0.65)', fontFamily: '"Source Code Pro", monospace' }}>
                  {t.channels.filter(c => c.status === 'live').length} live
                </td>
                <td className="px-4 py-3" style={{ color: 'rgba(90,127,160,0.60)', fontFamily: '"Source Code Pro", monospace', fontSize: '0.75rem' }}>
                  {t.publicationDate || '—'}
                </td>
                <td className="px-4 py-3" style={{ color: 'rgba(138,175,200,0.60)', fontFamily: '"Source Code Pro", monospace' }}>—</td>
                <td className="px-4 py-3 font-semibold" style={{ color: '#d4af37', fontFamily: '"Source Code Pro", monospace' }}>—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Imprint management */}
      <div style={{ ...cardStyle, marginTop: '1.5rem', padding: '1.5rem' }}>
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-base font-bold text-white"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Imprint Management
          </h3>
          <button
            onClick={() => toast.info('Imprint creation coming soon!')}
            className="text-sm font-medium transition-colors"
            style={{ color: '#d4af37' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#e0c060'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#d4af37'; }}
          >
            + New Imprint
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: 'Horizon Press', titles: 3, status: 'Active' },
            { name: 'Digital Ink', titles: 2, status: 'Active' },
          ].map(imprint => (
            <div
              key={imprint.name}
              className="rounded-xl p-4"
              style={{
                background: 'rgba(10,22,40,0.40)',
                border: '1px solid rgba(61,96,128,0.22)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="font-semibold"
                    style={{ color: '#c5d8e8', fontFamily: '"Playfair Display", Georgia, serif' }}
                  >
                    {imprint.name}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'rgba(90,127,160,0.60)', fontFamily: '"Source Code Pro", monospace' }}
                  >
                    {imprint.titles} titles
                  </p>
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{
                    background: 'rgba(52,211,153,0.10)',
                    color: '#34d399',
                    border: '1px solid rgba(52,211,153,0.22)',
                  }}
                >
                  {imprint.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};
