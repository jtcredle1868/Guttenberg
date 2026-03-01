import React from 'react';
import clsx from 'clsx';

interface ReadinessScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ReadinessScore = ({ score, size = 'md' }: ReadinessScoreProps) => {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-500' : 'text-red-500';
  const strokeColor = score >= 80 ? '#16a34a' : score >= 60 ? '#f59e0b' : '#dc2626';
  const sizeMap = { sm: 48, md: 72, lg: 96 };
  const px = sizeMap[size];
  const r = (px / 2) - 6;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: px, height: px }}>
        <svg width={px} height={px} className="-rotate-90">
          <circle cx={px / 2} cy={px / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
          <circle
            cx={px / 2} cy={px / 2} r={r} fill="none"
            stroke={strokeColor} strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <span className={clsx('absolute inset-0 flex items-center justify-center font-bold', color,
          size === 'lg' ? 'text-xl' : size === 'md' ? 'text-base' : 'text-xs')}>
          {score}
        </span>
      </div>
      {size !== 'sm' && <span className="text-xs text-gray-500">Readiness</span>}
    </div>
  );
};
