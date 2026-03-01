import React, { useState, useEffect } from 'react';
import { RoyaltyBreakdown } from '../../api/types';

const MOCK_CHANNELS: RoyaltyBreakdown[] = [
  { channel: 'amazon-kdp', channel_name: 'Amazon KDP', format_type: 'ebook', list_price: 0, platform_fee: 0.30, distribution_fee: 0, gross_royalty: 0, royalty_rate: 0.70, net_royalty: 0 },
  { channel: 'ingram-spark', channel_name: 'IngramSpark', format_type: 'paperback', list_price: 0, platform_fee: 0.45, distribution_fee: 4.50, gross_royalty: 0, royalty_rate: 0.55, net_royalty: 0 },
  { channel: 'apple-books', channel_name: 'Apple Books', format_type: 'ebook', list_price: 0, platform_fee: 0.30, distribution_fee: 0, gross_royalty: 0, royalty_rate: 0.70, net_royalty: 0 },
  { channel: 'kobo', channel_name: 'Kobo', format_type: 'ebook', list_price: 0, platform_fee: 0.30, distribution_fee: 0, gross_royalty: 0, royalty_rate: 0.70, net_royalty: 0 },
];

export const RoyaltyCalculator = () => {
  const [price, setPrice] = useState('9.99');
  const [rows, setRows] = useState<RoyaltyBreakdown[]>([]);

  useEffect(() => {
    const p = parseFloat(price) || 0;
    setRows(MOCK_CHANNELS.map(ch => {
      const gross_royalty = p * ch.royalty_rate;
      const distributionDeduction = ch.distribution_fee || 0;
      const net_royalty = gross_royalty - distributionDeduction;
      return { ...ch, list_price: p, gross_royalty: Math.max(0, gross_royalty), net_royalty: Math.max(0, net_royalty) };
    }));
  }, [price]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Royalty Calculator</h3>
      <div className="flex items-center gap-3 mb-6">
        <label className="text-sm font-medium text-gray-700">List Price:</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            step="0.01"
            min="0"
            className="pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-28 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 font-semibold text-gray-500">Channel</th>
              <th className="text-right py-2 font-semibold text-gray-500">Rate</th>
              <th className="text-right py-2 font-semibold text-gray-500">Royalty</th>
              <th className="text-right py-2 font-semibold text-gray-500">Net Proceeds</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(row => (
              <tr key={row.channel} className="hover:bg-gray-50">
                <td className="py-3 font-medium text-gray-800">{row.channel_name}</td>
                <td className="py-3 text-right text-gray-600">{(row.royalty_rate * 100).toFixed(0)}%</td>
                <td className="py-3 text-right text-primary-600 font-medium">${row.gross_royalty.toFixed(2)}</td>
                <td className="py-3 text-right text-green-600 font-semibold">${row.net_royalty.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
