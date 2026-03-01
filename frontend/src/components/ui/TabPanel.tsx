import React from 'react';
import clsx from 'clsx';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabPanelProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: React.ReactNode;
}

export const TabPanel = ({ tabs, activeTab, onTabChange, children }: TabPanelProps) => (
  <div>
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex gap-1 px-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
    <div className="mt-4">{children}</div>
  </div>
);
