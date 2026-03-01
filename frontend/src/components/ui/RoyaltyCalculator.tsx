import React, { useState, useEffect } from 'react';
import { RoyaltyBreakdown } from '../../api/types';

const MOCK_CHANNELS: RoyaltyBreakdown[] = [
  { channel: 'amazon-kdp', displayName: 'Amazon KDP', listPrice: 0, platformFee: 0.30, royaltyRate: 0.70, royaltyAmount: 0, netProceeds: 0 },
  { channel: 'ingram-spark', displayName: 'IngramSpark', listPrice: 0, platformFee: 0.45, printCost: 4.50, royaltyRate: 0.55, royaltyAmount: 0, netProceeds: 0 },
  { channel: 'apple-books', displayName: 'Apple Books', listPrice: 0, platformFee: 0.30, royaltyRate: 0.70, royaltyAmount: 0, netProceeds: 0 },
  { channel: 'kobo', displayName: 'Kobo', listPrice: 0, platformFee: 0.30, royaltyRate: 0.70, royaltyAmount: 0, netProceeds: 0 },
];

export const RoyaltyCalculator = () => {
  const [price, setPrice] = useState('9.99');
  const [rows, setRows] = useState<RoyaltyBreakdown[]>([]);

  useEffect(() => {
    const p = parseFloat(price) || 0;
    setRows(MOCK_CHANNELS.map(ch => {
      const royaltyAmount = p * ch.royaltyRate;
      const printCostDeduction = ch.printCost || 0;
      const netProceeds = royaltyAmount - printCostDeduction;
      return { ...ch, listPrice: p, royaltyAmount: Math.max(0, royaltyAmount), netProceeds: Math.max(0, netProceeds) };
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
                <td className="py-3 font-medium text-gray-800">{row.displayName}</td>
                <td className="py-3 text-right text-gray-600">{(row.royaltyRate * 100).toFixed(0)}%</td>
                <td className="py-3 text-right text-primary-600 font-medium">${row.royaltyAmount.toFixed(2)}</td>
                <td className="py-3 text-right text-green-600 font-semibold">${row.netProceeds.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
