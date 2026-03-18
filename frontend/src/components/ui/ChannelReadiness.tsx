import React from 'react';
import { CheckIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ChannelRequirement {
  key: string;
  label: string;
  met: boolean;
  optional?: boolean;
}

interface ChannelReadinessProps {
  channel: string;
  displayName: string;
  requirements: ChannelRequirement[];
}

export const ChannelReadiness = ({
  channel: _channel, displayName, requirements,
}: ChannelReadinessProps) => {
  const required  = requirements.filter(r => !r.optional);
  const metCount  = required.filter(r => r.met).length;
  const pct       = required.length > 0 ? Math.round((metCount / required.length) * 100) : 0;

  const pctColor =
    pct === 100 ? '#34d399' :
    pct >= 60   ? '#d4af37' :
                  '#f87171';

  return (
    <div
      className="rounded-xl p-4 transition-all duration-200"
      style={{
        background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
        border: '1px solid rgba(61,96,128,0.22)',
        boxShadow: '0 1px 4px rgba(5,13,26,0.30)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h4
          className="text-sm font-semibold"
          style={{ color: '#c5d8e8', fontFamily: 'Inter, sans-serif' }}
        >
          {displayName}
        </h4>
        <span
          className="text-xs font-bold"
          style={{
            color: pctColor,
            fontFamily: '"Source Code Pro", monospace',
          }}
        >
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-1 rounded-full mb-3"
        style={{ background: 'rgba(26,45,78,0.80)' }}
      >
        <div
          className="h-1 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background:
              pct === 100
                ? 'linear-gradient(90deg, #059669, #34d399)'
                : pct >= 60
                ? 'linear-gradient(90deg, #c9a227, #edc74a)'
                : 'linear-gradient(90deg, #dc2626, #f87171)',
            boxShadow: `0 0 6px ${pctColor}50`,
          }}
        />
      </div>

      <div className="space-y-1.5">
        {requirements.map(req => (
          <div key={req.key} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}
              >
                <CheckIcon className="w-2.5 h-2.5" style={{ color: '#34d399' }} />
              </div>
            ) : req.optional ? (
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(212,175,55,0.10)', border: '1px solid rgba(212,175,55,0.22)' }}
              >
                <ExclamationTriangleIcon className="w-2.5 h-2.5" style={{ color: '#d4af37' }} />
              </div>
            ) : (
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.22)' }}
              >
                <XMarkIcon className="w-2.5 h-2.5" style={{ color: '#f87171' }} />
              </div>
            )}
            <span
              style={{
                color: req.met
                  ? '#8aafc8'
                  : req.optional
                  ? 'rgba(212,175,55,0.70)'
                  : 'rgba(248,113,113,0.80)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {req.label}
            </span>
            {req.optional && !req.met && (
              <span style={{ color: 'rgba(90,127,160,0.45)' }}>(optional)</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
