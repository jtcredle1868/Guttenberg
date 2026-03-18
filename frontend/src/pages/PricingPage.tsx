import React, { useState, useMemo } from 'react';
import { Layout } from '../components/layout/Layout';
import {
  CurrencyDollarIcon,
  BookOpenIcon,
  CalculatorIcon,
  ChartBarIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import clsx from 'clsx';
import type { ChannelRoyalty } from '../api/types';
import { MOCK_TITLES } from '../mockData';

/* ── Static data ───────────────────────────────────────────────────────────── */
const TRIM_SIZES = ['5×8', '5.5×8.5', '6×9', '7×10', '8.5×11'];
const PAPER_TYPES = ['Standard White (60#)', 'Cream (60#)', 'Premium White (90#)'];
const PRINT_RUNS = [100, 250, 500, 1000, 2500];

const GENRE_PRICES: Record<string, { min: number; max: number; avg: number }> = {
  'Science Fiction':     { min: 2.99, max: 9.99,  avg: 5.99  },
  'Business & Technology':{ min: 9.99, max: 29.99, avg: 14.99 },
  'Business':            { min: 9.99, max: 24.99, avg: 12.99 },
  'Thriller':            { min: 2.99, max: 9.99,  avg: 5.49  },
  'Food & Lifestyle':    { min: 14.99,max: 39.99, avg: 24.99 },
  'default':             { min: 2.99, max: 14.99, avg: 7.99  },
};

const PRINT_COST_PER_PAGE = 0.013;
const PRINT_SETUP = 1.75;

/* ── Royalty calculations ──────────────────────────────────────────────────── */
function calcRoyalties(price: number, formats: Set<string>, pageCount: number): ChannelRoyalty[] {
  const deliveryFeePerMB = 0.15;
  const fileSizeMB = 2;
  const results: ChannelRoyalty[] = [];

  if (formats.has('ebook')) {
    const kdpRate = price >= 2.99 && price <= 9.99 ? 0.70 : 0.35;
    const kdpDelivery = kdpRate === 0.70 ? deliveryFeePerMB * fileSizeMB : 0;
    const kdpAmount = price * kdpRate;
    const kdpNet = kdpAmount - kdpDelivery;
    results.push({ channel: 'amazon-kdp', displayName: 'Amazon KDP', royaltyRate: kdpRate, royaltyAmount: kdpAmount, deliveryFee: kdpDelivery, net: kdpNet });

    const isRate = 0.45;
    const isAmount = price * isRate;
    results.push({ channel: 'ingram-spark-ebook', displayName: 'IngramSpark (eBook)', royaltyRate: isRate, royaltyAmount: isAmount, net: isAmount });

    results.push({ channel: 'apple-books', displayName: 'Apple Books', royaltyRate: 0.70, royaltyAmount: price * 0.70, net: price * 0.70 });

    const koboRate = price >= 1.99 ? 0.70 : 0.45;
    const koboAmount = price * koboRate;
    results.push({ channel: 'kobo', displayName: 'Kobo', royaltyRate: koboRate, royaltyAmount: koboAmount, net: koboAmount });

    const bnAmount = price * 0.65;
    results.push({ channel: 'bn-ebook', displayName: 'Barnes & Noble', royaltyRate: 0.65, royaltyAmount: bnAmount, net: bnAmount });
  }

  if (formats.has('paperback')) {
    const printCost = PRINT_SETUP + pageCount * PRINT_COST_PER_PAGE;
    const isPrintRoyalty = price * 0.40 - printCost;
    results.push({ channel: 'ingram-spark-print', displayName: 'IngramSpark (Print)', royaltyRate: 0.40, royaltyAmount: price * 0.40, net: Math.max(0, isPrintRoyalty) });
    const bnPrintRoyalty = price * 0.55 - printCost;
    results.push({ channel: 'bn-print', displayName: 'B&N (Print)', royaltyRate: 0.55, royaltyAmount: price * 0.55, net: Math.max(0, bnPrintRoyalty) });
  }

  return results;
}

/* ── Inline styles ─────────────────────────────────────────────────────────── */
const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(26,45,78,0.80) 0%, rgba(15,32,64,0.80) 100%)',
  border: '1px solid rgba(61,96,128,0.25)',
  borderRadius: '1rem',
  backdropFilter: 'blur(8px)',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'linear-gradient(145deg, #1a2d4e, #0f2040)',
      border: '1px solid rgba(212,175,55,0.25)',
      borderRadius: '0.75rem',
      padding: '0.75rem 1rem',
      boxShadow: '0 8px 32px rgba(5,13,26,0.6)',
    }}>
      <p style={{ color: '#8aafc8', fontSize: '0.7rem', marginBottom: 4 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: '#d4af37', fontWeight: 700, fontSize: '0.875rem' }}>
          ${typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
};

const BAR_COLORS = ['#d4af37', '#c4a882', '#8aafc8', '#eacf7a', '#60a5fa', '#4ade80', '#f97316'];

const FORMATS_CONFIG = [
  { id: 'ebook',     label: 'eBook',     color: '#60a5fa' },
  { id: 'paperback', label: 'Paperback', color: '#d4af37' },
  { id: 'hardcover', label: 'Hardcover', color: '#c4a882' },
  { id: 'audiobook', label: 'Audiobook', color: '#a78bfa' },
];

/* ── Main page ─────────────────────────────────────────────────────────────── */
export const PricingPage = () => {
  const [selectedTitle, setSelectedTitle] = useState(MOCK_TITLES[0]);
  const [listPrice, setListPrice]         = useState(9.99);
  const [formats, setFormats]             = useState<Set<string>>(new Set(['ebook']));
  const [pageCount, setPageCount]         = useState(selectedTitle.pageCount ?? 300);
  const [trimSize, setTrimSize]           = useState(TRIM_SIZES[2]);
  const [paperType, setPaperType]         = useState(PAPER_TYPES[0]);
  const [printRun, setPrintRun]           = useState(500);

  const channelRoyalties = useMemo(
    () => calcRoyalties(listPrice, formats, pageCount),
    [listPrice, formats, pageCount]
  );

  const avgNet = channelRoyalties.length > 0
    ? channelRoyalties.reduce((s, r) => s + r.net, 0) / channelRoyalties.length
    : 0;

  const printCost = formats.has('paperback') ? PRINT_SETUP + pageCount * PRINT_COST_PER_PAGE : 0;
  const breakEvenUnits = avgNet > 0 ? Math.ceil(500 / avgNet) : 0;

  const recommendedPrice = (() => {
    if (formats.has('ebook')) return 7.99;
    if (formats.has('paperback')) return Math.max(printCost * 2.5, 14.99);
    return 9.99;
  })();

  const genre = selectedTitle.genre ?? 'default';
  const compRange = GENRE_PRICES[genre] ?? GENRE_PRICES['default'];

  const toggleFormat = (id: string) => {
    setFormats(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const chartData = channelRoyalties.map(r => ({
    name: r.displayName.replace('IngramSpark', 'Ingram').replace('Barnes & Noble', 'B&N'),
    net: Math.max(0, r.net),
  }));

  return (
    <Layout title="Pricing Calculator" breadcrumbs={[{ label: 'Creative Tools' }, { label: 'Pricing Calculator' }]}>
      <div className="space-y-5">

        <div>
          <h1 className="text-2xl font-bold text-gold-400 font-playfair">Pricing Calculator</h1>
          <p className="text-navy-200 text-sm mt-1">Maximize your royalties across all channels</p>
        </div>

        {/* Book selector */}
        <div style={cardStyle} className="p-4 flex flex-wrap items-center gap-4">
          <BookOpenIcon className="w-5 h-5 text-gold-400 shrink-0" />
          <label className="text-navy-200 text-sm font-medium shrink-0">Select Title:</label>
          <select
            value={selectedTitle.id}
            onChange={e => {
              const t = MOCK_TITLES.find(t => t.id === e.target.value) ?? MOCK_TITLES[0];
              setSelectedTitle(t);
              setPageCount(t.pageCount ?? 300);
            }}
            className="bg-navy-800/60 border border-navy-500 text-white focus:border-gold-500 rounded-xl px-4 py-2 text-sm outline-none flex-1 max-w-sm"
          >
            {MOCK_TITLES.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
          {selectedTitle.genre && (
            <span className="text-navy-300 text-xs px-2 py-0.5 rounded-lg bg-navy-700/60 border border-navy-600">{selectedTitle.genre}</span>
          )}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-5">

          {/* Left: inputs */}
          <div className="space-y-5">

            {/* Price + format toggles */}
            <div style={cardStyle} className="p-5 space-y-5">
              <h2 className="text-gold-400 font-semibold text-sm flex items-center gap-2">
                <CalculatorIcon className="w-4 h-4" /> Pricing Inputs
              </h2>

              {/* List price slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-navy-200 text-sm font-medium">List Price</label>
                  <span className="text-gold-400 font-bold text-xl">${listPrice.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.99}
                  max={49.99}
                  step={0.5}
                  value={listPrice}
                  onChange={e => setListPrice(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-yellow-400"
                  style={{
                    background: `linear-gradient(to right, #c9a227 0%, #c9a227 ${((listPrice - 0.99) / 49) * 100}%, rgba(61,96,128,0.4) ${((listPrice - 0.99) / 49) * 100}%, rgba(61,96,128,0.4) 100%)`,
                  }}
                />
                <div className="flex justify-between text-navy-400 text-xs">
                  <span>$0.99</span>
                  <span className={clsx('text-xs', listPrice >= 2.99 && listPrice <= 9.99 ? 'text-emerald-400' : 'text-tan-400')}>
                    {listPrice >= 2.99 && listPrice <= 9.99 ? '✓ 70% KDP tier' : listPrice < 2.99 ? '35% KDP tier' : '35% KDP tier (above $9.99)'}
                  </span>
                  <span>$49.99</span>
                </div>
              </div>

              {/* Format toggles */}
              <div className="space-y-2">
                <label className="text-navy-200 text-sm font-medium">Formats</label>
                <div className="flex flex-wrap gap-2">
                  {FORMATS_CONFIG.map(f => (
                    <button
                      key={f.id}
                      onClick={() => toggleFormat(f.id)}
                      className={clsx(
                        'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                        formats.has(f.id)
                          ? 'bg-opacity-10 border-opacity-60'
                          : 'border-navy-600 bg-navy-800/40 text-navy-300 hover:border-navy-500'
                      )}
                      style={formats.has(f.id) ? { borderColor: f.color + '99', background: f.color + '18', color: f.color } : {}}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Print settings */}
              {(formats.has('paperback') || formats.has('hardcover')) && (
                <div className="space-y-4 border-t border-navy-600 pt-4">
                  <label className="text-navy-200 text-sm font-medium">Print Settings</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-navy-300 text-xs">Page Count</label>
                      <input
                        type="number"
                        min={50}
                        max={800}
                        value={pageCount}
                        onChange={e => setPageCount(Number(e.target.value))}
                        className="w-full bg-navy-800/60 border border-navy-500 text-white focus:border-gold-500 rounded-xl px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-navy-300 text-xs">Trim Size</label>
                      <select
                        value={trimSize}
                        onChange={e => setTrimSize(e.target.value)}
                        className="w-full bg-navy-800/60 border border-navy-500 text-white focus:border-gold-500 rounded-xl px-3 py-2 text-sm outline-none"
                      >
                        {TRIM_SIZES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-navy-300 text-xs">Paper Type</label>
                      <select
                        value={paperType}
                        onChange={e => setPaperType(e.target.value)}
                        className="w-full bg-navy-800/60 border border-navy-500 text-white focus:border-gold-500 rounded-xl px-3 py-2 text-sm outline-none"
                      >
                        {PAPER_TYPES.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-navy-300 text-xs">Print Run</label>
                      <select
                        value={printRun}
                        onChange={e => setPrintRun(Number(e.target.value))}
                        className="w-full bg-navy-800/60 border border-navy-500 text-white focus:border-gold-500 rounded-xl px-3 py-2 text-sm outline-none"
                      >
                        {PRINT_RUNS.map(pr => <option key={pr} value={pr}>{pr.toLocaleString()} copies</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Royalty breakdown table */}
            <div style={cardStyle} className="p-5">
              <h2 className="text-gold-400 font-semibold text-sm mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-4 h-4" /> Royalty Breakdown by Channel
              </h2>
              {channelRoyalties.length === 0 ? (
                <p className="text-navy-400 text-sm text-center py-4">Select at least one format above.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-navy-600/60">
                        <th className="text-left text-navy-300 font-medium py-2 pr-4">Channel</th>
                        <th className="text-right text-navy-300 font-medium py-2 pr-4">Rate</th>
                        <th className="text-right text-navy-300 font-medium py-2 pr-4">Royalty</th>
                        <th className="text-right text-navy-300 font-medium py-2 pr-4">Fees</th>
                        <th className="text-right text-navy-300 font-medium py-2">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channelRoyalties.map(r => (
                        <tr key={r.channel} className="border-b border-navy-700/40 hover:bg-navy-700/20 transition-colors">
                          <td className="text-navy-100 py-2.5 pr-4 font-medium">{r.displayName}</td>
                          <td className="text-right text-navy-200 py-2.5 pr-4">{(r.royaltyRate * 100).toFixed(0)}%</td>
                          <td className="text-right text-navy-200 py-2.5 pr-4">${r.royaltyAmount.toFixed(2)}</td>
                          <td className="text-right text-navy-400 py-2.5 pr-4 text-xs">
                            {r.deliveryFee ? `-$${r.deliveryFee.toFixed(2)}` : '—'}
                          </td>
                          <td className={clsx('text-right py-2.5 font-bold', r.net > 0 ? 'text-gold-400' : 'text-red-400')}>
                            ${Math.max(0, r.net).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bar chart */}
            {chartData.length > 0 && (
              <div style={cardStyle} className="p-5">
                <h2 className="text-gold-400 font-semibold text-sm mb-4">Net Royalty by Channel</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,96,128,0.2)" />
                    <XAxis dataKey="name" tick={{ fill: '#8aafc8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8aafc8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v.toFixed(0)}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="net" radius={[6, 6, 0, 0]}>
                      {chartData.map((_, index) => (
                        <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Right: analysis cards */}
          <div className="space-y-4">

            {/* Recommended price */}
            <div
              className="p-5 rounded-2xl border"
              style={{
                background: 'linear-gradient(135deg, rgba(201,162,39,0.12) 0%, rgba(212,175,55,0.06) 100%)',
                borderColor: 'rgba(201,162,39,0.35)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <CurrencyDollarIcon className="w-5 h-5 text-gold-400" />
                <h3 className="text-gold-400 font-semibold text-sm">Recommended Price</h3>
              </div>
              <p className="text-gold-300 font-bold text-4xl font-playfair">${recommendedPrice.toFixed(2)}</p>
              <p className="text-navy-200 text-xs mt-1">
                {formats.has('ebook') ? 'Qualifies for 70% KDP royalty tier' : 'Based on print cost + target margin'}
              </p>
              <button
                onClick={() => setListPrice(recommendedPrice)}
                className="mt-3 text-xs font-medium text-gold-400 border border-gold-500/40 rounded-lg px-3 py-1.5 hover:bg-gold-600/10 transition-all"
              >
                Apply This Price
              </button>
            </div>

            {/* Break-even analysis */}
            <div style={cardStyle} className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <CalculatorIcon className="w-4 h-4 text-gold-400" />
                <h3 className="text-gold-400 font-semibold text-sm">Break-Even Analysis</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-navy-400 text-xs">Assumed Production Cost</p>
                  <p className="text-navy-100 font-semibold">$500.00</p>
                </div>
                <div>
                  <p className="text-navy-400 text-xs">Average Net per Sale</p>
                  <p className="text-navy-100 font-semibold">${avgNet.toFixed(2)}</p>
                </div>
                <div className="border-t border-navy-600 pt-3">
                  <p className="text-navy-300 text-xs mb-1">Units to Break Even</p>
                  <p className="text-gold-400 font-bold text-2xl">{breakEvenUnits > 0 ? breakEvenUnits.toLocaleString() : '—'}</p>
                  <p className="text-navy-400 text-xs mt-0.5">copies at ${listPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Print cost */}
            {formats.has('paperback') && (
              <div style={cardStyle} className="p-5">
                <h3 className="text-gold-400 font-semibold text-sm mb-3">Print Cost Estimate</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-300">Setup</span>
                    <span className="text-navy-100">${PRINT_SETUP.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-300">Per page × {pageCount}</span>
                    <span className="text-navy-100">${(pageCount * PRINT_COST_PER_PAGE).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-navy-600 pt-2 flex justify-between font-semibold">
                    <span className="text-navy-200">Total per copy</span>
                    <span className="text-gold-400">${printCost.toFixed(2)}</span>
                  </div>
                  {listPrice > 0 && (
                    <p className={clsx('text-xs', listPrice * 0.40 > printCost ? 'text-emerald-400' : 'text-red-400')}>
                      {listPrice * 0.40 > printCost
                        ? `✓ Profitable at $${listPrice.toFixed(2)} (IngramSpark 40%)`
                        : `✗ Loss at $${listPrice.toFixed(2)} — raise price to $${(printCost / 0.40).toFixed(2)}+`}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Competitive analysis */}
            <div style={cardStyle} className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <InformationCircleIcon className="w-4 h-4 text-gold-400" />
                <h3 className="text-gold-400 font-semibold text-sm">Competitive Analysis</h3>
              </div>
              <p className="text-navy-300 text-xs mb-3">Average prices for <span className="text-tan-400">{genre}</span></p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-navy-300">Market Range</span>
                  <span className="text-navy-100">${compRange.min} – ${compRange.max}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-navy-300">Average Price</span>
                  <span className="text-navy-100">${compRange.avg.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-navy-400 mb-1">
                  <span>${compRange.min}</span>
                  <span>Your: ${listPrice.toFixed(2)}</span>
                  <span>${compRange.max}</span>
                </div>
                <div className="relative h-3 bg-navy-700/60 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-tan-400 opacity-60"
                    style={{ left: `${Math.min(100, Math.max(0, ((compRange.avg - compRange.min) / (compRange.max - compRange.min)) * 100))}%` }}
                  />
                  <div
                    className="absolute top-0.5 w-3 h-2 rounded-full bg-gold-400"
                    style={{
                      left: `${Math.min(97, Math.max(0, ((listPrice - compRange.min) / (compRange.max - compRange.min)) * 100))}%`,
                      transform: 'translateX(-50%)',
                    }}
                  />
                </div>
                <p className="text-xs text-navy-400 mt-1">
                  {listPrice < compRange.min
                    ? 'Below market — consider raising price'
                    : listPrice > compRange.max
                    ? 'Above market — verify value proposition'
                    : 'Within competitive range'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
