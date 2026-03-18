import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ReadinessScore } from '../components/ui/ReadinessScore';
import { Title, FormatType } from '../api/types';
import { MOCK_TITLES } from '../mockData';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon, MagnifyingGlassIcon, Squares2X2Icon, ListBulletIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const statusTabs: { id: string; label: string }[] = [
  { id: 'all',           label: 'All' },
  { id: 'draft',         label: 'Draft' },
  { id: 'in-production', label: 'In Production' },
  { id: 'published',     label: 'Published' },
  { id: 'archived',      label: 'Archived' },
];

const formatIcons: Record<FormatType, string> = {
  print: '📚', ebook: '📱', audiobook: '🎧',
};

const coverGradients = [
  'linear-gradient(135deg, #c9a227 0%, #1a2d4e 100%)',
  'linear-gradient(135deg, #243b55 0%, #c9a227 100%)',
  'linear-gradient(135deg, #2e4a6b 0%, #d4af37 70%, #0f2040 100%)',
  'linear-gradient(135deg, #3d6080 0%, #c9a227 60%, #0a1628 100%)',
  'linear-gradient(135deg, #1a2d4e 0%, #d4af37 50%, #050d1a 100%)',
];

const CoverPlaceholder = ({ title, gradientIdx }: { title: string; gradientIdx: number }) => (
  <div
    className="w-full h-full flex flex-col items-center justify-center p-3 rounded-t-2xl relative overflow-hidden"
    style={{ background: coverGradients[gradientIdx % coverGradients.length] }}
  >
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(212,175,55,0.15) 0%, transparent 70%)' }}
    />
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 relative z-10"
      style={{ background: 'rgba(5,13,26,0.40)', border: '1px solid rgba(212,175,55,0.35)' }}
    >
      <BookOpenIcon className="w-5 h-5" style={{ color: 'rgba(212,175,55,0.90)' }} />
    </div>
    <p
      className="text-xs font-semibold text-center leading-tight line-clamp-3 relative z-10 px-1"
      style={{ color: 'rgba(255,255,255,0.90)', fontFamily: '"Playfair Display", Georgia, serif', textShadow: '0 1px 3px rgba(5,13,26,0.60)' }}
    >
      {title}
    </p>
  </div>
);

export const TitlesPage = () => {
  const [titles, setTitles]       = useState<Title[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode]   = useState<'grid' | 'list'>('grid');
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => { setTitles(MOCK_TITLES); setLoading(false); }, 400);
  }, []);

  const filtered = titles.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.authorName.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === 'all' || t.status === activeTab;
    return matchSearch && matchTab;
  });

  return (
    <Layout title="My Titles" breadcrumbs={[{ label: 'My Titles' }]}>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlassIcon
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
            style={{ color: searchFocused ? '#d4af37' : 'rgba(90,127,160,0.55)' }}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search titles…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm transition-all duration-150"
            style={{
              background: 'rgba(10,22,40,0.70)',
              border: searchFocused ? '1px solid rgba(212,175,55,0.55)' : '1px solid rgba(61,96,128,0.32)',
              color: '#c5d8e8',
              outline: 'none',
              fontFamily: 'Inter, sans-serif',
              boxShadow: searchFocused ? '0 0 0 3px rgba(201,162,39,0.12)' : 'none',
            }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggles */}
          {([['grid', Squares2X2Icon], ['list', ListBulletIcon]] as const).map(([mode, Icon]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={clsx(
                'p-2 rounded-lg transition-all duration-150',
                viewMode === mode
                  ? 'bg-gold-500/10 border border-gold-500/30 text-gold-500'
                  : 'border border-navy-500/40 text-navy-300/60 hover:border-navy-400/60 hover:text-navy-200',
              )}
              aria-label={`${mode} view`}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}

          <button onClick={() => navigate('/titles/new')} className="btn-gold">
            <PlusIcon className="w-4 h-4" />
            New Title
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-0.5 mb-5 p-1 rounded-xl w-fit bg-navy-900/60 border border-navy-600/25">
        {statusTabs.map(tab => {
          const isActive = activeTab === tab.id;
          const count    = tab.id === 'all' ? titles.length : titles.filter(t => t.status === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 font-inter',
                isActive
                  ? 'bg-gradient-to-br from-navy-700 to-navy-600 border border-gold-500/25 text-gold-500'
                  : 'text-navy-200/60 hover:text-navy-100 hover:bg-navy-600/15 border border-transparent',
              )}
            >
              {tab.label}
              <span
                className={clsx('ml-1.5 text-xs font-mono', isActive ? 'text-gold-500/65' : 'text-navy-300/45')}
              >
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(10,22,40,0.60) 100%)',
              border: '1px solid rgba(212,175,55,0.22)',
            }}
          >
            <BookOpenIcon className="w-9 h-9" style={{ color: 'rgba(212,175,55,0.65)' }} />
          </div>
          <h3
            className="text-xl font-bold mb-2"
            style={{ color: '#e0c060', fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Your library awaits
          </h3>
          <p className="text-sm mb-6" style={{ color: 'rgba(138,175,200,0.60)', fontFamily: 'Inter, sans-serif' }}>
            {search || activeTab !== 'all'
              ? 'No titles match your current filters.'
              : 'Begin your publishing journey by creating your first title.'}
          </p>
          {!search && activeTab === 'all' && (
            <button onClick={() => navigate('/titles/new')} className="btn-gold">
              <PlusIcon className="w-4 h-4" />
              Create First Title
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-64 rounded-2xl skeleton" />)}
        </div>
      ) : viewMode === 'grid' ? (
        /* ── GRID MODE ── */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((title, i) => (
            <div
              key={title.id}
              onClick={() => navigate(`/titles/${title.id}`)}
              className="rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden group"
              style={{
                background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
                border: '1px solid rgba(61,96,128,0.22)',
                boxShadow: '0 1px 4px rgba(5,13,26,0.40)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212,175,55,0.40)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(5,13,26,0.55), 0 0 0 1px rgba(212,175,55,0.10)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(61,96,128,0.22)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(5,13,26,0.40)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              }}
            >
              <div className="h-44 overflow-hidden">
                {title.coverUrl ? (
                  <img src={title.coverUrl} alt={title.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <CoverPlaceholder title={title.title} gradientIdx={i} />
                )}
              </div>
              <div className="p-3">
                <p
                  className="font-semibold text-sm leading-tight line-clamp-2 mb-1"
                  style={{ color: '#e0c060', fontFamily: '"Playfair Display", Georgia, serif' }}
                >
                  {title.title}
                </p>
                <p className="text-xs mb-2" style={{ color: '#c4a882', fontFamily: 'Inter, sans-serif' }}>
                  {title.authorName}
                </p>
                <div className="flex items-center justify-between">
                  <StatusBadge status={title.status} />
                  <ReadinessScore score={title.readinessScore} size="sm" />
                </div>
                {title.formats.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {title.formats.map(f => (
                      <span key={f.id} title={f.type} className="text-sm">{formatIcons[f.type]}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── LIST / TABLE MODE ── */
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
            border: '1px solid rgba(61,96,128,0.22)',
          }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(5,13,26,0.55)', borderBottom: '1px solid rgba(61,96,128,0.20)' }}>
                {['Title', 'Author', 'Status', 'Formats', 'Channels', 'Readiness', ''].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'rgba(90,127,160,0.65)', letterSpacing: '0.06em', fontFamily: 'Inter, sans-serif' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, idx) => (
                <tr
                  key={t.id}
                  className="cursor-pointer transition-colors duration-100"
                  style={{
                    borderBottom: '1px solid rgba(61,96,128,0.12)',
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(15,32,64,0.30)',
                  }}
                  onClick={() => navigate(`/titles/${t.id}`)}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(15,32,64,0.30)')}
                >
                  <td
                    className="px-4 py-3.5 font-semibold"
                    style={{ color: '#e0c060', fontFamily: '"Playfair Display", Georgia, serif' }}
                  >
                    {t.title}
                  </td>
                  <td className="px-4 py-3.5" style={{ color: '#c4a882', fontFamily: 'Inter, sans-serif' }}>
                    {t.authorName}
                  </td>
                  <td className="px-4 py-3.5"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3.5 text-base">{t.formats.map(f => formatIcons[f.type]).join(' ')}</td>
                  <td
                    className="px-4 py-3.5"
                    style={{ color: 'rgba(138,175,200,0.70)', fontFamily: '"Source Code Pro", monospace' }}
                  >
                    {t.channels.filter(c => c.status === 'live').length} live
                  </td>
                  <td className="px-4 py-3.5"><ReadinessScore score={t.readinessScore} size="sm" /></td>
                  <td
                    className="px-4 py-3.5 text-xs font-semibold transition-colors"
                    style={{ color: '#c9a227' }}
                  >
                    Manage →
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};
