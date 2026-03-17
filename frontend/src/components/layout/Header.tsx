import React, { useState } from 'react';
import { BellIcon, ChevronDownIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon, UserIcon } from '@heroicons/react/24/outline';
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className="px-6 py-4 flex items-center justify-between sticky top-0 z-20 bg-tan-50"
      style={{
        borderBottom: '1px solid rgba(30,58,110,0.10)',
        boxShadow: '0 1px 0 rgba(30,58,110,0.06)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* ── Title + breadcrumbs ── */}
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1 text-xs mb-0.5" style={{ color: 'rgba(45,81,144,0.5)' }}>
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span style={{ color: 'rgba(45,81,144,0.3)' }}>/</span>}
                {b.href ? (
                  <button
                    onClick={() => navigate(b.href!)}
                    className="hover:text-navy-700 transition-colors"
                  >
                    {b.label}
                  </button>
                ) : (
                  <span>{b.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-xl font-bold text-navy-900 tracking-tight">{title}</h1>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          className="relative p-2 rounded-xl transition-colors"
          style={{ color: 'rgba(30,58,110,0.5)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30,58,110,0.06)'; e.currentTarget.style.color = '#0a1628'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(30,58,110,0.5)'; }}
        >
          <BellIcon className="w-5 h-5" />
          {notifCount > 0 && (
            <span
              className="absolute top-1 right-1 w-4 h-4 text-white text-xs rounded-full flex items-center justify-center font-bold"
              style={{ background: '#d4af37', color: '#0a1628' }}
            >
              {notifCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-6 mx-1" style={{ background: 'rgba(30,58,110,0.12)' }} />

        {/* User menu */}
        <Menu as="div" className="relative">
          <Menu.Button
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all"
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,58,110,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-navy-900"
              style={{ background: 'linear-gradient(135deg, #edc74a 0%, #c9a227 100%)' }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-semibold text-navy-800">{user?.name || 'User'}</span>
            <ChevronDownIcon className="w-3.5 h-3.5 text-navy-400" />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Menu.Items
              className="absolute right-0 mt-1.5 w-52 rounded-xl py-1 z-50"
              style={{
                background: '#fdf9f4',
                border: '1px solid rgba(30,58,110,0.12)',
                boxShadow: '0 8px 32px rgba(10,22,40,0.12), 0 2px 8px rgba(10,22,40,0.06)',
              }}
            >
              {/* User info header */}
              <div className="px-4 py-2.5 border-b" style={{ borderColor: 'rgba(30,58,110,0.08)' }}>
                <p className="text-xs font-semibold text-navy-800 truncate">{user?.name}</p>
                <p className="text-xs text-navy-400 truncate">{user?.email}</p>
              </div>

              <Menu.Item>{({ active }) => (
                <button
                  className={clsx('flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-medium transition-colors', active ? 'bg-tan-100 text-navy-900' : 'text-navy-700')}
                  onClick={() => navigate('/settings')}
                >
                  <UserIcon className="w-4 h-4 text-navy-400" />
                  Profile
                </button>
              )}</Menu.Item>

              <Menu.Item>{({ active }) => (
                <button
                  className={clsx('flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-medium transition-colors', active ? 'bg-tan-100 text-navy-900' : 'text-navy-700')}
                  onClick={() => navigate('/settings')}
                >
                  <Cog6ToothIcon className="w-4 h-4 text-navy-400" />
                  Settings
                </button>
              )}</Menu.Item>

              <div className="my-1 border-t" style={{ borderColor: 'rgba(30,58,110,0.08)' }} />

              <Menu.Item>{({ active }) => (
                <button
                  className={clsx('flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-medium transition-colors', active ? 'bg-red-50 text-red-700' : 'text-red-600')}
                  onClick={handleLogout}
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Sign out
                </button>
              )}</Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
};
