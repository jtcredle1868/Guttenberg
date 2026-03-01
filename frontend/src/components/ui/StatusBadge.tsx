import React from 'react';
import { TitleStatus } from '../../api/types';
import clsx from 'clsx';

const statusConfig: Record<TitleStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700 ring-gray-200' },
  'in-production': { label: 'In Production', className: 'bg-amber-100 text-amber-700 ring-amber-200' },
  published: { label: 'Published', className: 'bg-green-100 text-green-700 ring-green-200' },
  archived: { label: 'Archived', className: 'bg-red-100 text-red-700 ring-red-200' },
};

export const StatusBadge = ({ status }: { status: TitleStatus }) => {
  const config = statusConfig[status] ?? statusConfig.draft;
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', config.className)}>
      {config.label}
    </span>
  );
};
