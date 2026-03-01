import React, { useState, useMemo } from 'react';
import { Layout } from '../components/layout/Layout';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  MOCK_ROYALTY_BREAKDOWN,
  MOCK_DISBURSEMENTS,
  generateMockTimeSeries,
  CHANNEL_COLORS,
} from '../mockData';
import { RoyaltyBreakdown, Disbursement, TimeSeriesPoint } from '../api/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import clsx from 'clsx';

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------
type TabKey = 'earnings' | 'royalty-calculator' | 'disbursements' | 'sales-detail';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'earnings', label: 'Earnings' },
  { key: 'royalty-calculator', label: 'Royalty Calculator' },
  { key: 'disbursements', label: 'Disbursements' },
  { key: 'sales-detail', label: 'Sales Detail' },
];

// ---------------------------------------------------------------------------
// Static earnings data (demo)
// ---------------------------------------------------------------------------
const EARNINGS = {
  thisMonth: 2_847.32,
  lastMonth: 3_102.18,
  ytd: 18_654.9,
  allTime: 48_732.5,
};

// Per-title breakdown
const TITLE_EARNINGS = [
  { title: 'The Meridian Line', units: 4_230, revenue: 28_450.0, royalties: 18_492.5 },
  { title: 'Foundations of Modern Publishing', units: 1_890, revenue: 14_870.0, royalties: 7_435.0 },
  { title: 'Quantum Echoes (Pre-order)', units: 680, revenue: 5_410.0, royalties: 2_705.0 },
  { title: "The Starling's Song", units: 320, revenue: 2_560.0, royalties: 1_280.0 },
];

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------
const fmtCurrency = (v: number) =>
  `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtCompact = (v: number) =>
  v >= 1_000 ? `$${(v / 1_000).toFixed(1)}K` : `$${v.toFixed(0)}`;

// ---------------------------------------------------------------------------
// Sub-components for each tab
// ---------------------------------------------------------------------------

// ---- Earnings Tab ----
const EarningsTab = () => {
  const timeSeries: TimeSeriesPoint[] = useMemo(() => generateMockTimeSeries(90), []);

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="This Month"
          value={fmtCurrency(EARNINGS.thisMonth)}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          color="green"
          trend={{ value: -8.2, label: 'vs last month' }}
        />
        <StatCard
          title="Last Month"
          value={fmtCurrency(EARNINGS.lastMonth)}
          icon={<BanknotesIcon className="w-6 h-6" />}
          color="blue"
          subtitle="Final -- paid out"
        />
        <StatCard
          title="Year to Date"
          value={fmtCurrency(EARNINGS.ytd)}
          icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
          color="purple"
          trend={{ value: 24.6, label: 'vs last year' }}
        />
        <StatCard
          title="All Time"
          value={fmtCurrency(EARNINGS.allTime)}
          icon={<CalendarDaysIcon className="w-6 h-6" />}
          color="amber"
          subtitle="Since account creation"
        />
      </div>

      {/* Revenue Over Time */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Revenue Over Time</h3>
        <p className="text-sm text-gray-400 mb-4">Last 90 days of royalty earnings</p>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timeSeries} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gradEarnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => format(parseISO(d), 'MMM d')}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(timeSeries.length / 7)}
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
              labelFormatter={(d) => format(parseISO(d as string), 'EEEE, MMM d, yyyy')}
              formatter={(value: any) => [fmtCurrency(Number(value) || 0), 'Royalties']}
            />
            <Area
              type="monotone"
              dataKey="royalties"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#gradEarnings)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Per-Title Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Earnings by Title</h3>
        <p className="text-sm text-gray-400 mb-4">Cumulative breakdown per published work</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
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
                  Share
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {TITLE_EARNINGS.map((t) => {
                const totalRoyalties = TITLE_EARNINGS.reduce((s, x) => s + x.royalties, 0);
                const share = ((t.royalties / totalRoyalties) * 100).toFixed(1);
                return (
                  <tr key={t.title} className="group hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 font-medium text-gray-900">{t.title}</td>
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
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                        {share}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td className="py-4 font-semibold text-gray-900">Total</td>
                <td className="py-4 text-right font-semibold text-gray-900 tabular-nums">
                  {TITLE_EARNINGS.reduce((s, t) => s + t.units, 0).toLocaleString()}
                </td>
                <td className="py-4 text-right font-semibold text-gray-900 tabular-nums">
                  {fmtCurrency(TITLE_EARNINGS.reduce((s, t) => s + t.revenue, 0))}
                </td>
                <td className="py-4 text-right font-bold text-emerald-600 tabular-nums">
                  {fmtCurrency(TITLE_EARNINGS.reduce((s, t) => s + t.royalties, 0))}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

// ---- Royalty Calculator Tab ----
const RoyaltyCalculatorTab = () => {
  const [price, setPrice] = useState(14.99);
  const [formatType, setFormatType] = useState<'ebook' | 'paperback' | 'hardcover'>('ebook');

  // Base data for the selected format type
  const baseRows: RoyaltyBreakdown[] = useMemo(
    () => MOCK_ROYALTY_BREAKDOWN.filter((r) => r.format_type === formatType),
    [formatType],
  );

  // Scale proportionally when price changes
  const scaledRows: RoyaltyBreakdown[] = useMemo(() => {
    return baseRows.map((row) => {
      const scale = row.list_price > 0 ? price / row.list_price : 1;
      return {
        ...row,
        list_price: price,
        gross_royalty: Math.round(row.gross_royalty * scale * 100) / 100,
        distribution_fee: Math.round(row.distribution_fee * scale * 100) / 100,
        platform_fee: Math.round(row.platform_fee * scale * 100) / 100,
        net_royalty: Math.round(row.net_royalty * scale * 100) / 100,
      };
    });
  }, [baseRows, price]);

  // If no rows match (e.g., hardcover not in mock data), show message
  const hasData = scaledRows.length > 0;

  return (
    <div className="space-y-6">
      {/* Input controls */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Configure Pricing</h3>
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <label htmlFor="calc-price" className="block text-sm font-medium text-gray-700 mb-1">
              List Price (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                id="calc-price"
                type="number"
                min={0.99}
                max={999.99}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-36 pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>
          <div>
            <label htmlFor="calc-format" className="block text-sm font-medium text-gray-700 mb-1">
              Format Type
            </label>
            <select
              id="calc-format"
              value={formatType}
              onChange={(e) => setFormatType(e.target.value as 'ebook' | 'paperback' | 'hardcover')}
              className="w-44 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              <option value="ebook">E-book</option>
              <option value="paperback">Paperback</option>
              <option value="hardcover">Hardcover</option>
            </select>
          </div>
        </div>
      </div>

      {/* Royalty breakdown table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Royalty Breakdown</h3>
        <p className="text-sm text-gray-400 mb-4">
          Estimated net royalties per channel for {formatType} at {fmtCurrency(price)}
        </p>
        {hasData ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    'Channel',
                    'List Price',
                    'Gross Royalty',
                    'Dist. Fee',
                    'Platform Fee',
                    'Net Royalty',
                    'Royalty Rate',
                  ].map((h) => (
                    <th
                      key={h}
                      className={clsx(
                        'pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider',
                        h === 'Channel' ? 'text-left' : 'text-right',
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {scaledRows.map((row) => (
                  <tr key={row.channel} className="group hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: CHANNEL_COLORS[row.channel] || '#94a3b8',
                          }}
                        />
                        <span className="font-medium text-gray-900">{row.channel_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right text-gray-600 tabular-nums">
                      {fmtCurrency(row.list_price)}
                    </td>
                    <td className="py-3.5 text-right text-gray-600 tabular-nums">
                      {fmtCurrency(row.gross_royalty)}
                    </td>
                    <td className="py-3.5 text-right text-gray-600 tabular-nums">
                      {row.distribution_fee > 0 ? fmtCurrency(row.distribution_fee) : '--'}
                    </td>
                    <td className="py-3.5 text-right text-gray-600 tabular-nums">
                      {fmtCurrency(row.platform_fee)}
                    </td>
                    <td className="py-3.5 text-right font-semibold text-emerald-600 tabular-nums">
                      {fmtCurrency(row.net_royalty)}
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                        {(row.royalty_rate * 100).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">
              No channel data available for <span className="font-medium">{formatType}</span> format yet.
            </p>
            <p className="text-xs mt-1">Try selecting "E-book" or "Paperback".</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ---- Disbursements Tab ----
const DisbursementsTab = () => {
  const disbursements: Disbursement[] = MOCK_DISBURSEMENTS;

  const formatPeriod = (start: string, end: string) => {
    try {
      return `${format(parseISO(start), 'MMM d')} - ${format(parseISO(end), 'MMM d, yyyy')}`;
    } catch {
      return `${start} - ${end}`;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const paymentMethodLabel = (method: string) => {
    switch (method) {
      case 'stripe':
        return 'Stripe';
      case 'paypal':
        return 'PayPal';
      case 'bank_transfer':
        return 'Bank Transfer';
      default:
        return method;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Disbursed"
          value={fmtCurrency(disbursements.reduce((s, d) => s + d.amount, 0))}
          icon={<BanknotesIcon className="w-6 h-6" />}
          color="green"
          subtitle={`${disbursements.length} payments`}
        />
        <StatCard
          title="Latest Payment"
          value={fmtCurrency(disbursements[0]?.amount ?? 0)}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          color="blue"
          subtitle={disbursements[0] ? formatDate(disbursements[0].created_at) : '--'}
        />
        <StatCard
          title="Average Payout"
          value={fmtCurrency(
            disbursements.length > 0
              ? disbursements.reduce((s, d) => s + d.amount, 0) / disbursements.length
              : 0,
          )}
          icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
          color="purple"
          subtitle="Per period"
        />
      </div>

      {/* Disbursements table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Payment History</h3>
            <p className="text-sm text-gray-400 mt-0.5">All royalty disbursements</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all duration-150">
            <BanknotesIcon className="w-4 h-4" />
            Request Payout
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Period
                </th>
                <th className="pb-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="pb-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="pb-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {disbursements.map((d) => (
                <tr key={d.id} className="group hover:bg-gray-50/60 transition-colors">
                  <td className="py-4 font-medium text-gray-900">
                    {formatPeriod(d.period_start, d.period_end)}
                  </td>
                  <td className="py-4 text-right font-semibold text-emerald-600 tabular-nums">
                    {fmtCurrency(d.amount)}
                  </td>
                  <td className="py-4 text-gray-600">{paymentMethodLabel(d.payment_method)}</td>
                  <td className="py-4 text-center">
                    <StatusBadge status={d.payment_status} />
                  </td>
                  <td className="py-4 text-right text-gray-500 tabular-nums">
                    {formatDate(d.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {disbursements.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <BanknotesIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No disbursements yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ---- Sales Detail Tab ----
const SalesDetailTab = () => {
  const [search, setSearch] = useState('');

  // Placeholder sales data
  const salesRows = [
    { id: 's-1', date: '2026-02-28', title: 'The Meridian Line', channel: 'Amazon KDP', format: 'E-book', units: 42, revenue: 545.58, territory: 'US' },
    { id: 's-2', date: '2026-02-28', title: 'The Meridian Line', channel: 'Apple Books', format: 'E-book', units: 18, revenue: 233.82, territory: 'US' },
    { id: 's-3', date: '2026-02-27', title: 'Foundations of Modern Publishing', channel: 'IngramSpark', format: 'Paperback', units: 12, revenue: 239.88, territory: 'GB' },
    { id: 's-4', date: '2026-02-27', title: 'The Meridian Line', channel: 'Kobo', format: 'E-book', units: 8, revenue: 103.92, territory: 'CA' },
    { id: 's-5', date: '2026-02-26', title: 'Quantum Echoes', channel: 'Amazon KDP', format: 'E-book', units: 24, revenue: 311.76, territory: 'US' },
    { id: 's-6', date: '2026-02-26', title: 'The Meridian Line', channel: 'Barnes & Noble', format: 'E-book', units: 6, revenue: 77.94, territory: 'US' },
    { id: 's-7', date: '2026-02-25', title: 'Foundations of Modern Publishing', channel: 'Amazon KDP', format: 'E-book', units: 15, revenue: 194.85, territory: 'AU' },
    { id: 's-8', date: '2026-02-25', title: "The Starling's Song", channel: 'Apple Books', format: 'E-book', units: 5, revenue: 49.95, territory: 'US' },
  ];

  const filtered = search
    ? salesRows.filter(
        (r) =>
          r.title.toLowerCase().includes(search.toLowerCase()) ||
          r.channel.toLowerCase().includes(search.toLowerCase()) ||
          r.territory.toLowerCase().includes(search.toLowerCase()),
      )
    : salesRows;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Sales Detail</h3>
            <p className="text-sm text-gray-400 mt-0.5">Granular sales data across all channels</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Filter by title, channel, territory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72 px-3.5 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Date', 'Title', 'Channel', 'Format', 'Territory', 'Units', 'Revenue'].map(
                  (h) => (
                    <th
                      key={h}
                      className={clsx(
                        'pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider',
                        ['Units', 'Revenue'].includes(h) ? 'text-right' : 'text-left',
                      )}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r) => (
                <tr key={r.id} className="group hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 text-gray-500 tabular-nums whitespace-nowrap">
                    {format(parseISO(r.date), 'MMM d, yyyy')}
                  </td>
                  <td className="py-3.5 font-medium text-gray-900">{r.title}</td>
                  <td className="py-3.5 text-gray-600">{r.channel}</td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {r.format}
                    </span>
                  </td>
                  <td className="py-3.5 text-gray-600">{r.territory}</td>
                  <td className="py-3.5 text-right text-gray-600 tabular-nums">{r.units}</td>
                  <td className="py-3.5 text-right font-semibold text-gray-900 tabular-nums">
                    {fmtCurrency(r.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No sales records match your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------
export const FinancePage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('earnings');

  const renderTab = () => {
    switch (activeTab) {
      case 'earnings':
        return <EarningsTab />;
      case 'royalty-calculator':
        return <RoyaltyCalculatorTab />;
      case 'disbursements':
        return <DisbursementsTab />;
      case 'sales-detail':
        return <SalesDetailTab />;
    }
  };

  return (
    <Layout
      title="Finance"
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance' }]}
    >
      {/* Tab navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex gap-6" aria-label="Finance tabs">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={clsx(
                'pb-3 text-sm font-semibold border-b-2 transition-colors duration-150 whitespace-nowrap',
                activeTab === key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              )}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Active tab content */}
      {renderTab()}
    </Layout>
  );
};
