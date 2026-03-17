import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DashboardStats } from '../api/types';
import { MOCK_DASHBOARD_STATS } from '../mockData';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  BookOpenIcon, CurrencyDollarIcon, TrophyIcon, GlobeAltIcon,
  PlusIcon, ArrowUpTrayIcon, BoltIcon,
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const activityTypeStyle: Record<string, { bg: string; color: string; emoji: string }> = {
  distribution_live: { bg: 'rgba(30,58,110,0.10)', color: '#2d5190',   emoji: '🌐' },
  sales_milestone:   { bg: 'rgba(212,175,55,0.12)', color: '#8e6d17',  emoji: '🏆' },
  format_complete:   { bg: 'rgba(21,128,61,0.09)',  color: '#15803d',  emoji: '📄' },
  payout_sent:       { bg: 'rgba(212,175,55,0.15)', color: '#b08a1e',  emoji: '💰' },
  review_received:   { bg: 'rgba(201,162,39,0.12)', color: '#8e6d17',  emoji: '⭐' },
};

/* Custom recharts tooltip */
const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2.5 rounded-xl text-sm"
      style={{
        background: '#fdf9f4',
        border: '1px solid rgba(30,58,110,0.12)',
        boxShadow: '0 8px 24px rgba(10,22,40,0.12)',
      }}
    >
      <p className="text-xs font-semibold text-navy-900 mb-0.5">{format(parseISO(label as string), 'MMM d, yyyy')}</p>
      <p className="font-bold" style={{ color: '#c9a227' }}>${(payload[0].value as number).toFixed(2)}</p>
    </div>
  );
};

export const DashboardPage = () => {
  const [stats, setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => { setStats(MOCK_DASHBOARD_STATS); setLoading(false); }, 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="space-y-5 animate-pulse">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl skeleton" />
            ))}
          </div>
          <div className="h-64 rounded-2xl skeleton" />
          <div className="h-48 rounded-2xl skeleton" />
        </div>
      </Layout>
    );
  }

  const s = stats!;

  return (
    <Layout title="Dashboard" breadcrumbs={[{ label: 'Dashboard' }]}>
      {/* ── Welcome bar ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BoltIcon className="w-4 h-4" style={{ color: '#d4af37' }} />
          <p className="text-sm font-medium" style={{ color: 'rgba(30,58,110,0.6)' }}>
            Welcome back to your publishing hub
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/titles/new')}
            className="btn-gold"
          >
            <PlusIcon className="w-4 h-4" /> New Title
          </button>
          <button className="btn-ghost">
            <ArrowUpTrayIcon className="w-4 h-4" /> Import
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Titles" value={s.totalTitles}
          subtitle={`${s.activeTitles} active`}
          icon={<BookOpenIcon className="w-6 h-6" />}
          color="navy"
          trend={{ value: 25, label: 'vs last quarter' }}
        />
        <StatCard
          title="All-Time Revenue"
          value={`$${s.allTimeRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          color="gold"
          trend={{ value: 18.4, label: 'vs last year' }}
        />
        <StatCard
          title="Total Royalties"
          value={`$${s.totalRoyalties.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<TrophyIcon className="w-6 h-6" />}
          color="green"
          trend={{ value: 12.1, label: 'vs last year' }}
        />
        <StatCard
          title="Active Channels" value={s.activeChannels}
          subtitle="Across all titles"
          icon={<GlobeAltIcon className="w-6 h-6" />}
          color="amber"
          trend={{ value: 8.3, label: 'vs last month' }}
        />
      </div>

      {/* ── Charts + Activity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        {/* Revenue chart */}
        <div
          className="xl:col-span-2 rounded-2xl p-6"
          style={{
            background: '#fdf9f4',
            border: '1px solid rgba(30,58,110,0.09)',
            boxShadow: '0 1px 3px rgba(10,22,40,0.06)',
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-navy-900 tracking-tight">Revenue</h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(30,58,110,0.45)' }}>Last 30 days · All titles</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={s.salesLast30Days.slice(-30)} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#d4af37" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,110,0.07)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={d => format(parseISO(d), 'MMM d')}
                tick={{ fontSize: 10, fill: 'rgba(30,58,110,0.4)' }}
                tickLine={false} axisLine={false} interval={6}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(30,58,110,0.4)' }}
                tickLine={false} axisLine={false}
                tickFormatter={v => `$${v}`}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Area
                type="monotone" dataKey="revenue"
                stroke="#d4af37" strokeWidth={2.5}
                fill="url(#goldGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Activity feed */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: '#fdf9f4',
            border: '1px solid rgba(30,58,110,0.09)',
            boxShadow: '0 1px 3px rgba(10,22,40,0.06)',
          }}
        >
          <h2 className="text-base font-bold text-navy-900 tracking-tight mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {s.recentActivity.map(event => {
              const t = activityTypeStyle[event.type] || activityTypeStyle.distribution_live;
              return (
                <div key={event.id} className="flex gap-3">
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-base"
                    style={{ background: t.bg }}
                  >
                    {t.emoji}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-navy-800 truncate">{event.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(30,58,110,0.55)' }}>{event.description}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(30,58,110,0.3)' }}>
                      {format(new Date(event.timestamp), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Publishing Readiness table ── */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: '#fdf9f4',
          border: '1px solid rgba(30,58,110,0.09)',
          boxShadow: '0 1px 3px rgba(10,22,40,0.06)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-navy-900 tracking-tight">Publishing Readiness</h2>
          <button
            onClick={() => navigate('/titles')}
            className="text-xs font-semibold transition-colors"
            style={{ color: '#c9a227' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#edc74a')}
            onMouseLeave={e => (e.currentTarget.style.color = '#c9a227')}
          >
            View all →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(30,58,110,0.09)' }}>
                {['Title', 'Status', 'Readiness', 'Channels', ''].map(h => (
                  <th key={h} className="text-left pb-3 text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'rgba(30,58,110,0.45)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.titleReadiness.map(t => (
                <tr
                  key={t.id}
                  className="transition-colors cursor-pointer"
                  style={{ borderBottom: '1px solid rgba(30,58,110,0.06)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,58,110,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => navigate(`/titles/${t.id}`)}
                >
                  <td className="py-3 pr-4">
                    <span className="font-semibold text-navy-800 hover:text-gold-500 transition-colors">
                      {t.title}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="py-3 pr-6">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-full h-1.5 w-28" style={{ background: 'rgba(30,58,110,0.10)' }}>
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${t.readinessScore}%`,
                            background: t.readinessScore >= 80
                              ? 'linear-gradient(90deg, #15803d, #16a34a)'
                              : t.readinessScore >= 60
                              ? 'linear-gradient(90deg, #c9a227, #edc74a)'
                              : 'linear-gradient(90deg, #dc2626, #ef4444)',
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-bold w-8"
                        style={{
                          color: t.readinessScore >= 80 ? '#15803d'
                               : t.readinessScore >= 60 ? '#b08a1e'
                               : '#dc2626',
                        }}
                      >
                        {t.readinessScore}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-sm text-navy-500">{t.channels} live</td>
                  <td className="py-3">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: '#c9a227' }}
                    >
                      Manage →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};
