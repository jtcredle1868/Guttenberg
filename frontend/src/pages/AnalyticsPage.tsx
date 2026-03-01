import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { MOCK_ANALYTICS } from '../mockData';
import { AnalyticsData } from '../api/types';
import {
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';
import clsx from 'clsx';

const PRESET_RANGES = ['7d', '30d', '90d', '1y', 'All'];
const COLORS = ['#6366f1', '#d946ef', '#10b981', '#f59e0b', '#3b82f6'];

const fmtCurrency = (v: number) => `$${v.toLocaleString()}`;

export const AnalyticsPage = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => { setData(MOCK_ANALYTICS); setLoading(false); }, 500);
  }, []);

  if (loading) {
    return (
      <Layout title="Analytics">
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}</div>
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </Layout>
    );
  }

  const d = data!;
  const revenueSlice = range === '7d' ? d.revenueOverTime.slice(-7) : range === '30d' ? d.revenueOverTime.slice(-30) : range === '90d' ? d.revenueOverTime.slice(-90) : d.revenueOverTime;

  return (
    <Layout title="Analytics" breadcrumbs={[{ label: 'Analytics' }]}>
      {/* Key Metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: fmtCurrency(d.totalRevenue), trend: '+18.4%', color: 'text-green-600' },
          { label: 'Total Units Sold', value: d.totalUnits.toLocaleString(), trend: '+12.1%', color: 'text-green-600' },
          { label: 'Average Price', value: `$${d.averagePrice.toFixed(2)}`, trend: '+2.3%', color: 'text-green-600' },
          { label: 'Avg. Royalty Rate', value: `${(d.averageRoyaltyRate * 100).toFixed(0)}%`, trend: '', color: '' },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500">{m.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{m.value}</p>
            {m.trend && <p className={clsx('text-xs font-medium mt-1', m.color)}>{m.trend} vs last period</p>}
          </div>
        ))}
      </div>

      {/* Date range selector */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-gray-500">Period:</span>
        {PRESET_RANGES.map(r => (
          <button key={r} onClick={() => setRange(r)} className={clsx('px-3 py-1.5 text-xs font-medium rounded-lg', range === r ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300')}>
            {r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Revenue area chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueSlice}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tickFormatter={d => format(parseISO(d), 'MMM d')} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={Math.floor(revenueSlice.length / 6)} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v: number | undefined) => [`$${(v || 0).toFixed(2)}`, "Revenue"]} labelFormatter={d => format(parseISO(d as string), 'MMM d, yyyy')} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#grad1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Channel pie chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Channel Breakdown</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={d.channelBreakdown} dataKey="revenue" nameKey="channel" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3}>
                {d.channelBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number | undefined) => [`$${(v || 0).toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 12, border: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {d.channelBreakdown.map((ch, i) => (
              <div key={ch.channel} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="flex-1 text-gray-600 capitalize">{ch.channel.replace('-', ' ')}</span>
                <span className="font-semibold text-gray-900">{ch.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Units line chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Units Sold Over Time</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={revenueSlice}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tickFormatter={d => format(parseISO(d), 'MMM d')} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={Math.floor(revenueSlice.length / 6)} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v: number | undefined) => [v || 0, 'Units']} contentStyle={{ borderRadius: 12, border: 'none' }} />
              <Line type="monotone" dataKey="units" stroke="#d946ef" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Territory bar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Top Territories</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={d.territories} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
              <YAxis type="category" dataKey="country" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={80} />
              <Tooltip formatter={(v: number | undefined) => [`$${(v || 0).toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 12, border: 'none' }} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Titles table */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Top Titles</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Title', 'Units Sold', 'Revenue', 'Royalties'].map(h => (
                  <th key={h} className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {d.topTitles.map((t, i) => (
                <tr key={t.titleId} className="hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-800">
                    <span className="mr-2 text-gray-300 text-xs">#{i + 1}</span>{t.title}
                  </td>
                  <td className="py-3 text-gray-600">{t.units.toLocaleString()}</td>
                  <td className="py-3 text-gray-600">${t.revenue.toLocaleString()}</td>
                  <td className="py-3 text-green-600 font-semibold">${t.royalties.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};
