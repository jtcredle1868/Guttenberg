import React, { useState } from 'react';
import {
  BellIcon, ChevronDownIcon, ArrowRightOnRectangleIcon,
  Cog6ToothIcon, UserIcon, MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import clsx from 'clsx';

interface HeaderProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export const Header = ({ title, breadcrumbs }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifCount] = useState(3);
  const [searchFocused, setSearchFocused] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className="px-5 xl:px-6 py-3.5 flex items-center justify-between sticky top-0 z-20"
      style={{
        background: 'linear-gradient(180deg, rgba(5,13,26,0.95) 0%, rgba(10,22,40,0.92) 100%)',
        borderBottom: '1px solid rgba(61,96,128,0.18)',
        boxShadow: '0 1px 0 rgba(5,13,26,0.40), 0 4px 16px rgba(5,13,26,0.20)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* ── Left: Title + breadcrumbs ── */}
      <div className="flex-1 min-w-0 mr-4">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-xs mb-0.5" aria-label="Breadcrumb">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && (
                  <span style={{ color: 'rgba(61,96,128,0.50)' }}>/</span>
                )}
                {b.href ? (
                  <button
                    onClick={() => navigate(b.href!)}
                    className="transition-colors hover:underline"
                    style={{ color: 'rgba(138,175,200,0.60)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#d4af37')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(138,175,200,0.60)')}
                  >
                    {b.label}
                  </button>
                ) : (
                  <span style={{ color: 'rgba(212,175,55,0.70)' }}>{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1
          className="text-lg xl:text-xl font-bold text-white truncate leading-tight"
          style={{ fontFamily: '"Playfair Display", Georgia, serif', letterSpacing: '-0.01em' }}
        >
          {title}
        </h1>
      </div>

      {/* ── Center: Search ── */}
      <div className="hidden md:flex flex-1 max-w-xs xl:max-w-sm mx-4">
        <div
          className="relative w-full"
          style={{ transition: 'all 0.2s ease' }}
        >
          <MagnifyingGlassIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors"
            style={{ color: searchFocused ? '#d4af37' : 'rgba(90,127,160,0.60)' }}
          />
          <input
            type="search"
            placeholder="Search titles, analytics…"
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm transition-all duration-200"
            style={{
              background: 'rgba(10,22,40,0.60)',
              border: searchFocused
                ? '1px solid rgba(212,175,55,0.55)'
                : '1px solid rgba(61,96,128,0.30)',
              color: '#c5d8e8',
              outline: 'none',
              boxShadow: searchFocused
                ? '0 0 0 3px rgba(201,162,39,0.12), 0 0 16px rgba(201,162,39,0.06)'
                : 'none',
              fontFamily: 'Inter, sans-serif',
            }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      {/* ── Right: Actions ── */}
      <div className="flex items-center gap-1.5">
        {/* Notification bell */}
        <button
          className="relative p-2 rounded-xl transition-all duration-150"
          style={{ color: 'rgba(138,175,200,0.60)' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(61,96,128,0.18)';
            e.currentTarget.style.color = '#c5d8e8';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(138,175,200,0.60)';
          }}
          aria-label="Notifications"
        >
          <BellIcon className="w-5 h-5" />
          {notifCount > 0 && (
            <span
              className="absolute top-1 right-1 w-4 h-4 text-xs rounded-full flex items-center justify-center font-bold leading-none"
              style={{
                background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 100%)',
                color: '#0a1628',
                fontSize: '0.6rem',
              }}
            >
              {notifCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-5 mx-0.5" style={{ background: 'rgba(61,96,128,0.25)' }} />

        {/* User menu */}
        <Menu as="div" className="relative">
          <Menu.Button
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl transition-all duration-150"
            style={{ color: '#c5d8e8' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(61,96,128,0.18)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #edc74a 0%, #c9a227 100%)',
                color: '#0a1628',
                fontFamily: '"Playfair Display", Georgia, serif',
                boxShadow: '0 0 8px rgba(212,175,55,0.30)',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:block text-sm font-semibold" style={{ color: '#c5d8e8' }}>
              {user?.name?.split(' ')[0] || 'User'}
            </span>
            <ChevronDownIcon className="w-3.5 h-3.5" style={{ color: 'rgba(138,175,200,0.55)' }} />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 scale-95 translate-y-1"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-1"
          >
            <Menu.Items
              className="absolute right-0 mt-2 w-56 rounded-xl py-1 z-50 focus:outline-none"
              style={{
                background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
                border: '1px solid rgba(61,96,128,0.30)',
                boxShadow: '0 8px 32px rgba(5,13,26,0.55), 0 2px 8px rgba(5,13,26,0.35)',
              }}
            >
              {/* User info header */}
              <div
                className="px-4 py-3 mb-1"
                style={{ borderBottom: '1px solid rgba(61,96,128,0.20)' }}
              >
                <p className="text-sm font-semibold text-white truncate leading-tight">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(138,175,200,0.60)' }}>
                  {user?.email || 'demo@guttenberg.io'}
                </p>
                {user?.subscriptionTier && (
                  <span
                    className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      background: 'rgba(212,175,55,0.15)',
                      border: '1px solid rgba(212,175,55,0.30)',
                      color: '#d4af37',
                    }}
                  >
                    {user.subscriptionTier.toUpperCase()}
                  </span>
                )}
              </div>

              <Menu.Item>
                {({ active }) => (
                  <button
                    className={clsx(
                      'flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-medium transition-all duration-100',
                    )}
                    style={{
                      background: active ? 'rgba(61,96,128,0.18)' : 'transparent',
                      color: active ? '#c5d8e8' : 'rgba(138,175,200,0.80)',
                    }}
                    onClick={() => navigate('/settings')}
                  >
                    <UserIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(90,127,160,0.70)' }} />
                    Profile
                  </button>
                )}
              </Menu.Item>

              <Menu.Item>
                {({ active }) => (
                  <button
                    className={clsx(
                      'flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-medium transition-all duration-100',
                    )}
                    style={{
                      background: active ? 'rgba(61,96,128,0.18)' : 'transparent',
                      color: active ? '#c5d8e8' : 'rgba(138,175,200,0.80)',
                    }}
                    onClick={() => navigate('/settings')}
                  >
                    <Cog6ToothIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(90,127,160,0.70)' }} />
                    Settings
                  </button>
                )}
              </Menu.Item>

              <div
                className="my-1 mx-2"
                style={{ height: '1px', background: 'rgba(61,96,128,0.20)' }}
              />

              <Menu.Item>
                {({ active }) => (
                  <button
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-medium transition-all duration-100 mb-0.5"
                    style={{
                      background: active ? 'rgba(220,38,38,0.10)' : 'transparent',
                      color: active ? '#f87171' : 'rgba(248,113,113,0.75)',
                    }}
                    onClick={handleLogout}
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 flex-shrink-0" />
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
};
