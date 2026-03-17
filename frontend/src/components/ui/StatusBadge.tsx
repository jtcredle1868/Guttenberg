import React from 'react';
import { TitleStatus } from '../../api/types';
import clsx from 'clsx';

const statusConfig: Record<TitleStatus, { label: string; style: React.CSSProperties }> = {
  draft: {
    label: 'Draft',
    style: { background: 'rgba(30,58,110,0.08)', color: '#2d5190', border: '1px solid rgba(30,58,110,0.15)' },
  },
  'in-production': {
    label: 'In Production',
    style: { background: 'rgba(201,162,39,0.12)', color: '#8e6d17', border: '1px solid rgba(201,162,39,0.30)' },
  },
  published: {
    label: 'Published',
    style: { background: 'rgba(21,128,61,0.10)', color: '#15803d', border: '1px solid rgba(21,128,61,0.25)' },
  },
  archived: {
    label: 'Archived',
    style: { background: 'rgba(107,114,128,0.10)', color: '#6b7280', border: '1px solid rgba(107,114,128,0.20)' },
  },
};

export const StatusBadge = ({ status }: { status: TitleStatus }) => {
  const config = statusConfig[status] ?? statusConfig.draft;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={config.style}
    >
      {config.label}
    </span>
  );
};
