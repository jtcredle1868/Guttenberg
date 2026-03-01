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
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-0.5">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                {b.href ? (
                  <button onClick={() => navigate(b.href!)} className="hover:text-gray-600">{b.label}</button>
                ) : (
                  <span>{b.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
          <BellIcon className="w-5 h-5" />
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {notifCount}
            </span>
          )}
        </button>

        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </Menu.Button>
          <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <Menu.Items className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              <Menu.Item>{({ active }) => (
                <button className={clsx('flex items-center gap-2 w-full px-4 py-2 text-sm', active ? 'bg-gray-50 text-gray-900' : 'text-gray-700')} onClick={() => navigate('/settings')}>
                  <UserIcon className="w-4 h-4" /> Profile
                </button>
              )}</Menu.Item>
              <Menu.Item>{({ active }) => (
                <button className={clsx('flex items-center gap-2 w-full px-4 py-2 text-sm', active ? 'bg-gray-50 text-gray-900' : 'text-gray-700')} onClick={() => navigate('/settings')}>
                  <Cog6ToothIcon className="w-4 h-4" /> Settings
                </button>
              )}</Menu.Item>
              <div className="border-t border-gray-100 my-1" />
              <Menu.Item>{({ active }) => (
                <button className={clsx('flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600', active ? 'bg-red-50' : '')} onClick={handleLogout}>
                  <ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign out
                </button>
              )}</Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
};
