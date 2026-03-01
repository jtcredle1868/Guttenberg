import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { RoyaltyCalculator } from '../components/ui/RoyaltyCalculator';
import { DataTable, Column } from '../components/ui/DataTable';
import { MOCK_DISBURSEMENTS, MOCK_SALES } from '../mockData';
import { Disbursement, SalesRecord } from '../api/types';
import clsx from 'clsx';

export const FinancePage = () => {
  const [disbursements] = useState<Disbursement[]>(MOCK_DISBURSEMENTS);
  const [sales] = useState<SalesRecord[]>(MOCK_SALES);

  const earnings = { thisMonth: 2847.32, lastMonth: 3102.18, ytd: 18654.90, allTime: 48732.50 };

  const disbCols: Column<Record<string, unknown>>[] = [
    { key: 'period', header: 'Period', sortable: true },
    { key: 'amount', header: 'Amount', sortable: true, render: (r) => <span className="font-semibold text-green-600">${(r.amount as number).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span> },
    { key: 'method', header: 'Method' },
    { key: 'status', header: 'Status', render: (r) => (
      <span className={clsx('text-xs px-2 py-1 rounded-full font-medium', r.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
        {r.status as string}
      </span>
    )},
    { key: 'paidAt', header: 'Paid On', render: (r) => <span className="text-gray-500">{r.paidAt as string || '—'}</span> },
  ];

  const salesCols: Column<Record<string, unknown>>[] = [
    { key: 'titleName', header: 'Title', sortable: true },
    { key: 'channelName', header: 'Channel', sortable: true },
    { key: 'formatType', header: 'Format', render: (r) => <span className="capitalize">{r.formatType as string}</span> },
    { key: 'units', header: 'Units', sortable: true },
    { key: 'revenue', header: 'Revenue', sortable: true, render: (r) => `$${(r.revenue as number).toFixed(2)}` },
    { key: 'royalties', header: 'Royalties', sortable: true, render: (r) => <span className="font-semibold text-green-600">${(r.royalties as number).toFixed(2)}</span> },
  ];

  return (
    <Layout title="Finance" breadcrumbs={[{ label: 'Finance' }]}>
      {/* Earnings Summary */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'This Month', value: `$${earnings.thisMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, trend: '-8.2% vs last month', trendColor: 'text-red-500' },
          { label: 'Last Month', value: `$${earnings.lastMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, trend: '', trendColor: '' },
          { label: 'Year to Date', value: `$${earnings.ytd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, trend: '+24.6% vs last year', trendColor: 'text-green-600' },
          { label: 'All-Time', value: `$${earnings.allTime.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, trend: '', trendColor: '' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
            {c.trend && <p className={clsx('text-xs font-medium mt-1', c.trendColor)}>{c.trend}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-1">
          <RoyaltyCalculator />
        </div>

        {/* Revenue by format */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Revenue by Format</h3>
          <div className="space-y-4">
            {[
              { format: 'E-book', revenue: 28450, units: 4200, pct: 58 },
              { format: 'Print (POD)', revenue: 14870, units: 890, pct: 31 },
              { format: 'Audiobook', revenue: 5410, units: 210, pct: 11 },
            ].map(r => (
              <div key={r.format}>
                <div className="flex items-center justify-between mb-1 text-sm">
                  <span className="font-medium text-gray-700">{r.format}</span>
                  <div className="flex gap-4 text-gray-500">
                    <span>{r.units.toLocaleString()} units</span>
                    <span className="font-semibold text-gray-800">${r.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className="h-2 bg-primary-600 rounded-full" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disbursement history */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Disbursement History</h3>
        </div>
        <DataTable
          columns={disbCols}
          data={disbursements as unknown as Record<string, unknown>[]}
          keyField="id"
          emptyMessage="No disbursements yet"
        />
      </div>

      {/* Sales detail */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Sales Detail</h3>
          <button className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 flex items-center gap-2">
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
