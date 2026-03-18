import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label: string };
  icon?: React.ReactNode;
  color?: 'navy' | 'gold' | 'green' | 'amber' | 'tan';
}

const iconContainerStyles: Record<string, React.CSSProperties> = {
  navy: {
    background: 'linear-gradient(135deg, #1a2d4e 0%, #243b55 100%)',
    border: '1px solid rgba(61,96,128,0.40)',
    color: '#8aafc8',
    boxShadow: '0 2px 8px rgba(5,13,26,0.35)',
  },
  gold: {
    background: 'linear-gradient(135deg, #8b5a00 0%, #c9a227 100%)',
    border: '1px solid rgba(212,175,55,0.40)',
    color: '#0a1628',
    boxShadow: '0 2px 12px rgba(201,162,39,0.30)',
  },
  green: {
    background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
    border: '1px solid rgba(16,185,129,0.30)',
    color: '#34d399',
    boxShadow: '0 2px 8px rgba(5,13,26,0.35)',
  },
  amber: {
    background: 'linear-gradient(135deg, #78350f 0%, #92400e 100%)',
    border: '1px solid rgba(245,158,11,0.30)',
    color: '#fbbf24',
    boxShadow: '0 2px 8px rgba(5,13,26,0.35)',
  },
  tan: {
    background: 'linear-gradient(135deg, #6b5040 0%, #8b6548 100%)',
    border: '1px solid rgba(196,168,130,0.35)',
    color: '#d4b896',
    boxShadow: '0 2px 8px rgba(5,13,26,0.35)',
  },
};

const trendColorMap: Record<string, { pos: string; neg: string }> = {
  navy:  { pos: '#34d399', neg: '#f87171' },
  gold:  { pos: '#34d399', neg: '#f87171' },
  green: { pos: '#34d399', neg: '#f87171' },
  amber: { pos: '#34d399', neg: '#f87171' },
  tan:   { pos: '#34d399', neg: '#f87171' },
};

export const StatCard = ({
  title, value, subtitle, trend, icon, color = 'navy',
}: StatCardProps) => {
  const trendColors = trendColorMap[color];
  const isPositive  = (trend?.value ?? 0) >= 0;

  return (
    <div
      className="rounded-2xl p-5 flex items-start gap-4 transition-all duration-200 relative overflow-hidden group"
      style={{
        background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
        border: '1px solid rgba(61,96,128,0.22)',
        boxShadow: '0 1px 3px rgba(5,13,26,0.35), 0 4px 16px rgba(5,13,26,0.20)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = color === 'gold'
          ? 'rgba(212,175,55,0.40)'
          : 'rgba(61,96,128,0.40)';
        el.style.boxShadow = '0 4px 20px rgba(5,13,26,0.45), 0 12px 40px rgba(5,13,26,0.25)';
        el.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = 'rgba(61,96,128,0.22)';
        el.style.boxShadow = '0 1px 3px rgba(5,13,26,0.35), 0 4px 16px rgba(5,13,26,0.20)';
        el.style.transform = 'translateY(0)';
      }}
    >
      {/* Subtle inner glow on hover */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          background: color === 'gold'
            ? 'radial-gradient(ellipse 60% 50% at 0% 0%, rgba(212,175,55,0.07) 0%, transparent 60%)'
            : 'radial-gradient(ellipse 60% 50% at 0% 0%, rgba(61,96,128,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Top gold rule for gold variant */}
      {color === 'gold' && (
        <div
          className="absolute top-0 left-4 right-4 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)' }}
        />
      )}

      {icon && (
        <div
          className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center relative z-10"
          style={iconContainerStyles[color]}
        >
          {icon}
        </div>
      )}

      <div className="min-w-0 flex-1 relative z-10">
        <p
          className="text-xs font-bold uppercase tracking-wider truncate"
          style={{ color: 'rgba(90,127,160,0.70)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}
        >
          {title}
        </p>

        <p
          className="mt-1 text-2xl font-bold tracking-tight leading-tight"
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            color: color === 'gold' ? '#d4af37' : '#e8f1f8',
          }}
        >
          {value}
        </p>

        {subtitle && (
          <p className="mt-1 text-xs" style={{ color: 'rgba(90,127,160,0.65)' }}>
            {subtitle}
          </p>
        )}

        {trend && (
          <p
            className="mt-1.5 text-xs font-semibold inline-flex items-center gap-1"
            style={{
              color: isPositive ? trendColors.pos : trendColors.neg,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-xs"
              style={{
                background: isPositive
                  ? 'rgba(52,211,153,0.12)'
                  : 'rgba(248,113,113,0.12)',
                fontSize: '0.6rem',
              }}
            >
              {isPositive ? '▲' : '▼'}
            </span>
            {Math.abs(trend.value)}%
            <span
              className="font-normal"
              style={{ color: 'rgba(90,127,160,0.55)' }}
            >
              {trend.label}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};
