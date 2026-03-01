import React from 'react';
import clsx from 'clsx';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label: string };
  icon?: React.ReactNode;
  color?: 'blue' | 'purple' | 'green' | 'amber' | 'red';
  prefix?: string;
}

const colorMap = {
  blue: 'from-indigo-600 to-indigo-700',
  purple: 'from-purple-600 to-purple-700',
  green: 'from-emerald-500 to-emerald-600',
  amber: 'from-amber-500 to-amber-600',
  red: 'from-red-500 to-red-600',
};

export const StatCard = ({ title, value, subtitle, trend, icon, color = 'blue', prefix }: StatCardProps) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start gap-4 hover:shadow-md transition-shadow duration-200">
    {icon && (
      <div className={clsx('flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg', colorMap[color])}>
        {icon}
      </div>
    )}
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 tracking-tight">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <span className={clsx(
            'inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full',
            trend.value >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          )}>
            {trend.value >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
            {Math.abs(trend.value).toFixed(1)}%
          </span>
          <span className="text-xs text-gray-400">{trend.label}</span>
        </div>
      )}
    </div>
  </div>
);
