import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout } from '../components/layout/Layout';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ReadinessScore } from '../components/ui/ReadinessScore';
import { MOCK_TITLES } from '../mockData';
import { getTitles } from '../api/titles';
import { TitleListItem } from '../api/types';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  FunnelIcon,
  DocumentDuplicateIcon,
  GlobeAltIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Draft' },
  { id: 'formatting', label: 'Formatting' },
  { id: 'ready', label: 'Ready' },
  { id: 'live', label: 'Live' },
  { id: 'unlisted', label: 'Unlisted' },
] as const;

const ACCENT_GRADIENTS = [
  'from-indigo-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-fuchsia-600',
  'from-lime-500 to-green-600',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const relativeTime = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  } catch {
    return dateStr;
  }
};

const formatWordCount = (count?: number): string => {
  if (!count) return '--';
  if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k`;
  return count.toLocaleString();
};

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-100" />
    <div className="p-5">
      <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-3" />
      <div className="h-3 bg-gray-100 rounded-lg w-1/2 mb-2" />
      <div className="h-5 bg-gray-100 rounded-full w-20 mb-4 mt-4" />
      <div className="flex items-center justify-between mt-4">
        <div className="h-3 bg-gray-100 rounded-lg w-16" />
        <div className="h-8 w-8 bg-gray-100 rounded-full" />
      </div>
      <div className="flex gap-4 mt-4">
        <div className="h-3 bg-gray-50 rounded w-10" />
        <div className="h-3 bg-gray-50 rounded w-10" />
        <div className="h-3 bg-gray-50 rounded w-16 ml-auto" />
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// TitlesPage
// ---------------------------------------------------------------------------

export const TitlesPage = () => {
  const [titles, setTitles] = useState<TitleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();

  const loadTitles = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await getTitles({
        search,
        status: activeFilter === 'all' ? undefined : activeFilter,
      });
      setTitles(resp.results);
    } catch {
      // API unavailable -- fall back to mock data for demo
      await new Promise((r) => setTimeout(r, 400));
      setTitles(MOCK_TITLES);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTitles();
  }, [loadTitles]);

  // Client-side filtering & search
  const filtered = useMemo(() => {
    return titles.filter((t) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        t.title.toLowerCase().includes(q) ||
        t.primary_author.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q);

      const matchFilter =
        activeFilter === 'all' || t.status === activeFilter;

      return matchSearch && matchFilter;
    });
  }, [titles, search, activeFilter]);

  // Status counts for filter badges
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: titles.length };
    titles.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return counts;
  }, [titles]);

  return (
    <Layout title="My Titles" breadcrumbs={[{ label: 'My Titles' }]}>
      {/* ------------------------------------------------------------------ */}
      {/* Top Bar: Search + New Title                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="w-[18px] h-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles, authors, genres..."
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400"
          />
        </div>

        <button
          onClick={() => navigate('/titles/new')}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/25"
        >
          <PlusIcon className="w-4 h-4" />
          New Title
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Filter Chips                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        <FunnelIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                activeFilter === f.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
              <span className="ml-1.5 text-[10px] tabular-nums text-gray-400">
                {statusCounts[f.id] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Content Area                                                       */}
      {/* ------------------------------------------------------------------ */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-4">
            <BookOpenIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {search || activeFilter !== 'all'
              ? 'No titles match your filters'
              : 'No titles yet'}
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            {search || activeFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Create your first title to begin your self-publishing journey.'}
          </p>
          <button
            onClick={() => navigate('/titles/new')}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/25"
          >
            <PlusIcon className="w-4 h-4" />
            Create Your First Title
          </button>
        </div>
      ) : (
        /* Title Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((t, idx) => (
            <div
              key={t.id}
              onClick={() => navigate(`/titles/${t.id}`)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group overflow-hidden"
            >
              {/* Gradient accent top strip */}
              <div
                className={`h-2 bg-gradient-to-r ${
                  ACCENT_GRADIENTS[idx % ACCENT_GRADIENTS.length]
                }`}
              />

              <div className="p-5">
                {/* Title & Author */}
                <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-indigo-700 transition-colors">
                  {t.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {t.primary_author}
                </p>

                {/* Genre pill */}
                {t.genre && (
                  <span className="inline-block mt-2 px-2.5 py-0.5 text-[11px] font-medium text-gray-600 bg-gray-100 rounded-full">
                    {t.genre}
                  </span>
                )}

                {/* Status + Readiness */}
                <div className="flex items-center justify-between mt-4">
                  <StatusBadge status={t.status} />
                  <ReadinessScore score={t.publishing_readiness_score} size="sm" />
                </div>

                {/* Meta row: word count, formats, channels, updated */}
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400">
                  {t.word_count > 0 && (
                    <span title="Word count">
                      {formatWordCount(t.word_count)} words
                    </span>
                  )}
                  <span className="flex items-center gap-1" title="Formats">
                    <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                    {t.format_count}
                  </span>
                  <span className="flex items-center gap-1" title="Channels">
                    <GlobeAltIcon className="w-3.5 h-3.5" />
                    {t.channel_count}
                  </span>
                  <span className="flex items-center gap-1 ml-auto" title="Updated">
                    <CalendarDaysIcon className="w-3.5 h-3.5" />
                    {relativeTime(t.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};
