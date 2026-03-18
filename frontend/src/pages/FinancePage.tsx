import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { RoyaltyCalculator } from '../components/ui/RoyaltyCalculator';
import { DataTable, Column } from '../components/ui/DataTable';
import { MOCK_DISBURSEMENTS, MOCK_SALES } from '../mockData';
import { Disbursement, SalesRecord } from '../api/types';

const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
  border: '1px solid rgba(61,96,128,0.22)',
  boxShadow: '0 1px 3px rgba(5,13,26,0.35)',
  borderRadius: '1rem',
  padding: '1.5rem',
};

export const FinancePage = () => {
  const [disbursements] = useState<Disbursement[]>(MOCK_DISBURSEMENTS);
  const [sales]         = useState<SalesRecord[]>(MOCK_SALES);

  const earnings = {
    thisMonth: 2847.32,
    lastMonth: 3102.18,
    ytd:       18654.90,
    allTime:   48732.50,
  };

  const disbCols: Column<Record<string, unknown>>[] = [
    { key: 'period',  header: 'Period',  sortable: true },
    {
      key: 'amount', header: 'Amount', sortable: true,
      render: r => (
        <span style={{ color: '#34d399', fontWeight: 700, fontFamily: '"Source Code Pro", monospace' }}>
          ${(r.amount as number).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    { key: 'method', header: 'Method' },
    {
      key: 'status', header: 'Status',
      render: r => (
        <span
          className="text-xs px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1"
          style={
            r.status === 'paid'
              ? { background: 'rgba(52,211,153,0.10)', color: '#34d399', border: '1px solid rgba(52,211,153,0.22)' }
              : { background: 'rgba(212,175,55,0.10)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.22)' }
          }
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.status === 'paid' ? '#34d399' : '#d4af37' }} />
          {r.status as string}
        </span>
      ),
    },
    {
      key: 'paidAt', header: 'Paid On',
      render: r => <span style={{ color: 'rgba(138,175,200,0.60)', fontFamily: '"Source Code Pro", monospace' }}>{r.paidAt as string || '—'}</span>,
    },
  ];

  const salesCols: Column<Record<string, unknown>>[] = [
    { key: 'titleName',   header: 'Title',   sortable: true },
    { key: 'channelName', header: 'Channel', sortable: true },
    {
      key: 'formatType', header: 'Format',
      render: r => <span className="capitalize" style={{ color: 'rgba(196,168,130,0.80)' }}>{r.formatType as string}</span>,
    },
    {
      key: 'units', header: 'Units', sortable: true,
      render: r => <span style={{ fontFamily: '"Source Code Pro", monospace' }}>{r.units as number}</span>,
    },
    {
      key: 'revenue', header: 'Revenue', sortable: true,
      render: r => <span style={{ color: '#d4af37', fontFamily: '"Source Code Pro", monospace' }}>${(r.revenue as number).toFixed(2)}</span>,
    },
    {
      key: 'royalties', header: 'Royalties', sortable: true,
      render: r => (
        <span style={{ color: '#34d399', fontWeight: 700, fontFamily: '"Source Code Pro", monospace' }}>
          ${(r.royalties as number).toFixed(2)}
        </span>
      ),
    },
  ];

  const earningsCards = [
    { label: 'This Month', value: `$${earnings.thisMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, trend: '-8.2% vs last month', positive: false },
    { label: 'Last Month', value: `$${earnings.lastMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, trend: '', positive: null },
    { label: 'Year to Date', value: `$${earnings.ytd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, trend: '+24.6% vs last year', positive: true },
    { label: 'All-Time', value: `$${earnings.allTime.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, trend: '', positive: null },
  ];

  const formatRevenue = [
    { format: 'E-book',      revenue: 28450, units: 4200, pct: 58 },
    { format: 'Print (POD)', revenue: 14870, units: 890,  pct: 31 },
    { format: 'Audiobook',   revenue: 5410,  units: 210,  pct: 11 },
  ];

  return (
    <Layout title="Finance" breadcrumbs={[{ label: 'Finance' }]}>

      {/* Earnings Summary */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {earningsCards.map(c => (
          <div key={c.label} style={cardStyle}>
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: 'rgba(90,127,160,0.65)', letterSpacing: '0.06em', fontFamily: 'Inter, sans-serif' }}
            >
              {c.label}
            </p>
            <p
              className="text-2xl font-bold mt-1"
              style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#e8f1f8' }}
            >
              {c.value}
            </p>
            {c.trend && (
              <p
                className="text-xs font-semibold mt-1"
                style={{ color: c.positive ? '#34d399' : '#f87171' }}
              >
                {c.trend}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <div className="xl:col-span-1">
          <RoyaltyCalculator />
        </div>

        {/* Revenue by format */}
        <div className="xl:col-span-2" style={cardStyle}>
          <h3
            className="text-base font-bold text-white mb-5"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Revenue by Format
          </h3>
          <div className="space-y-5">
            {formatRevenue.map(r => (
              <div key={r.format}>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="font-semibold" style={{ color: '#c5d8e8' }}>{r.format}</span>
                  <div className="flex gap-4">
                    <span style={{ color: 'rgba(138,175,200,0.65)', fontFamily: '"Source Code Pro", monospace', fontSize: '0.75rem' }}>
                      {r.units.toLocaleString()} units
                    </span>
                    <span
                      className="font-bold"
                      style={{ color: '#d4af37', fontFamily: '"Source Code Pro", monospace', fontSize: '0.75rem' }}
                    >
                      ${r.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div
                  className="h-2 rounded-full"
                  style={{ background: 'rgba(26,45,78,0.80)', border: '1px solid rgba(61,96,128,0.15)' }}
                >
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${r.pct}%`,
                      background: 'linear-gradient(90deg, #c9a227 0%, #edc74a 50%, #d4af37 100%)',
                      boxShadow: '0 0 6px rgba(212,175,55,0.30)',
                    }}
                  />
                </div>
                <p className="text-xs mt-1 text-right" style={{ color: 'rgba(90,127,160,0.50)', fontFamily: '"Source Code Pro", monospace' }}>
                  {r.pct}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disbursement history */}
      <div style={{ ...cardStyle, marginBottom: '1.25rem' }}>
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-base font-bold text-white"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Disbursement History
          </h3>
        </div>
        <DataTable
          columns={disbCols}
          data={disbursements as unknown as Record<string, unknown>[]}
          keyField="id"
          emptyMessage="No disbursements yet"
        />
      </div>

      {/* Sales detail */}
      <div style={cardStyle}>
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-base font-bold text-white"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Sales Detail
          </h3>
          <button className="btn-ghost text-xs">
            ↓ Export CSV
          </button>
        </div>
        <DataTable
          columns={salesCols}
          data={sales as unknown as Record<string, unknown>[]}
          keyField="id"
          emptyMessage="No sales records"
        />
      </div>
    </Layout>
  );
};
