import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  HomeIcon, BookOpenIcon, PlusCircleIcon, ChartBarIcon,
  CurrencyDollarIcon, TruckIcon, MegaphoneIcon,
  BuildingLibraryIcon, Cog6ToothIcon,
  ChevronLeftIcon, ChevronRightIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

/* ── Navigation structure ── */
const navGroups = [
  {
    label: 'Publishing',
    items: [
      { to: '/dashboard',   icon: HomeIcon,         label: 'Dashboard' },
      { to: '/titles',      icon: BookOpenIcon,     label: 'My Titles' },
      { to: '/titles/new',  icon: PlusCircleIcon,   label: 'New Title' },
    ],
  },
  {
    label: 'Business',
    items: [
      { to: '/analytics',   icon: ChartBarIcon,       label: 'Analytics' },
      { to: '/finance',     icon: CurrencyDollarIcon, label: 'Finance' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { to: '/marketing',   icon: MegaphoneIcon,     label: 'Marketing Hub' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { to: '/catalog',     icon: BuildingLibraryIcon, label: 'Catalog' },
      { to: '/settings',    icon: Cog6ToothIcon,       label: 'Settings',
        // also used for Distribution shortcut
      },
    ],
  },
];

/* Supplemental bottom nav item */
const distributionItem = { to: '/catalog', icon: TruckIcon, label: 'Distribution' };

/* ── Tier badge style map ── */
const tierBadgeStyle: Record<string, React.CSSProperties> = {
  indie: {
    background: 'rgba(61,96,128,0.25)',
    color: '#8aafc8',
    border: '1px solid rgba(61,96,128,0.40)',
  },
  pro: {
    background: 'rgba(212,175,55,0.15)',
    color: '#d4af37',
    border: '1px solid rgba(212,175,55,0.35)',
  },
  publisher: {
    background: 'rgba(212,175,55,0.25)',
    color: '#edc74a',
    border: '1px solid rgba(212,175,55,0.50)',
  },
};

/* ── G Logomark ── */
const GLogoSVG = ({ size = 36 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="flex-shrink-0"
  >
    <defs>
      <linearGradient id="sidebarLogoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#edc74a" />
        <stop offset="100%" stopColor="#c9a227" />
      </linearGradient>
    </defs>
    <rect width="36" height="36" rx="9" fill="url(#sidebarLogoGrad)" />
    <text
      x="18"
      y="25"
      textAnchor="middle"
      fontFamily="'Playfair Display', Georgia, serif"
      fontWeight="700"
      fontSize="20"
      fill="#0a1628"
    >
      G
    </text>
  </svg>
);

/* ── Sidebar Component ── */
export const Sidebar = () => {
  const { user, logout }                        = useAuth();
  const { sidebarCollapsed, setSidebarCollapsed } = useApp();
  const navigate                                = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-30 flex flex-col transition-all duration-300 ease-in-out select-none',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
      style={{
        background: 'linear-gradient(180deg, #050d1a 0%, #0a1628 35%, #0f2040 70%, #050d1a 100%)',
        borderRight: '1px solid rgba(61,96,128,0.18)',
        boxShadow: '4px 0 32px rgba(5,13,26,0.60)',
      }}
    >
      {/* Subtle linen texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%230a1628'/%3E%3Crect x='0' y='0' width='1' height='1' fill='%230d1b2e' opacity='0.35'/%3E%3Crect x='2' y='2' width='1' height='1' fill='%230d1b2e' opacity='0.35'/%3E%3C/svg%3E\")",
          opacity: 0.7,
        }}
      />

      {/* ── Logo / Brand ── */}
      <div
        className="relative z-10 flex items-center gap-3 px-3 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(212,175,55,0.14)' }}
      >
        <div
          style={{ filter: 'drop-shadow(0 2px 8px rgba(212,175,55,0.30))' }}
          className="flex-shrink-0"
        >
          <GLogoSVG size={36} />
        </div>

        {!sidebarCollapsed && (
          <div className="min-w-0 flex-1">
            <p
              className="font-bold text-white text-sm leading-tight"
              style={{ fontFamily: '"Playfair Display", Georgia, serif', letterSpacing: '-0.01em' }}
            >
              Guttenberg
            </p>
            <p className="text-xs leading-tight mt-0.5" style={{ color: 'rgba(212,175,55,0.60)' }}>
              Self-Publishing
            </p>
          </div>
        )}

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="ml-auto p-1.5 rounded-lg transition-all duration-150 flex-shrink-0"
          style={{ color: 'rgba(138,175,200,0.45)' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(61,96,128,0.18)';
            e.currentTarget.style.color = '#8aafc8';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(138,175,200,0.45)';
          }}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed
            ? <ChevronRightIcon className="w-3.5 h-3.5" />
            : <ChevronLeftIcon className="w-3.5 h-3.5" />
          }
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="relative z-10 flex-1 overflow-y-auto py-4 px-2 space-y-5" aria-label="Main navigation">
        {navGroups.map(group => (
          <div key={group.label}>
            {!sidebarCollapsed && (
              <p
                className="px-3 mb-1.5 text-xs font-bold uppercase tracking-widest"
                style={{ color: 'rgba(90,127,160,0.50)' }}
              >
                {group.label}
              </p>
            )}

            <ul className="space-y-0.5" role="list">
              {group.items.map(item => (
                <li key={`${item.to}-${item.label}`}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/dashboard'}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={({ isActive }) => clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 no-underline relative',
                      sidebarCollapsed && 'justify-center px-0',
                    )}
                    style={({ isActive }) =>
                      isActive
                        ? {
                            background: 'linear-gradient(135deg, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0.06) 100%)',
                            color: '#d4af37',
                            borderLeft: '2px solid #d4af37',
                            paddingLeft: sidebarCollapsed ? undefined : '0.625rem',
                            boxShadow: 'inset 0 1px 0 rgba(212,175,55,0.06)',
                          }
                        : {
                            color: 'rgba(138,175,200,0.70)',
                            borderLeft: '2px solid transparent',
                          }
                    }
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      if (!el.classList.contains('active') && el.style.color !== '#d4af37') {
                        el.style.color = '#c5d8e8';
                        el.style.background = 'rgba(61,96,128,0.12)';
                      }
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      if (el.style.color !== '#d4af37') {
                        el.style.color = 'rgba(138,175,200,0.70)';
                        el.style.background = 'transparent';
                      }
                    }}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Distribution as extra item under Platform */}
        {!sidebarCollapsed && (
          <div>
            <ul className="space-y-0.5" role="list">
              <li>
                <NavLink
                  to={distributionItem.to}
                  end
                  style={({ isActive }) => isActive
                    ? { display: 'none' } // hide if catalog already active
                    : {
                        color: 'rgba(138,175,200,0.55)',
                        borderLeft: '2px solid transparent',
                      }
                  }
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
                  onMouseEnter={e => { e.currentTarget.style.color = '#c5d8e8'; e.currentTarget.style.background = 'rgba(61,96,128,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(138,175,200,0.55)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <distributionItem.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{distributionItem.label}</span>
                </NavLink>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* ── User Profile Card ── */}
      <div
        className="relative z-10 p-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(212,175,55,0.13)' }}
      >
        {user && (
          <div className={clsx('flex items-center gap-2.5', sidebarCollapsed && 'justify-center')}>
            {/* Avatar */}
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: 'linear-gradient(135deg, #edc74a 0%, #c9a227 100%)',
                color: '#0a1628',
                fontFamily: '"Playfair Display", Georgia, serif',
                boxShadow: '0 0 10px rgba(212,175,55,0.25)',
              }}
              title={sidebarCollapsed ? user.name || 'User' : undefined}
            >
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            {!sidebarCollapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate leading-tight">
                    {user.name}
                  </p>
                  <span
                    className="inline-flex items-center mt-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold"
                    style={tierBadgeStyle[user.subscriptionTier] || tierBadgeStyle.indie}
                  >
                    {user.subscriptionTier?.toUpperCase() || 'INDIE'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg transition-all duration-150 flex-shrink-0"
                  style={{ color: 'rgba(138,175,200,0.40)' }}
                  title="Sign out"
                  aria-label="Sign out"
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#f87171';
                    e.currentTarget.style.background = 'rgba(220,38,38,0.10)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'rgba(138,175,200,0.40)';
                    e.currentTarget.style.background = 'transparent';
                  }}
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
