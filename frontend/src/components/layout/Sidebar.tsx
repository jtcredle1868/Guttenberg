import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  HomeIcon, BookOpenIcon, PlusCircleIcon, ChartBarIcon,
  CurrencyDollarIcon, TruckIcon, MegaphoneIcon, BuildingLibraryIcon,
  UsersIcon, Cog6ToothIcon, ChevronLeftIcon, ChevronRightIcon,
  ArrowRightOnRectangleIcon,
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

const tierBadge: Record<string, string> = {
  indie:     'bg-navy-700 text-tan-200 ring-navy-600',
  pro:       'bg-gold-400/20 text-gold-300 ring-gold-400/30',
  publisher: 'bg-gold-400/30 text-gold-200 ring-gold-400/50',
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
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-30 flex flex-col transition-all duration-300 select-none',
        'bg-navy-gradient text-white',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
      style={{
        background: 'linear-gradient(180deg, #0a1628 0%, #132650 60%, #0a1628 100%)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center gap-3 px-4 py-5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(212,175,55,0.15)' }}
      >
        {/* Guttenberg "G" mark */}
        <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-bold text-navy-900 text-lg shadow-glow-gold"
          style={{ background: 'linear-gradient(135deg, #edc74a 0%, #c9a227 100%)' }}
        >
          G
        </div>

        {!sidebarCollapsed && (
          <div className="min-w-0 flex-1">
            <p className="font-bold text-white text-sm leading-tight tracking-tight">Guttenberg</p>
            <p className="text-xs leading-tight" style={{ color: 'rgba(212,175,55,0.7)' }}>Self-Publishing</p>
          </div>
        )}

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="ml-auto p-1.5 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed
            ? <ChevronRightIcon className="w-4 h-4" />
            : <ChevronLeftIcon className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {navGroups.map(group => (
          <div key={group.label}>
            {!sidebarCollapsed && (
              <p
                className="px-3 mb-1.5 text-xs font-bold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map(item => (
                <li key={item.to + item.label}>
                  <NavLink
                    to={item.to}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={({ isActive }) => clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'text-gold-300 ring-1'
                        : 'hover:text-white'
                    )}
                    style={({ isActive }) => isActive
                      ? {
                          background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.06) 100%)',
                          ringColor: 'rgba(212,175,55,0.3)',
                          color: '#d4af37',
                        }
                      : { color: 'rgba(213,224,240,0.65)' }
                    }
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

      {/* ── Settings ── */}
      <div className="px-2 pb-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <NavLink
          to="/settings"
          title={sidebarCollapsed ? 'Settings' : undefined}
          className={({ isActive }) => clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
          )}
          style={({ isActive }) => isActive
            ? { color: '#d4af37', background: 'rgba(212,175,55,0.12)' }
            : { color: 'rgba(213,224,240,0.65)' }
          }
        >
          <Cog6ToothIcon className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span>Settings</span>}
        </NavLink>
      </div>

      {/* ── User Profile ── */}
      <div
        className="p-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}
      >
        {user && (
          <div className={clsx('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
            {/* Avatar */}
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-navy-900 shadow-glow-gold"
              style={{ background: 'linear-gradient(135deg, #edc74a 0%, #c9a227 100%)' }}
            >
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            {!sidebarCollapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate leading-tight">{user.name}</p>
                  <span className={clsx(
                    'inline-block text-xs px-1.5 py-0.5 rounded-full font-semibold ring-1 ring-inset mt-0.5',
                    tierBadge[user.subscriptionTier] || tierBadge.indie
                  )}>
                    {user.subscriptionTier}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                  title="Sign out"
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
