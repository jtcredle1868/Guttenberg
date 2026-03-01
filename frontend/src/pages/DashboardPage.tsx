import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DashboardStats } from '../api/types';
import { MOCK_DASHBOARD_STATS } from '../mockData';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  BookOpenIcon, CurrencyDollarIcon, TrophyIcon, GlobeAltIcon,
  PlusIcon, ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const activityIcons: Record<string, string> = {
  distribution_live: '🌐',
  sales_milestone: '🏆',
  format_complete: '📄',
  payout_sent: '💰',
  review_received: '⭐',
};

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats(MOCK_DASHBOARD_STATS);
      setLoading(false);
    }, 600);
  }, []);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
          </div>
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </Layout>
    );
  }

  const s = stats!;

  return (
    <Layout title="Dashboard" breadcrumbs={[{ label: 'Dashboard' }]}>
      {/* Quick Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">Welcome back to your publishing hub</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/titles/new')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
          >
            <PlusIcon className="w-4 h-4" /> New Title
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
            <ArrowUpTrayIcon className="w-4 h-4" /> Import
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Titles" value={s.totalTitles}
          subtitle={`${s.activeTitles} active`}
          icon={<BookOpenIcon className="w-6 h-6" />}
          color="blue"
          trend={{ value: 25, label: 'vs last quarter' }}
        />
        <StatCard
          title="All-Time Revenue" value={`$${s.allTimeRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          color="green"
          trend={{ value: 18.4, label: 'vs last year' }}
        />
        <StatCard
          title="Total Royalties" value={`$${s.totalRoyalties.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<TrophyIcon className="w-6 h-6" />}
          color="purple"
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Sales sparkline */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Revenue — Last 30 Days</h2>
            <span className="text-sm text-gray-400">All titles combined</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={s.salesLast30Days.slice(-30)} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tickFormatter={d => format(parseISO(d), 'MMM d')} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={6} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v: number | undefined) => [`$${(v || 0).toFixed(2)}`, "Revenue"]} labelFormatter={d => format(parseISO(d as string), 'MMM d, yyyy')} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {s.recentActivity.map(event => (
              <div key={event.id} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-base">
                  {activityIcons[event.type] || '📢'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{event.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{event.description}</p>
                  <p className="text-xs text-gray-300 mt-0.5">
                    {format(new Date(event.timestamp), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Publishing Readiness Overview */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Publishing Readiness Overview</h2>
          <button onClick={() => navigate('/titles')} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-3 font-semibold text-gray-500 text-xs uppercase">Title</th>
                <th className="text-left pb-3 font-semibold text-gray-500 text-xs uppercase">Status</th>
                <th className="text-left pb-3 font-semibold text-gray-500 text-xs uppercase">Readiness</th>
                <th className="text-left pb-3 font-semibold text-gray-500 text-xs uppercase">Channels</th>
                <th className="text-left pb-3 font-semibold text-gray-500 text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {s.titleReadiness.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3">
                    <span
                      className="font-medium text-gray-800 hover:text-primary-600 cursor-pointer"
                      onClick={() => navigate(`/titles/${t.id}`)}
                    >
                      {t.title}
                    </span>
                  </td>
                  <td className="py-3"><StatusBadge status={t.status} /></td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 w-28">
                        <div
                          className={clsx('h-2 rounded-full', t.readinessScore >= 80 ? 'bg-green-500' : t.readinessScore >= 60 ? 'bg-amber-500' : 'bg-red-500')}
                          style={{ width: `${t.readinessScore}%` }}
                        />
                      </div>
                      <span className={clsx('text-xs font-bold', t.readinessScore >= 80 ? 'text-green-600' : t.readinessScore >= 60 ? 'text-amber-600' : 'text-red-600')}>
                        {t.readinessScore}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-gray-600">{t.channels} live</td>
                  <td className="py-3">
                    <button
                      onClick={() => navigate(`/titles/${t.id}`)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Manage →
                    </button>
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
