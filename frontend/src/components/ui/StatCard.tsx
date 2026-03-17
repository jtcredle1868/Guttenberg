import React from 'react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label: string };
  icon?: React.ReactNode;
  color?: 'navy' | 'gold' | 'green' | 'amber';
}

const iconStyles: Record<string, React.CSSProperties> = {
  navy:  { background: 'linear-gradient(135deg, #1e3a6e 0%, #2d5190 100%)', color: '#d4af37' },
  gold:  { background: 'linear-gradient(135deg, #c9a227 0%, #edc74a 100%)', color: '#0a1628' },
  green: { background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)', color: '#fff' },
  amber: { background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)', color: '#fff' },
};

export const StatCard = ({ title, value, subtitle, trend, icon, color = 'navy' }: StatCardProps) => (
  <div
    className="rounded-2xl p-6 flex items-start gap-4 transition-all duration-200"
    style={{
      background: '#fdf9f4',
      border: '1px solid rgba(30,58,110,0.09)',
      boxShadow: '0 1px 3px rgba(10,22,40,0.06), 0 4px 12px rgba(10,22,40,0.04)',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(10,22,40,0.10), 0 12px 32px rgba(10,22,40,0.06)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(10,22,40,0.06), 0 4px 12px rgba(10,22,40,0.04)'; }}
  >
    {icon && (
      <div
        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
        style={iconStyles[color]}
      >
        {icon}
      </div>
    )}
    <div className="min-w-0 flex-1">
      <p className="text-xs font-bold uppercase tracking-wider truncate" style={{ color: 'rgba(30,58,110,0.5)' }}>
        {title}
      </p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-navy-900">{value}</p>
      {subtitle && (
        <p className="mt-1 text-xs text-navy-400">{subtitle}</p>
      )}
      {trend && (
        <p className={clsx(
          'mt-1.5 text-xs font-semibold inline-flex items-center gap-0.5',
          trend.value >= 0 ? 'text-green-600' : 'text-red-500'
        )}>
          <span>{trend.value >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value)}%</span>
          <span className="font-normal text-navy-400 ml-1">{trend.label}</span>
        </p>
      )}
    </div>
  </div>
);
