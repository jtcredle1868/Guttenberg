import React, { useEffect, useState, useMemo } from 'react';
import { Layout } from '../components/layout/Layout';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  MOCK_TITLES,
  MOCK_ANALYTICS_OVERVIEW,
  MOCK_CHANNEL_BREAKDOWN,
  MOCK_ACTIVITY_FEED,
  CHANNEL_COLORS,
  generateMockTimeSeries,
} from '../mockData';
import {
  AnalyticsOverview,
  TimeSeriesPoint,
  ChannelBreakdown,
  ActivityEvent,
  TitleListItem,
} from '../api/types';
import { getOverview, getSalesTimeSeries, getSalesByChannel } from '../api/analytics';
import { getActivityFeed } from '../api/ecosystem';
import { getTitles } from '../api/titles';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  BookOpenIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  SparklesIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  GlobeAltIcon,
  TrophyIcon,
  BanknotesIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  StarIcon,
  BellAlertIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmtCurrency = (v: number) =>
  `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtCompact = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
};

const activityIcons: Record<string, React.ReactNode> = {
  distribution_live: <GlobeAltIcon className="w-4 h-4 text-blue-500" />,
  sales_milestone: <TrophyIcon className="w-4 h-4 text-amber-500" />,
  format_complete: <DocumentTextIcon className="w-4 h-4 text-green-500" />,
  royalty_disbursed: <BanknotesIcon className="w-4 h-4 text-emerald-500" />,
  payout_sent: <BanknotesIcon className="w-4 h-4 text-emerald-500" />,
  review_received: <StarIcon className="w-4 h-4 text-yellow-500" />,
  marketing_task_due: <BellAlertIcon className="w-4 h-4 text-rose-500" />,
};

const activityColors: Record<string, string> = {
  distribution_live: 'bg-blue-50 border-blue-100',
  sales_milestone: 'bg-amber-50 border-amber-100',
  format_complete: 'bg-green-50 border-green-100',
  royalty_disbursed: 'bg-emerald-50 border-emerald-100',
  payout_sent: 'bg-emerald-50 border-emerald-100',
  review_received: 'bg-yellow-50 border-yellow-100',
  marketing_task_due: 'bg-rose-50 border-rose-100',
};

// ---------------------------------------------------------------------------
// DashboardPage
// ---------------------------------------------------------------------------

export const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AnalyticsOverview>(MOCK_ANALYTICS_OVERVIEW);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [channels, setChannels] = useState<ChannelBreakdown[]>(MOCK_CHANNEL_BREAKDOWN);
  const [activity, setActivity] = useState<ActivityEvent[]>(MOCK_ACTIVITY_FEED);
  const [titles, setTitles] = useState<TitleListItem[]>(MOCK_TITLES);
  const navigate = useNavigate();

  // Attempt API fetch, fall back to mock data
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [ov, ts, ch, feed, titlesResp] = await Promise.all([
          getOverview(),
          getSalesTimeSeries({ granularity: 'day' }),
          getSalesByChannel(),
          getActivityFeed({ page_size: 6 }),
          getTitles({ page_size: 10 }),
        ]);
        if (!cancelled) {
          setOverview(ov);
          setTimeSeries(ts);
          setChannels(ch);
          setActivity(feed.results);
          setTitles(titlesResp.results);
        }
      } catch {
        // API unavailable -- fall back to mock data for demo
        if (!cancelled) {
          setOverview(MOCK_ANALYTICS_OVERVIEW);
          setTimeSeries(generateMockTimeSeries(30));
          setChannels(MOCK_CHANNEL_BREAKDOWN);
          setActivity(MOCK_ACTIVITY_FEED);
          setTitles(MOCK_TITLES);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Greeting
  const demoUser = sessionStorage.getItem('demo_user');
  const userName = demoUser ? JSON.parse(demoUser).name : 'Author';
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);
  const todayStr = format(new Date(), 'EEEE, MMMM d, yyyy');

  // Average readiness
  const avgReadiness = useMemo(() => {
    if (titles.length === 0) return 0;
    return Math.round(
      titles.reduce((sum, t) => sum + t.publishing_readiness_score, 0) / titles.length,
    );
  }, [titles]);

  // Last 30 days of time series for chart
  const chartData = useMemo(() => timeSeries.slice(-30), [timeSeries]);

  // Loading skeleton
  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="space-y-6 animate-pulse">
          <div className="h-16 bg-gray-100 rounded-2xl w-2/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 h-72 bg-gray-100 rounded-2xl" />
            <div className="h-72 bg-gray-100 rounded-2xl" />
          </div>
          <div className="h-48 bg-gray-100 rounded-2xl" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" breadcrumbs={[{ label: 'Dashboard' }]}>
      {/* ---------------------------------------------------------------- */}
      {/* Welcome header                                                   */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {greeting}, {userName}
          </h2>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5" />
            {todayStr}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/titles/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg shadow-indigo-600/25"
          >
            <PlusIcon className="w-4 h-4" /> New Title
          </button>
          <button
            onClick={() => navigate('/titles/new')}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            <ArrowUpTrayIcon className="w-4 h-4" /> Import from Refinery
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            <ChartBarIcon className="w-4 h-4" /> View Analytics
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* KPI Stat Cards                                                   */}
      {/* ---------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Revenue"
          value={fmtCurrency(overview.total_revenue)}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          color="green"
          trend={{ value: 18.4, label: 'vs last period' }}
        />
        <StatCard
          title="Units Sold"
          value={overview.total_units.toLocaleString()}
          subtitle="All time"
          icon={<ShoppingCartIcon className="w-6 h-6" />}
          color="blue"
          trend={{ value: 12.1, label: 'vs last period' }}
        />
        <StatCard
          title="Active Titles"
          value={overview.active_titles}
          subtitle={`of ${titles.length} total`}
          icon={<BookOpenIcon className="w-6 h-6" />}
          color="purple"
          trend={{ value: 25, label: 'vs last quarter' }}
        />
        <StatCard
          title="Readiness Score"
          value={`${avgReadiness}%`}
          subtitle="Average across titles"
          icon={<SparklesIcon className="w-6 h-6" />}
          color="amber"
          trend={{ value: 5.2, label: 'improvement' }}
        />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Charts row: Revenue Over Time + Sales by Channel                 */}
      {/* ---------------------------------------------------------------- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Revenue Over Time area chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Revenue Over Time
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Last 30 days, all titles combined
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">
              <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
              +18.4%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="dashRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => format(parseISO(d), 'MMM d')}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => fmtCompact(v)}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  padding: '12px 16px',
                }}
                formatter={(v: any) => [fmtCurrency(Number(v) || 0), 'Revenue']}
                labelFormatter={(d) =>
                  format(parseISO(d as string), 'EEEE, MMM d, yyyy')
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#dashRevGrad)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#6366f1' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Channel donut chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Sales by Channel
          </h3>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie
                data={channels}
                dataKey="revenue"
                nameKey="channel_name"
                cx="50%"
                cy="50%"
                outerRadius={68}
                innerRadius={42}
                paddingAngle={3}
                strokeWidth={0}
              >
                {channels.map((ch) => (
                  <Cell
                    key={ch.channel}
                    fill={CHANNEL_COLORS[ch.channel] || '#94a3b8'}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                }}
                formatter={(v: any) => [fmtCurrency(Number(v) || 0), 'Revenue']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {channels.map((ch) => (
              <div key={ch.channel} className="flex items-center gap-2.5 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CHANNEL_COLORS[ch.channel] || '#94a3b8' }}
                />
                <span className="flex-1 text-gray-600 font-medium truncate">
                  {ch.channel_name}
                </span>
                <span className="text-gray-400 tabular-nums">{ch.percentage}%</span>
                <span className="font-semibold text-gray-900 tabular-nums w-14 text-right">
                  {fmtCompact(ch.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Recent Activity + Quick Actions                                   */}
      {/* ---------------------------------------------------------------- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Recent Activity feed */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-gray-900">
              Recent Activity
            </h3>
            <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {activity.slice(0, 6).map((event) => (
              <div
                key={event.id}
                className={clsx(
                  'flex gap-3.5 p-3.5 rounded-xl border transition-colors hover:shadow-sm',
                  activityColors[event.event_type] || 'bg-gray-50 border-gray-100',
                )}
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  {activityIcons[event.event_type] || (
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800">
                      {event.message}
                    </p>
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                      {format(new Date(event.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  {!event.is_read && (
                    <span className="inline-block mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2.5">
              {[
                {
                  icon: PlusIcon,
                  label: 'Create New Title',
                  desc: 'Start a new publishing project',
                  onClick: () => navigate('/titles/new'),
                  color: 'from-indigo-600 to-indigo-700',
                },
                {
                  icon: ArrowUpTrayIcon,
                  label: 'Import from Refinery',
                  desc: 'Pull in a completed manuscript',
                  onClick: () => navigate('/titles/new'),
                  color: 'from-purple-600 to-fuchsia-700',
                },
                {
                  icon: ChartBarIcon,
                  label: 'View Analytics',
                  desc: 'Full sales & performance data',
                  onClick: () => navigate('/analytics'),
                  color: 'from-emerald-500 to-green-600',
                },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all text-left group"
                >
                  <div
                    className={clsx(
                      'flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-sm',
                      action.color,
                    )}
                  >
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
                      {action.label}
                    </p>
                    <p className="text-xs text-gray-400">{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Publishing Readiness Overview                                    */}
      {/* ---------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Publishing Readiness
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Per-title status and channel readiness
            </p>
          </div>
          <button
            onClick={() => navigate('/titles')}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            View all titles
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Title', 'Status', 'Readiness', 'Formats', 'Channels', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left pb-3 font-semibold text-gray-500 text-xs uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {titles.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="py-3.5 pr-4">
                    <button
                      className="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors text-left"
                      onClick={() => navigate(`/titles/${t.id}`)}
                    >
                      {t.title}
                    </button>
                    {t.subtitle && (
                      <p className="text-xs text-gray-400 truncate max-w-[200px]">
                        {t.subtitle}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 pr-4">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 w-32 max-w-[8rem]">
                        <div
                          className={clsx(
                            'h-2 rounded-full transition-all duration-500',
                            t.publishing_readiness_score >= 80
                              ? 'bg-green-500'
                              : t.publishing_readiness_score >= 60
                              ? 'bg-amber-500'
                              : 'bg-red-500',
                          )}
                          style={{ width: `${t.publishing_readiness_score}%` }}
                        />
                      </div>
                      <span
                        className={clsx(
                          'text-xs font-bold tabular-nums',
                          t.publishing_readiness_score >= 80
                            ? 'text-green-600'
                            : t.publishing_readiness_score >= 60
                            ? 'text-amber-600'
                            : 'text-red-600',
                        )}
                      >
                        {t.publishing_readiness_score}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-gray-600 tabular-nums">
                    {t.format_count}
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-1.5">
                      {t.channel_count > 0 ? (
                        <>
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {t.channel_count}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">--</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5">
                    <button
                      onClick={() => navigate(`/titles/${t.id}`)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Manage
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
