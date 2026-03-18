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
  PlusIcon, ArrowUpTrayIcon, BoltIcon, SparklesIcon,
  PaintBrushIcon, ChartBarIcon,
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── Activity type styling ── */
const activityTypeStyle: Record<string, { bg: string; border: string; emoji: string; color: string }> = {
  distribution_live: {
    bg: 'rgba(26,45,78,0.70)',
    border: 'rgba(61,96,128,0.30)',
    emoji: '🌐',
    color: '#8aafc8',
  },
  sales_milestone: {
    bg: 'rgba(212,175,55,0.10)',
    border: 'rgba(212,175,55,0.25)',
    emoji: '🏆',
    color: '#d4af37',
  },
  format_complete: {
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.20)',
    emoji: '📄',
    color: '#34d399',
  },
  payout_sent: {
    bg: 'rgba(212,175,55,0.10)',
    border: 'rgba(212,175,55,0.22)',
    emoji: '💰',
    color: '#edc74a',
  },
  review_received: {
    bg: 'rgba(196,168,130,0.10)',
    border: 'rgba(196,168,130,0.22)',
    emoji: '⭐',
    color: '#c4a882',
  },
};

/* ── Quick action cards data ── */
const quickActions = [
  {
    icon: PlusIcon,
    label: 'New Title',
    desc: 'Start a new book project',
    to: '/titles/new',
    accentColor: '#d4af37',
    bg: 'rgba(212,175,55,0.10)',
    border: 'rgba(212,175,55,0.22)',
  },
  {
    icon: ArrowUpTrayIcon,
    label: 'Upload Manuscript',
    desc: 'Import your writing',
    to: '/titles/new',
    accentColor: '#8aafc8',
    bg: 'rgba(61,96,128,0.12)',
    border: 'rgba(61,96,128,0.28)',
  },
  {
    icon: PaintBrushIcon,
    label: 'Design Cover',
    desc: 'Create a professional cover',
    to: '/titles',
    accentColor: '#c4a882',
    bg: 'rgba(196,168,130,0.08)',
    border: 'rgba(196,168,130,0.20)',
  },
  {
    icon: ChartBarIcon,
    label: 'Check Analytics',
    desc: 'View sales & royalties',
    to: '/analytics',
    accentColor: '#34d399',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.20)',
  },
];

/* ── Custom recharts tooltip ── */
const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3.5 py-3 rounded-xl text-sm"
      style={{
        background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
        border: '1px solid rgba(212,175,55,0.25)',
        boxShadow: '0 8px 32px rgba(5,13,26,0.55)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(138,175,200,0.70)' }}>
        {format(parseISO(label as string), 'MMM d, yyyy')}
      </p>
      <p className="font-bold text-base" style={{ color: '#d4af37' }}>
        ${(payload[0].value as number).toFixed(2)}
      </p>
    </div>
  );
};

/* ── Publishing Journey progress ── */
const JourneyStep = ({
  step, label, done,
}: { step: number; label: string; done: boolean }) => (
  <div className="flex items-center gap-2">
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{
        background: done
          ? 'linear-gradient(135deg, #c9a227 0%, #d4af37 100%)'
          : 'rgba(26,45,78,0.80)',
        border: done ? 'none' : '1px solid rgba(61,96,128,0.35)',
        color: done ? '#0a1628' : 'rgba(90,127,160,0.55)',
        boxShadow: done ? '0 0 8px rgba(212,175,55,0.30)' : 'none',
      }}
    >
      {done ? '✓' : step}
    </div>
    <span
      className="text-xs font-medium"
      style={{ color: done ? '#c5d8e8' : 'rgba(90,127,160,0.55)' }}
    >
      {label}
    </span>
  </div>
);

/* ═══════════════════════════════════ Component ═══════════════════════════════════ */
export const DashboardPage = () => {
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user }  = useAuth();

  useEffect(() => {
    const t = setTimeout(() => {
      setStats(MOCK_DASHBOARD_STATS);
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  /* Loading skeleton */
  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="space-y-5 animate-pulse">
          <div className="h-20 rounded-2xl skeleton" />
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl skeleton" />)}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl skeleton" />)}
          </div>
          <div className="grid xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 h-64 rounded-2xl skeleton" />
            <div className="h-64 rounded-2xl skeleton" />
          </div>
          <div className="h-52 rounded-2xl skeleton" />
        </div>
      </Layout>
    );
  }

  const s = stats!;

  return (
    <Layout title="Dashboard" breadcrumbs={[{ label: 'Dashboard' }]}>

      {/* ══════════ Welcome Banner ══════════ */}
      <div
        className="relative rounded-2xl px-6 py-5 mb-5 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f2040 0%, #1a2d4e 50%, #0f2040 100%)',
          border: '1px solid rgba(212,175,55,0.20)',
          boxShadow: '0 2px 16px rgba(5,13,26,0.40)',
        }}
      >
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 80% at 5% 50%, rgba(212,175,55,0.07) 0%, transparent 60%)',
          }}
        />
        {/* Top gold line */}
        <div
          className="absolute top-0 left-6 right-6 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.45), transparent)' }}
        />

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)' }}
            >
              <BoltIcon className="w-5 h-5" style={{ color: '#d4af37' }} />
            </div>
            <div>
              <h2
                className="text-lg font-bold text-white leading-tight"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(138,175,200,0.65)' }}>
                Your publishing hub is ready. Continue where you left off.
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button onClick={() => navigate('/titles/new')} className="btn-gold">
              <PlusIcon className="w-4 h-4" />
              New Title
            </button>
            <button className="btn-ghost">
              <ArrowUpTrayIcon className="w-4 h-4" />
              Import
            </button>
          </div>
        </div>
      </div>

      {/* ══════════ Stat Cards ══════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard
          title="Total Titles"
          value={s.totalTitles}
          subtitle={`${s.activeTitles} active`}
          icon={<BookOpenIcon className="w-5 h-5" />}
          color="navy"
          trend={{ value: 25, label: 'vs last quarter' }}
        />
        <StatCard
          title="All-Time Revenue"
          value={`$${s.allTimeRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<CurrencyDollarIcon className="w-5 h-5" />}
          color="gold"
          trend={{ value: 18.4, label: 'vs last year' }}
        />
        <StatCard
          title="Total Royalties"
          value={`$${s.totalRoyalties.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<TrophyIcon className="w-5 h-5" />}
          color="green"
          trend={{ value: 12.1, label: 'vs last year' }}
        />
        <StatCard
          title="Active Channels"
          value={s.activeChannels}
          subtitle="Across all titles"
          icon={<GlobeAltIcon className="w-5 h-5" />}
          color="tan"
          trend={{ value: 8.3, label: 'vs last month' }}
        />
      </div>

      {/* ══════════ Quick Actions ══════════ */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        {quickActions.map(action => (
          <button
            key={action.label}
            onClick={() => navigate(action.to)}
            className="rounded-xl p-4 text-left transition-all duration-200 group"
            style={{
              background: action.bg,
              border: `1px solid ${action.border}`,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(5,13,26,0.40)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 transition-transform duration-200 group-hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${action.border}` }}
            >
              <action.icon className="w-4 h-4" style={{ color: action.accentColor }} />
            </div>
            <p className="text-sm font-semibold text-white leading-tight">{action.label}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(138,175,200,0.55)' }}>{action.desc}</p>
          </button>
        ))}
      </div>

      {/* ══════════ Revenue Chart + Activity ══════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">

        {/* Revenue chart */}
        <div
          className="xl:col-span-2 rounded-2xl p-5 xl:p-6"
          style={{
            background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
            border: '1px solid rgba(61,96,128,0.22)',
            boxShadow: '0 1px 3px rgba(5,13,26,0.35), 0 4px 16px rgba(5,13,26,0.20)',
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2
                className="text-base font-bold text-white leading-tight"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                Revenue
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(90,127,160,0.65)' }}>
                Last 30 days · All titles
              </p>
            </div>
            <div
              className="px-2.5 py-1 rounded-lg text-xs font-semibold"
              style={{ background: 'rgba(52,211,153,0.10)', color: '#34d399', border: '1px solid rgba(52,211,153,0.20)' }}
            >
              ▲ +18.4%
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={s.salesLast30Days.slice(-30)}
              margin={{ top: 5, right: 8, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#d4af37" stopOpacity={0.30} />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(61,96,128,0.15)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={d => format(parseISO(d), 'MMM d')}
                tick={{ fontSize: 10, fill: 'rgba(90,127,160,0.55)', fontFamily: 'Inter, sans-serif' }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(90,127,160,0.55)', fontFamily: 'Inter, sans-serif' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `$${v}`}
              />
              <Tooltip content={<RevenueTooltip />} cursor={{ stroke: 'rgba(212,175,55,0.15)', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#d4af37"
                strokeWidth={2}
                fill="url(#goldAreaGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#d4af37', stroke: '#0f2040', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Activity feed */}
        <div
          className="rounded-2xl p-5 xl:p-6 flex flex-col"
          style={{
            background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
            border: '1px solid rgba(61,96,128,0.22)',
            boxShadow: '0 1px 3px rgba(5,13,26,0.35), 0 4px 16px rgba(5,13,26,0.20)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-base font-bold text-white"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Recent Activity
            </h2>
            <SparklesIcon className="w-4 h-4" style={{ color: 'rgba(212,175,55,0.50)' }} />
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {s.recentActivity.map((event, idx) => {
              const t = activityTypeStyle[event.type] || activityTypeStyle.distribution_live;
              return (
                <div key={event.id} className="flex gap-3">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{ background: t.bg, border: `1px solid ${t.border}` }}
                    >
                      {t.emoji}
                    </div>
                    {idx < s.recentActivity.length - 1 && (
                      <div
                        className="w-px flex-1 mt-1.5"
                        style={{ background: 'rgba(61,96,128,0.18)', minHeight: '12px' }}
                      />
                    )}
                  </div>
                  <div className="min-w-0 pb-2">
                    <p className="text-xs font-semibold text-white truncate leading-tight">
                      {event.title}
                    </p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(138,175,200,0.60)' }}>
                      {event.description}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(90,127,160,0.45)', fontFamily: '"Source Code Pro", monospace', fontSize: '0.65rem' }}>
                      {format(new Date(event.timestamp), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════ Publishing Journey ══════════ */}
      <div className="grid xl:grid-cols-3 gap-5 mb-5">
        <div
          className="rounded-2xl p-5 xl:p-6"
          style={{
            background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
            border: '1px solid rgba(212,175,55,0.16)',
            boxShadow: '0 1px 3px rgba(5,13,26,0.35)',
          }}
        >
          {/* Gold top rule */}
          <div
            className="absolute top-0 left-6 right-6 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.40), transparent)' }}
          />
          <h2
            className="text-base font-bold text-white mb-1"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Publishing Journey
          </h2>
          <p className="text-xs mb-4" style={{ color: 'rgba(90,127,160,0.65)' }}>
            Your progress as an author
          </p>

          {/* Progress bar */}
          <div
            className="w-full h-2 rounded-full mb-4"
            style={{ background: 'rgba(26,45,78,0.80)', border: '1px solid rgba(61,96,128,0.20)' }}
          >
            <div
              className="h-2 rounded-full"
              style={{
                width: '75%',
                background: 'linear-gradient(90deg, #c9a227 0%, #edc74a 50%, #d4af37 100%)',
                boxShadow: '0 0 8px rgba(212,175,55,0.30)',
              }}
            />
          </div>

          <div className="space-y-2.5">
            <JourneyStep step={1} label="Account Created" done={true} />
            <JourneyStep step={2} label="First Title Added" done={true} />
            <JourneyStep step={3} label="Formatting Complete" done={true} />
            <JourneyStep step={4} label="First Distribution Live" done={true} />
            <JourneyStep step={5} label="First Sale" done={false} />
            <JourneyStep step={6} label="Publisher Status" done={false} />
          </div>
        </div>

        {/* Publishing Readiness spans 2 cols */}
        <div
          className="xl:col-span-2 rounded-2xl p-5 xl:p-6"
          style={{
            background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
            border: '1px solid rgba(61,96,128,0.22)',
            boxShadow: '0 1px 3px rgba(5,13,26,0.35), 0 4px 16px rgba(5,13,26,0.20)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                className="text-base font-bold text-white"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                Publishing Readiness
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(90,127,160,0.60)' }}>
                Titles at a glance
              </p>
            </div>
            <button
              className="text-xs font-semibold transition-colors"
              style={{ color: '#c9a227' }}
              onClick={() => navigate('/titles')}
              onMouseEnter={e => (e.currentTarget.style.color = '#edc74a')}
              onMouseLeave={e => (e.currentTarget.style.color = '#c9a227')}
            >
              View all →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(61,96,128,0.18)' }}>
                  {['Title', 'Status', 'Readiness', 'Channels', ''].map(h => (
                    <th
                      key={h}
                      className="text-left pb-3 pr-4 text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'rgba(90,127,160,0.55)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.titleReadiness.map(t => (
                  <tr
                    key={t.id}
                    className="cursor-pointer transition-all duration-100"
                    style={{ borderBottom: '1px solid rgba(61,96,128,0.10)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(61,96,128,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => navigate(`/titles/${t.id}`)}
                  >
                    <td className="py-3 pr-4 max-w-[160px]">
                      <span
                        className="font-semibold text-sm truncate block transition-colors"
                        style={{ color: '#c5d8e8' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#d4af37')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#c5d8e8')}
                      >
                        {t.title}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3 pr-6">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex-1 rounded-full h-1.5 w-24"
                          style={{ background: 'rgba(26,45,78,0.80)', minWidth: '5rem' }}
                        >
                          <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${t.readinessScore}%`,
                              background:
                                t.readinessScore >= 80
                                  ? 'linear-gradient(90deg, #059669, #34d399)'
                                  : t.readinessScore >= 60
                                  ? 'linear-gradient(90deg, #c9a227, #edc74a)'
                                  : 'linear-gradient(90deg, #dc2626, #f87171)',
                              boxShadow:
                                t.readinessScore >= 80
                                  ? '0 0 6px rgba(52,211,153,0.35)'
                                  : t.readinessScore >= 60
                                  ? '0 0 6px rgba(212,175,55,0.30)'
                                  : '0 0 6px rgba(248,113,113,0.30)',
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-bold w-8 text-right"
                          style={{
                            color:
                              t.readinessScore >= 80 ? '#34d399'
                              : t.readinessScore >= 60 ? '#d4af37'
                              : '#f87171',
                            fontFamily: '"Source Code Pro", monospace',
                          }}
                        >
                          {t.readinessScore}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-xs" style={{ color: 'rgba(138,175,200,0.65)' }}>
                      {t.channels} live
                    </td>
                    <td className="py-3">
                      <span
                        className="text-xs font-semibold transition-colors"
                        style={{ color: '#c9a227' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#edc74a')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#c9a227')}
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
      </div>

    </Layout>
  );
};
