import React, { useState, useEffect } from 'react';
import { RoyaltyBreakdown } from '../../api/types';

const MOCK_CHANNELS: RoyaltyBreakdown[] = [
  { channel: 'amazon-kdp',   displayName: 'Amazon KDP',    listPrice: 0, platformFee: 0.30, royaltyRate: 0.70, royaltyAmount: 0, netProceeds: 0 },
  { channel: 'ingram-spark', displayName: 'IngramSpark',   listPrice: 0, platformFee: 0.45, printCost: 4.50, royaltyRate: 0.55, royaltyAmount: 0, netProceeds: 0 },
  { channel: 'apple-books',  displayName: 'Apple Books',   listPrice: 0, platformFee: 0.30, royaltyRate: 0.70, royaltyAmount: 0, netProceeds: 0 },
  { channel: 'kobo',         displayName: 'Kobo',          listPrice: 0, platformFee: 0.30, royaltyRate: 0.70, royaltyAmount: 0, netProceeds: 0 },
];

export const RoyaltyCalculator = () => {
  const [price, setPrice] = useState('9.99');
  const [rows, setRows]   = useState<RoyaltyBreakdown[]>([]);

  useEffect(() => {
    const p = parseFloat(price) || 0;
    setRows(MOCK_CHANNELS.map(ch => {
      const royaltyAmount      = p * ch.royaltyRate;
      const printCostDeduction = ch.printCost || 0;
      const netProceeds        = royaltyAmount - printCostDeduction;
      return { ...ch, listPrice: p, royaltyAmount: Math.max(0, royaltyAmount), netProceeds: Math.max(0, netProceeds) };
    }));
  }, [price]);

  return (
    <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
        border: '1px solid rgba(212,175,55,0.18)',
        boxShadow: '0 4px 20px rgba(5,13,26,0.35)',
      }}
    >
      {/* Gold top rule */}
      <div
        className="absolute top-0 left-6 right-6 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.45), transparent)' }}
      />

      <h3
        className="text-lg font-bold text-white mb-5"
        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
      >
        Royalty Calculator
      </h3>

      {/* Price input */}
      <div className="flex items-center gap-3 mb-6">
        <label
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: 'rgba(90,127,160,0.70)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em', fontSize: '0.6875rem' }}
        >
          List Price
        </label>
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold"
            style={{ color: '#d4af37' }}
          >
            $
          </span>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            step="0.01"
            min="0"
            className="pl-7 pr-3 py-2 rounded-lg text-sm w-32 transition-all duration-150"
            style={{
              background: 'rgba(10,22,40,0.60)',
              border: '1px solid rgba(61,96,128,0.40)',
              color: '#e8f1f8',
              outline: 'none',
              fontFamily: '"Source Code Pro", monospace',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'rgba(212,175,55,0.55)';
              e.target.style.boxShadow = '0 0 0 3px rgba(201,162,39,0.12)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'rgba(61,96,128,0.40)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(61,96,128,0.20)' }}>
              {['Channel', 'Rate', 'Royalty', 'Net Proceeds'].map(h => (
                <th
                  key={h}
                  className={`pb-3 text-xs font-bold uppercase tracking-wider ${h !== 'Channel' ? 'text-right' : 'text-left'}`}
                  style={{ color: 'rgba(90,127,160,0.60)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr
                key={row.channel}
                className="transition-colors duration-100"
                style={{ borderBottom: '1px solid rgba(61,96,128,0.10)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(61,96,128,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td className="py-3 font-semibold" style={{ color: '#c5d8e8' }}>
                  {row.displayName}
                </td>
                <td className="py-3 text-right" style={{ color: 'rgba(138,175,200,0.70)', fontFamily: '"Source Code Pro", monospace' }}>
                  {(row.royaltyRate * 100).toFixed(0)}%
                </td>
                <td className="py-3 text-right font-medium" style={{ color: '#d4af37', fontFamily: '"Source Code Pro", monospace' }}>
                  ${row.royaltyAmount.toFixed(2)}
                </td>
                <td className="py-3 text-right font-bold" style={{ color: '#34d399', fontFamily: '"Source Code Pro", monospace' }}>
                  ${row.netProceeds.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
