import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

const STEPS = [
  { id: 'manuscript',  label: 'Manuscript' },
  { id: 'metadata',    label: 'Metadata' },
  { id: 'formatting',  label: 'Formatting' },
  { id: 'cover',       label: 'Cover' },
  { id: 'distribution', label: 'Distribution' },
];

interface PublishingWorkflowProps {
  completed: string[];
  current?: string;
}

export const PublishingWorkflow = ({ completed, current }: PublishingWorkflowProps) => (
  <div className="flex items-center w-full">
    {STEPS.map((step, i) => {
      const isDone    = completed.includes(step.id);
      const isCurrent = current === step.id;

      return (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center flex-shrink-0">
            {/* Step circle */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
              style={
                isDone
                  ? {
                      background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 100%)',
                      border: 'none',
                      color: '#0a1628',
                      boxShadow: '0 0 10px rgba(212,175,55,0.35)',
                      fontFamily: 'Inter, sans-serif',
                    }
                  : isCurrent
                  ? {
                      background: 'rgba(26,45,78,0.80)',
                      border: '2px solid #d4af37',
                      color: '#d4af37',
                      boxShadow: '0 0 12px rgba(212,175,55,0.20)',
                      fontFamily: 'Inter, sans-serif',
                    }
                  : {
                      background: 'rgba(15,32,64,0.60)',
                      border: '2px solid rgba(61,96,128,0.30)',
                      color: 'rgba(90,127,160,0.50)',
                      fontFamily: 'Inter, sans-serif',
                    }
              }
            >
              {isDone ? <CheckIcon className="w-4 h-4" /> : i + 1}
            </div>

            {/* Step label */}
            <span
              className="mt-1.5 text-xs font-medium whitespace-nowrap"
              style={{
                color: isDone
                  ? '#d4af37'
                  : isCurrent
                  ? '#c5d8e8'
                  : 'rgba(90,127,160,0.50)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {step.label}
            </span>
          </div>

          {/* Connector line */}
          {i < STEPS.length - 1 && (
            <div
              className="flex-1 h-px mx-2 mb-5 transition-all duration-300"
              style={{
                background: isDone
                  ? 'linear-gradient(90deg, #d4af37, rgba(212,175,55,0.40))'
                  : 'rgba(61,96,128,0.22)',
              }}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);
