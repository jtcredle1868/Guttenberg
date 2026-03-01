import React from 'react';
import clsx from 'clsx';
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

export const ChannelReadiness = ({ channel: _channel, displayName, requirements }: ChannelReadinessProps) => {
  const required = requirements.filter(r => !r.optional);
  const metCount = required.filter(r => r.met).length;
  const pct = required.length > 0 ? Math.round((metCount / required.length) * 100) : 0;
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-800">{displayName}</h4>
        <span className={clsx('text-xs font-bold', pct === 100 ? 'text-green-600' : pct >= 60 ? 'text-amber-600' : 'text-red-600')}>
          {pct}%
        </span>
      </div>
      <div className="space-y-1.5">
        {requirements.map(req => (
          <div key={req.key} className="flex items-center gap-2 text-xs">
            {req.met
              ? <CheckIcon className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              : req.optional
                ? <ExclamationTriangleIcon className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                : <XMarkIcon className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
            <span className={clsx(req.met ? 'text-gray-600' : req.optional ? 'text-amber-700' : 'text-red-700')}>{req.label}</span>
            {req.optional && !req.met && <span className="text-gray-400">(optional)</span>}
          </div>
        ))}
      </div>
    </div>
  );
};
