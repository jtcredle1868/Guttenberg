import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/layout/Layout';
import { StatCard } from '../components/ui/StatCard';
import {
  MOCK_ANALYTICS_OVERVIEW,
  generateMockTimeSeries,
  MOCK_CHANNEL_BREAKDOWN,
  MOCK_TERRITORY_BREAKDOWN,
  CHANNEL_COLORS,
  TERRITORY_NAMES,
} from '../mockData';
import {
  AnalyticsOverview,
  TimeSeriesPoint,
  ChannelBreakdown,
  TerritoryBreakdown,
} from '../api/types';
import {
  getOverview,
  getSalesTimeSeries,
  getSalesByChannel,
  getSalesByTerritory,
} from '../api/analytics';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { format, parseISO, startOfYear } from 'date-fns';
import clsx from 'clsx';

// ---------------------------------------------------------------------------
// Date range presets
// ---------------------------------------------------------------------------
type DateRange = '7d' | '30d' | '90d' | 'YTD' | 'All';

const DATE_RANGES: { key: DateRange; label: string }[] = [
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
  { key: '90d', label: '90d' },
  { key: 'YTD', label: 'YTD' },
  { key: 'All', label: 'All' },
];

const daysForRange = (range: DateRange): number => {
  switch (range) {
    case '7d':
      return 7;
    case '30d':
      return 30;
    case '90d':
      return 90;
    case 'YTD': {
      const now = new Date();
      const start = startOfYear(now);
      return Math.ceil((now.getTime() - start.getTime()) / 86_400_000);
    }
    case 'All':
      return 365;
  }
};

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------
const fmtCurrency = (v: number) =>
  `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtCompact = (v: number) =>
  v >= 1_000_000
    ? `$${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000
      ? `$${(v / 1_000).toFixed(1)}K`
      : `$${v.toFixed(0)}`;

// ---------------------------------------------------------------------------
// Custom tooltip for the pie chart
// ---------------------------------------------------------------------------
const ChannelTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload as ChannelBreakdown;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xl px-4 py-3 text-sm">
      <p className="font-semibold text-gray-900">{entry.channel_name}</p>
      <p className="text-gray-500 mt-1">
        Revenue: <span className="font-medium text-gray-800">{fmtCurrency(entry.revenue)}</span>
      </p>
      <p className="text-gray-500">
        Units: <span className="font-medium text-gray-800">{entry.units.toLocaleString()}</span>
      </p>
      <p className="text-gray-500">
        Share: <span className="font-medium text-gray-800">{entry.percentage}%</span>
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Top titles derived from channel data (demo purposes)
// ---------------------------------------------------------------------------
interface TopTitle {
  rank: number;
  title: string;
  units: number;
  revenue: number;
  royalties: number;
}

const MOCK_TOP_TITLES: TopTitle[] = [
  { rank: 1, title: 'The Meridian Line', units: 7_240, revenue: 94_120, royalties: 61_178 },
  { rank: 2, title: 'Foundations of Modern Publishing', units: 3_410, revenue: 44_330, royalties: 22_165 },
  { rank: 3, title: 'Quantum Echoes (Pre-order)', units: 1_350, revenue: 17_550, royalties: 8_775 },
  { rank: 4, title: "The Starling's Song", units: 620, revenue: 8_060, royalties: 4_030 },
  { rank: 5, title: 'Ember & Ash (Early Access)', units: 227, revenue: 4_372, royalties: 2_068 },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const AnalyticsPage = () => {
  const [range, setRange] = useState<DateRange>('30d');
  const [loading, setLoading] = useState(true);

  // Data state
  const [overview, setOverview] = useState<AnalyticsOverview>(MOCK_ANALYTICS_OVERVIEW);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [channels, setChannels] = useState<ChannelBreakdown[]>(MOCK_CHANNEL_BREAKDOWN);
  const [territories, setTerritories] = useState<TerritoryBreakdown[]>(MOCK_TERRITORY_BREAKDOWN);

  // Attempt API fetch, fall back to mock data
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [ov, ts, ch, ter] = await Promise.all([
          getOverview(),
          getSalesTimeSeries({ granularity: 'day' }),
          getSalesByChannel(),
          getSalesByTerritory(),
        ]);
        if (!cancelled) {
          setOverview(ov);
          setTimeSeries(ts);
          setChannels(ch);
          setTerritories(ter);
        }
      } catch {
        // API unavailable -- fall back to mock data
        if (!cancelled) {
          setOverview(MOCK_ANALYTICS_OVERVIEW);
          setTimeSeries(generateMockTimeSeries(365));
          setChannels(MOCK_CHANNEL_BREAKDOWN);
          setTerritories(MOCK_TERRITORY_BREAKDOWN);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Slice time series based on selected range
  const filteredTimeSeries = useMemo(() => {
    const days = daysForRange(range);
    return timeSeries.slice(-days);
  }, [timeSeries, range]);

  // Compute daily average from visible window
  const dailyAvg = useMemo(() => {
    if (filteredTimeSeries.length === 0) return 0;
    const total = filteredTimeSeries.reduce((sum, p) => sum + p.revenue, 0);
    return total / filteredTimeSeries.length;
  }, [filteredTimeSeries]);

  // Territory data enriched with full names
  const enrichedTerritories = useMemo(
    () =>
      territories.map((t) => ({
        ...t,
        name: TERRITORY_NAMES[t.territory] || t.territory,
      })),
    [territories],
  );

  // X-axis tick interval
  const xTickInterval = Math.max(1, Math.floor(filteredTimeSeries.length / 7));

  // -------------------------------------------------------------------------
  // Skeleton loader
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <Layout
        title="Analytics"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Analytics' }]}
      >
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
            ))}
          </div>
          <div className="h-80 bg-gray-200 rounded-2xl" />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-2xl" />
            <div className="h-64 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  // -------------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------------
  return (
    <Layout
      title="Analytics"
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Analytics' }]}
    >
      {/* ---- Date range selector ---- */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm font-medium text-gray-500">Period:</span>
        {DATE_RANGES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setRange(key)}
            className={clsx(
              'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150',
              range === key
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ---- KPI Cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Units"
          value={overview.total_units.toLocaleString()}
          icon={<ChartBarIcon className="w-6 h-6" />}
          color="purple"
          trend={{ value: 12.1, label: 'vs last period' }}
        />
        <StatCard
          title="Total Revenue"
          value={fmtCurrency(overview.total_revenue)}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          color="green"
          trend={{ value: 18.4, label: 'vs last period' }}
        />
        <StatCard
          title="Total Royalties"
          value={fmtCurrency(overview.total_royalties)}
          icon={<BanknotesIcon className="w-6 h-6" />}
          color="blue"
          trend={{ value: 15.7, label: 'vs last period' }}
        />
        <StatCard
          title="Daily Average"
          value={fmtCurrency(dailyAvg)}
          subtitle={`Over last ${daysForRange(range)} days`}
          icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
          color="amber"
        />
      </div>

      {/* ---- Sales Over Time (Area Chart) ---- */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Sales Over Time</h3>
            <p className="text-sm text-gray-400 mt-0.5">Units sold and revenue by day</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={filteredTimeSeries} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradUnits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d946ef" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => format(parseISO(d), 'MMM d')}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              interval={xTickInterval}
            />
            <YAxis
              yAxisId="revenue"
              orientation="left"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => fmtCompact(v)}
            />
            <YAxis
              yAxisId="units"
              orientation="right"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                padding: '12px 16px',
              }}
              labelFormatter={(d) => format(parseISO(d as string), 'EEEE, MMM d, yyyy')}
              formatter={(value: any, name: any) => {
                const v = Number(value) || 0;
                if (name === 'revenue') return [fmtCurrency(v), 'Revenue'];
                if (name === 'units') return [v.toLocaleString(), 'Units'];
                return [fmtCurrency(v), 'Royalties'];
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              formatter={(value: string) =>
                value === 'revenue' ? 'Revenue' : value === 'units' ? 'Units' : 'Royalties'
              }
            />
            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#gradRevenue)"
            />
            <Area
              yAxisId="units"
              type="monotone"
              dataKey="units"
              stroke="#d946ef"
              strokeWidth={2}
              fill="url(#gradUnits)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ---- Channel & Territory row ---- */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Sales by Channel -- Donut */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Sales by Channel</h3>
          <p className="text-sm text-gray-400 mb-4">Revenue distribution across platforms</p>
          <div className="flex items-center gap-6">
            <div className="w-48 h-48 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channels}
                    dataKey="revenue"
                    nameKey="channel_name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
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
                  <Tooltip content={<ChannelTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2.5">
              {channels.map((ch) => (
                <div key={ch.channel} className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CHANNEL_COLORS[ch.channel] || '#94a3b8' }}
                  />
                  <span className="text-sm text-gray-600 flex-1 truncate">{ch.channel_name}</span>
                  <span className="text-sm font-semibold text-gray-900 tabular-nums">
                    {ch.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sales by Territory -- Horizontal Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Sales by Territory</h3>
          <p className="text-sm text-gray-400 mb-4">Revenue breakdown by country</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={enrichedTerritories}
              layout="vertical"
              margin={{ left: 10, right: 16 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => fmtCompact(v)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                }}
                formatter={(v: any) => [fmtCurrency(Number(v) || 0), 'Revenue']}
              />
              <Bar
                dataKey="revenue"
                fill="#6366f1"
                radius={[0, 6, 6, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---- Top Performing Titles ---- */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Top Performing Titles</h3>
            <p className="text-sm text-gray-400 mt-0.5">Ranked by total revenue</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-10">
                  #
                </th>
                <th className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="pb-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Units
                </th>
                <th className="pb-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="pb-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Royalties
                </th>
                <th className="pb-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Margin
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_TOP_TITLES.map((t) => {
                const margin =
                  t.revenue > 0 ? ((t.royalties / t.revenue) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={t.rank} className="group hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 text-gray-300 font-bold text-base tabular-nums">
                      {t.rank}
                    </td>
                    <td className="py-4 font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {t.title}
                    </td>
                    <td className="py-4 text-right text-gray-600 tabular-nums">
                      {t.units.toLocaleString()}
                    </td>
                    <td className="py-4 text-right text-gray-600 tabular-nums">
                      {fmtCurrency(t.revenue)}
                    </td>
                    <td className="py-4 text-right font-semibold text-emerald-600 tabular-nums">
                      {fmtCurrency(t.royalties)}
                    </td>
                    <td className="py-4 text-right">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        {margin}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td className="py-4" />
                <td className="py-4 font-semibold text-gray-900">Total</td>
                <td className="py-4 text-right font-semibold text-gray-900 tabular-nums">
                  {MOCK_TOP_TITLES.reduce((s, t) => s + t.units, 0).toLocaleString()}
                </td>
                <td className="py-4 text-right font-semibold text-gray-900 tabular-nums">
                  {fmtCurrency(MOCK_TOP_TITLES.reduce((s, t) => s + t.revenue, 0))}
                </td>
                <td className="py-4 text-right font-bold text-emerald-600 tabular-nums">
                  {fmtCurrency(MOCK_TOP_TITLES.reduce((s, t) => s + t.royalties, 0))}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Layout>
  );
};
