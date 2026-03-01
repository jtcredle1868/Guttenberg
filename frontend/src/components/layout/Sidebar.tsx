import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  HomeIcon, BookOpenIcon, PlusCircleIcon, ChartBarIcon,
  CurrencyDollarIcon, TruckIcon, MegaphoneIcon, BuildingLibraryIcon,
  UsersIcon, Cog6ToothIcon, ChevronLeftIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const navGroups = [
  {
    label: 'Publishing',
    items: [
      { to: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
      { to: '/titles', icon: BookOpenIcon, label: 'My Titles' },
      { to: '/titles/new', icon: PlusCircleIcon, label: 'New Title' },
    ],
  },
  {
    label: 'Distribution & Finance',
    items: [
      { to: '/analytics', icon: ChartBarIcon, label: 'Analytics' },
      { to: '/finance', icon: CurrencyDollarIcon, label: 'Finance' },
      { to: '/catalog', icon: TruckIcon, label: 'Distribution' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { to: '/marketing', icon: MegaphoneIcon, label: 'Marketing Hub' },
    ],
  },
  {
    label: 'Enterprise',
    items: [
      { to: '/catalog', icon: BuildingLibraryIcon, label: 'Catalog' },
      { to: '/settings', icon: UsersIcon, label: 'Team' },
    ],
  },
];

const tierColors: Record<string, string> = {
  indie: 'bg-gray-700 text-gray-200',
  pro: 'bg-primary-600 text-white',
  publisher: 'bg-accent-600 text-white',
};

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { sidebarCollapsed, setSidebarCollapsed } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={clsx(
      'fixed inset-y-0 left-0 z-30 flex flex-col bg-gray-900 text-white transition-all duration-300',
      sidebarCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700/50">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-gray-900 text-lg shadow-lg">
          G
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <p className="font-bold text-white text-sm leading-tight">Guttenberg</p>
            <p className="text-xs text-gray-400 leading-tight">Self-Publishing</p>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="ml-auto p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navGroups.map(group => (
          <div key={group.label}>
            {!sidebarCollapsed && (
              <p className="px-3 mb-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{group.label}</p>
            )}
            <ul className="space-y-0.5">
              {group.items.map(item => (
                <li key={item.to + item.label}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group',
                      isActive
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/30'
                        : 'text-gray-300 hover:bg-gray-700/60 hover:text-white'
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Settings */}
      <div className="px-2 pb-2">
        <NavLink
          to="/settings"
          className={({ isActive }) => clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
            isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700/60 hover:text-white'
          )}
          title={sidebarCollapsed ? 'Settings' : undefined}
        >
          <Cog6ToothIcon className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span>Settings</span>}
        </NavLink>
      </div>

      {/* User Profile */}
      <div className="border-t border-gray-700/50 p-3">
        {user ? (
          <div className={clsx('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-xs font-bold text-white">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <span className={clsx('inline-block text-xs px-1.5 py-0.5 rounded-full font-medium', tierColors[user.subscriptionTier] || tierColors.indie)}>
                  {user.subscriptionTier}
                </span>
              </div>
            )}
            {!sidebarCollapsed && (
              <button onClick={handleLogout} className="text-gray-400 hover:text-white text-xs">
                Out
              </button>
            )}
          </div>
        ) : null}
      </div>
    </aside>
  );
};
