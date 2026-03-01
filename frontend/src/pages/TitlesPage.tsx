import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ReadinessScore } from '../components/ui/ReadinessScore';
import { Title, FormatType } from '../api/types';
import { MOCK_TITLES } from '../mockData';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  PlusIcon, MagnifyingGlassIcon, Squares2X2Icon, ListBulletIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

const statusTabs: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Draft' },
  { id: 'in-production', label: 'In Production' },
  { id: 'published', label: 'Published' },
  { id: 'archived', label: 'Archived' },
];

const formatIcons: Record<FormatType, string> = {
  print: '📚', ebook: '📱', audiobook: '🎧',
};

const CoverPlaceholder = ({ title, color }: { title: string; color: string }) => (
  <div className={clsx('w-full h-full flex flex-col items-center justify-center text-white p-3 rounded-t-xl', color)}>
    <BookOpenIcon className="w-8 h-8 mb-2 opacity-70" />
    <p className="text-xs font-semibold text-center leading-tight line-clamp-3">{title}</p>
  </div>
);

const coverColors = [
  'bg-gradient-to-br from-primary-600 to-primary-800',
  'bg-gradient-to-br from-accent-600 to-accent-800',
  'bg-gradient-to-br from-green-600 to-green-800',
  'bg-gradient-to-br from-amber-600 to-amber-800',
  'bg-gradient-to-br from-rose-600 to-rose-800',
];

export const TitlesPage = () => {
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search titles…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode('grid')} className={clsx('p-2 rounded-lg', viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600')}>
            <Squares2X2Icon className="w-5 h-5" />
          </button>
          <button onClick={() => setViewMode('list')} className={clsx('p-2 rounded-lg', viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600')}>
            <ListBulletIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/titles/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" /> New Title
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {statusTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-1.5 text-sm font-medium rounded-lg transition-colors',
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-gray-400">
              ({tab.id === 'all' ? titles.length : titles.filter(t => t.status === tab.id).length})
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className={clsx('grid gap-4', viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1')}>
          {[...Array(5)].map((_, i) => <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-2xl" />)}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((title, i) => (
            <div
              key={title.id}
              onClick={() => navigate(`/titles/${title.id}`)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group"
            >
              <div className="h-44 rounded-t-2xl overflow-hidden">
                {title.coverUrl ? (
                  <img src={title.coverUrl} alt={title.title} className="w-full h-full object-cover" />
                ) : (
                  <CoverPlaceholder title={title.title} color={coverColors[i % coverColors.length]} />
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">{title.title}</p>
                <p className="text-xs text-gray-500 mb-2">{title.authorName}</p>
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Title', 'Author', 'Status', 'Formats', 'Channels', 'Readiness', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/titles/${t.id}`)}>
                  <td className="px-4 py-3 font-medium text-gray-900">{t.title}</td>
                  <td className="px-4 py-3 text-gray-500">{t.authorName}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3">{t.formats.map(f => formatIcons[f.type]).join(' ')}</td>
                  <td className="px-4 py-3 text-gray-600">{t.channels.filter(c => c.status === 'live').length} live</td>
                  <td className="px-4 py-3"><ReadinessScore score={t.readinessScore} size="sm" /></td>
                  <td className="px-4 py-3 text-primary-600 text-xs font-medium">Manage →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};
