import React from 'react';
import clsx from 'clsx';
import { CheckIcon } from '@heroicons/react/24/solid';

const STEPS = [
  { id: 'manuscript', label: 'Manuscript' },
  { id: 'metadata', label: 'Metadata' },
  { id: 'formatting', label: 'Formatting' },
  { id: 'cover', label: 'Cover' },
  { id: 'distribution', label: 'Distribution' },
];

interface PublishingWorkflowProps {
  completed: string[];
  current?: string;
}

export const PublishingWorkflow = ({ completed, current }: PublishingWorkflowProps) => (
  <div className="flex items-center w-full">
    {STEPS.map((step, i) => {
      const isDone = completed.includes(step.id);
      const isCurrent = current === step.id;
      return (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center flex-shrink-0">
            <div className={clsx(
              'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors',
              isDone ? 'bg-primary-600 border-primary-600 text-white' :
              isCurrent ? 'bg-white border-primary-600 text-primary-600' :
              'bg-white border-gray-200 text-gray-400'
            )}>
              {isDone ? <CheckIcon className="w-4 h-4" /> : i + 1}
            </div>
            <span className={clsx('mt-1.5 text-xs font-medium whitespace-nowrap',
              isDone ? 'text-primary-600' : isCurrent ? 'text-gray-900' : 'text-gray-400')}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={clsx('flex-1 h-0.5 mx-2 mb-5', isDone ? 'bg-primary-600' : 'bg-gray-200')} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);
