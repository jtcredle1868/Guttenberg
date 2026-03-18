import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { MOCK_ANALYTICS } from '../mockData';
import { AnalyticsData } from '../api/types';
import {
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import clsx from 'clsx';

/* Design-system chart colours */
const CHART_COLORS = ['#d4af37', '#c4a882', '#8aafc8', '#eacf7a', '#e0ccac'];

const PRESET_RANGES = ['7d', '30d', '90d', '1y', 'All'];
const fmtCurrency   = (v: number) => `$${v.toLocaleString()}`;

const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(26,45,78,0.80) 0%, rgba(15,32,64,0.80) 100%)',
  border: '1px solid rgba(61,96,128,0.25)',
  boxShadow: '0 1px 4px rgba(5,13,26,0.40), 0 4px 16px rgba(5,13,26,0.20)',
  borderRadius: '1rem',
  padding: '1.5rem',
  backdropFilter: 'blur(8px)',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
      border: '1px solid rgba(212,175,55,0.25)',
      borderRadius: '0.75rem',
      padding: '0.75rem 1rem',
      boxShadow: '0 8px 32px rgba(5,13,26,0.60)',
      fontFamily: 'Inter, sans-serif',
    }}>
      {label && (
        <p style={{ color: 'rgba(138,175,200,0.70)', fontSize: '0.7rem', marginBottom: '0.25rem' }}>
          {format(parseISO(label as string), 'MMM d, yyyy')}
        </p>
      )}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: '#d4af37', fontWeight: 700, fontSize: '0.875rem' }}>
          {typeof p.value === 'number' && p.name === 'revenue' ? `$${p.value.toFixed(2)}` : p.value}
        </p>
      ))}
    </div>
  );
};

export const AnalyticsPage = () => {
  const [data, setData]     = useState<AnalyticsData | null>(null);
  const [range, setRange]   = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => { setData(MOCK_ANALYTICS); setLoading(false); }, 500);
  }, []);

  if (loading) {
    return (
      <Layout title="Analytics">
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl skeleton" />)}
          </div>
          <div className="h-64 rounded-2xl skeleton" />
          <div className="grid xl:grid-cols-2 gap-4">
            <div className="h-52 rounded-2xl skeleton" />
            <div className="h-52 rounded-2xl skeleton" />
          </div>
        </div>
      </Layout>
    );
  }

  const d = data!;
  const revenueSlice =
    range === '7d'  ? d.revenueOverTime.slice(-7)  :
    range === '30d' ? d.revenueOverTime.slice(-30) :
    range === '90d' ? d.revenueOverTime.slice(-90) :
    d.revenueOverTime;

  const metrics = [
    { label: 'Total Revenue',     value: fmtCurrency(d.totalRevenue), trend: '+18.4%', positive: true },
    { label: 'Total Units Sold',  value: d.totalUnits.toLocaleString(), trend: '+12.1%', positive: true },
    { label: 'Average Price',     value: `$${d.averagePrice.toFixed(2)}`, trend: '+2.3%', positive: true },
    { label: 'Avg. Royalty Rate', value: `${(d.averageRoyaltyRate * 100).toFixed(0)}%`, trend: '', positive: null },
  ];

  return (
    <Layout title="Analytics" breadcrumbs={[{ label: 'Analytics' }]}>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {metrics.map(m => (
          <div
            key={m.label}
            className="rounded-2xl p-5"
            style={cardStyle}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: 'rgba(90,127,160,0.70)', letterSpacing: '0.06em', fontFamily: 'Inter, sans-serif' }}
            >
              {m.label}
            </p>
            <p
              className="text-2xl font-bold mt-1"
              style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#d4af37' }}
            >
              {m.value}
            </p>
            {m.trend && (
              <p
                className="text-xs font-semibold mt-1"
                style={{ color: m.positive ? '#34d399' : '#f87171', fontFamily: 'Inter, sans-serif' }}
              >
                {m.positive ? '▲' : '▼'} {m.trend} vs last period
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <span
          className="text-xs font-bold uppercase tracking-wider mr-1"
          style={{ color: 'rgba(90,127,160,0.65)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}
        >
          Period:
        </span>
        {PRESET_RANGES.map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={clsx(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150',
              range === r
                ? 'text-navy-900'
                : 'border border-navy-500/35 text-navy-200/75 hover:border-gold-500/40 hover:text-gold-500',
            )}
            style={range === r ? {
              background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 100%)',
              boxShadow: '0 2px 8px rgba(212,175,55,0.32)',
              border: 'none',
              color: '#0a1628',
            } : undefined}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        {/* Revenue area chart */}
        <div className="xl:col-span-2" style={cardStyle}>
          <h3
            className="text-base font-bold mb-4"
            style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#e0c060' }}
          >
            Revenue Over Time
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueSlice}>
              <defs>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#d4af37" stopOpacity={0.30} />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,96,128,0.15)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={d => format(parseISO(d), 'MMM d')}
                tick={{ fontSize: 10, fill: 'rgba(90,127,160,0.60)', fontFamily: 'Inter, sans-serif' }}
                tickLine={false} axisLine={false}
                interval={Math.floor(revenueSlice.length / 6)}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(90,127,160,0.60)', fontFamily: 'Inter, sans-serif' }}
                tickLine={false} axisLine={false}
                tickFormatter={v => `$${v}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(212,175,55,0.18)', strokeWidth: 1 }} />
              <Area
                type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={2}
                fill="url(#aGrad)" dot={false}
                activeDot={{ r: 4, fill: '#d4af37', stroke: '#0f2040', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Channel pie chart */}
        <div style={cardStyle}>
          <h3
            className="text-base font-bold mb-4"
            style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#e0c060' }}
          >
            Channel Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={d.channelBreakdown} dataKey="revenue" nameKey="channel"
                cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3}
              >
                {d.channelBreakdown.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number | undefined) => [`$${(v || 0).toLocaleString()}`, 'Revenue']}
                contentStyle={{
                  borderRadius: '0.75rem',
                  background: '#1a2d4e',
                  border: '1px solid rgba(212,175,55,0.22)',
                  boxShadow: '0 8px 32px rgba(5,13,26,0.55)',
                  color: '#c5d8e8',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {d.channelBreakdown.map((ch, i) => (
              <div key={ch.channel} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <span className="flex-1 capitalize" style={{ color: 'rgba(138,175,200,0.75)', fontFamily: 'Inter, sans-serif' }}>
                  {ch.channel.replace('-', ' ')}
                </span>
                <span
                  className="font-bold"
                  style={{ color: '#d4af37', fontFamily: '"Source Code Pro", monospace' }}
                >
                  {ch.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Units line chart */}
        <div style={cardStyle}>
          <h3
            className="text-base font-bold mb-4"
            style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#e0c060' }}
          >
            Units Sold Over Time
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={revenueSlice}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,96,128,0.15)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={d => format(parseISO(d), 'MMM d')}
                tick={{ fontSize: 10, fill: 'rgba(90,127,160,0.60)', fontFamily: 'Inter, sans-serif' }}
                tickLine={false} axisLine={false}
                interval={Math.floor(revenueSlice.length / 6)}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(90,127,160,0.60)', fontFamily: 'Inter, sans-serif' }}
                tickLine={false} axisLine={false}
              />
              <Tooltip
                formatter={(v: number | undefined) => [v || 0, 'Units']}
                contentStyle={{
                  borderRadius: '0.75rem',
                  background: '#1a2d4e',
                  border: '1px solid rgba(61,96,128,0.30)',
                  color: '#c5d8e8',
                }}
              />
              <Line
                type="monotone" dataKey="units" stroke="#c4a882" strokeWidth={2} dot={false}
                activeDot={{ r: 4, fill: '#c4a882', stroke: '#0f2040', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Territory bar chart */}
        <div style={cardStyle}>
          <h3
            className="text-base font-bold mb-4"
            style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#e0c060' }}
          >
            Top Territories
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={d.territories} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,96,128,0.15)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: 'rgba(90,127,160,0.60)', fontFamily: 'Inter, sans-serif' }}
                tickLine={false} axisLine={false}
                tickFormatter={v => `$${v}`}
              />
              <YAxis
                type="category" dataKey="country"
                tick={{ fontSize: 10, fill: 'rgba(138,175,200,0.75)', fontFamily: 'Inter, sans-serif' }}
                tickLine={false} axisLine={false} width={85}
              />
              <Tooltip
                formatter={(v: number | undefined) => [`$${(v || 0).toLocaleString()}`, 'Revenue']}
                contentStyle={{
                  borderRadius: '0.75rem',
                  background: '#1a2d4e',
                  border: '1px solid rgba(212,175,55,0.22)',
                  color: '#c5d8e8',
                }}
              />
              <Bar dataKey="revenue" fill="#c9a227" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Titles table */}
        <div className="xl:col-span-2" style={cardStyle}>
          <h3
            className="text-base font-bold mb-4"
            style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#e0c060' }}
          >
            Top Titles
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(61,96,128,0.20)' }}>
                {['Title', 'Units Sold', 'Revenue', 'Royalties'].map(h => (
                  <th
                    key={h}
                    className="pb-3 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'rgba(90,127,160,0.65)', letterSpacing: '0.06em', fontFamily: 'Inter, sans-serif' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.topTitles.map((t, i) => (
                <tr
                  key={t.titleId}
                  className="transition-colors duration-100"
                  style={{ borderBottom: '1px solid rgba(61,96,128,0.10)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="py-3 font-semibold" style={{ color: '#c5d8e8', fontFamily: '"Playfair Display", Georgia, serif' }}>
                    <span
                      className="mr-2 text-xs font-bold"
                      style={{ color: 'rgba(212,175,55,0.55)', fontFamily: '"Source Code Pro", monospace' }}
                    >
                      #{i + 1}
                    </span>
                    {t.title}
                  </td>
                  <td className="py-3" style={{ color: 'rgba(138,175,200,0.80)', fontFamily: '"Source Code Pro", monospace' }}>
                    {t.units.toLocaleString()}
                  </td>
                  <td className="py-3" style={{ color: '#d4af37', fontFamily: '"Source Code Pro", monospace' }}>
                    ${t.revenue.toLocaleString()}
                  </td>
                  <td className="py-3 font-bold" style={{ color: '#34d399', fontFamily: '"Source Code Pro", monospace' }}>
                    ${t.royalties.toLocaleString()}
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
