import React from 'react';

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
    {/* Tab bar */}
    <div
      className="flex gap-0.5 p-1 rounded-xl w-fit"
      style={{
        background: 'rgba(10,22,40,0.60)',
        border: '1px solid rgba(61,96,128,0.22)',
      }}
      role="tablist"
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap"
            style={{
              background: isActive
                ? 'linear-gradient(135deg, #1a2d4e 0%, #243b55 100%)'
                : 'transparent',
              border: isActive
                ? '1px solid rgba(212,175,55,0.25)'
                : '1px solid transparent',
              color: isActive ? '#d4af37' : 'rgba(138,175,200,0.65)',
              boxShadow: isActive ? '0 2px 8px rgba(5,13,26,0.30)' : 'none',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.color = '#c5d8e8';
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(61,96,128,0.12)';
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(138,175,200,0.65)';
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }
            }}
          >
            {tab.icon && <span className="w-4 h-4 flex-shrink-0">{tab.icon}</span>}
            {tab.label}
          </button>
        );
      })}
    </div>

    <div className="mt-5">{children}</div>
  </div>
);
