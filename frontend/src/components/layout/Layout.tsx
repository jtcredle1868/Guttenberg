import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useApp } from '../../context/AppContext';
import clsx from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export const Layout = ({ children, title, breadcrumbs }: LayoutProps) => {
  const { sidebarCollapsed } = useApp();

  return (
    <div className="min-h-screen" style={{ background: '#f0dfc8' }}>
      <Sidebar />
      <div className={clsx('transition-all duration-300', sidebarCollapsed ? 'ml-16' : 'ml-64')}>
        <Header title={title} breadcrumbs={breadcrumbs} />
        <main className="p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
};
