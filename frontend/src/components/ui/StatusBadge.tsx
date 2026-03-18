import React from 'react';
import { TitleStatus } from '../../api/types';

const statusConfig: Record<TitleStatus, {
  label: string;
  dot: string;
  style: React.CSSProperties;
}> = {
  draft: {
    label: 'Draft',
    dot: 'rgba(90,127,160,0.70)',
    style: {
      background: 'rgba(26,45,78,0.60)',
      color: '#8aafc8',
      border: '1px solid rgba(61,96,128,0.30)',
    },
  },
  'in-production': {
    label: 'In Production',
    dot: '#d4af37',
    style: {
      background: 'rgba(212,175,55,0.10)',
      color: '#d4af37',
      border: '1px solid rgba(212,175,55,0.28)',
    },
  },
  published: {
    label: 'Published',
    dot: '#34d399',
    style: {
      background: 'rgba(52,211,153,0.08)',
      color: '#34d399',
      border: '1px solid rgba(52,211,153,0.22)',
    },
  },
  archived: {
    label: 'Archived',
    dot: 'rgba(90,127,160,0.45)',
    style: {
      background: 'rgba(15,32,64,0.60)',
      color: 'rgba(90,127,160,0.70)',
      border: '1px solid rgba(61,96,128,0.20)',
    },
  },
};

export const StatusBadge = ({ status }: { status: TitleStatus }) => {
  const config = statusConfig[status] ?? statusConfig.draft;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ ...config.style, fontFamily: 'Inter, sans-serif' }}
    >
      {/* Status dot */}
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{
          background: config.dot,
          boxShadow: `0 0 4px ${config.dot}`,
        }}
      />
      {config.label}
    </span>
  );
};
