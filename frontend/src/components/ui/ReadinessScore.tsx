import React from 'react';

interface ReadinessScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ReadinessScore = ({ score, size = 'md' }: ReadinessScoreProps) => {
  const strokeColor =
    score >= 80 ? '#34d399' :
    score >= 60 ? '#d4af37' :
                  '#f87171';

  const glowColor =
    score >= 80 ? 'rgba(52,211,153,0.30)' :
    score >= 60 ? 'rgba(212,175,55,0.30)' :
                  'rgba(248,113,113,0.30)';

  const textColor =
    score >= 80 ? '#34d399' :
    score >= 60 ? '#d4af37' :
                  '#f87171';

  const sizeMap = { sm: 48, md: 72, lg: 96 };
  const px      = sizeMap[size];
  const r       = (px / 2) - 6;
  const circ    = 2 * Math.PI * r;
  const offset  = circ - (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: px, height: px }}>
        <svg width={px} height={px} className="-rotate-90">
          {/* Track */}
          <circle
            cx={px / 2} cy={px / 2} r={r}
            fill="none"
            stroke="rgba(26,45,78,0.80)"
            strokeWidth="5"
          />
          {/* Progress */}
          <circle
            cx={px / 2} cy={px / 2} r={r}
            fill="none"
            stroke={strokeColor}
            strokeWidth="5"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)',
              filter: `drop-shadow(0 0 4px ${glowColor})`,
            }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-bold"
          style={{
            fontFamily: '"Source Code Pro", monospace',
            fontSize: size === 'lg' ? '1.125rem' : size === 'md' ? '0.875rem' : '0.65rem',
            color: textColor,
          }}
        >
          {score}
        </span>
      </div>
      {size !== 'sm' && (
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: 'rgba(90,127,160,0.55)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}
        >
          Readiness
        </span>
      )}
    </div>
  );
};
