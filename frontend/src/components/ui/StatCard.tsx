import React from 'react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label: string };
  icon?: React.ReactNode;
  color?: 'blue' | 'purple' | 'green' | 'amber';
}

const colorMap = {
  blue: 'from-primary-600 to-primary-700',
  purple: 'from-accent-600 to-accent-700',
  green: 'from-green-500 to-green-600',
  amber: 'from-amber-500 to-amber-600',
};

export const StatCard = ({ title, value, subtitle, trend, icon, color = 'blue' }: StatCardProps) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start gap-4">
    {icon && (
      <div className={clsx('flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white', colorMap[color])}>
        {icon}
      </div>
    )}
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
      {trend && (
        <p className={clsx('mt-1 text-xs font-medium', trend.value >= 0 ? 'text-green-600' : 'text-red-500')}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </div>
  </div>
);
