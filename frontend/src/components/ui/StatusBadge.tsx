import React from 'react';
import clsx from 'clsx';

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700 ring-gray-200' },
  formatting: { label: 'Formatting', className: 'bg-blue-100 text-blue-700 ring-blue-200' },
  ready: { label: 'Ready', className: 'bg-amber-100 text-amber-700 ring-amber-200' },
  submitted: { label: 'Submitted', className: 'bg-purple-100 text-purple-700 ring-purple-200' },
  live: { label: 'Live', className: 'bg-green-100 text-green-700 ring-green-200' },
  unlisted: { label: 'Unlisted', className: 'bg-red-100 text-red-700 ring-red-200' },
  // Distribution statuses
  pending: { label: 'Pending', className: 'bg-gray-100 text-gray-600 ring-gray-200' },
  under_review: { label: 'Under Review', className: 'bg-blue-100 text-blue-700 ring-blue-200' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 ring-red-200' },
  // Job statuses
  queued: { label: 'Queued', className: 'bg-gray-100 text-gray-600 ring-gray-200' },
  processing: { label: 'Processing', className: 'bg-blue-100 text-blue-700 ring-blue-200' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700 ring-green-200' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-700 ring-red-200' },
  // Payment statuses
  active: { label: 'Active', className: 'bg-green-100 text-green-700 ring-green-200' },
};

export const StatusBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-700 ring-gray-200' };
  return (
    <span className={clsx(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset capitalize',
      config.className
    )}>
      {config.label}
    </span>
  );
};
