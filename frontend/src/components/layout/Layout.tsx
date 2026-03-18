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
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(160deg, #050d1a 0%, #0a1628 50%, #0f2040 100%)',
      }}
    >
      {/* Subtle background texture */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%230a1628'/%3E%3Crect x='0' y='0' width='1' height='1' fill='%230d1b2e' opacity='0.4'/%3E%3Crect x='2' y='2' width='1' height='1' fill='%230d1b2e' opacity='0.4'/%3E%3C/svg%3E\")",
          opacity: 0.8,
          zIndex: 0,
        }}
      />

      <Sidebar />

      <div
        className={clsx(
          'relative z-10 transition-all duration-300 ease-in-out flex flex-col min-h-screen',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <Header title={title} breadcrumbs={breadcrumbs} />

        <main className="flex-1 p-5 xl:p-6 animate-fade-in">
          {children}
        </main>

        {/* Footer */}
        <footer
          className="px-6 py-3 text-xs flex items-center justify-between"
          style={{
            borderTop: '1px solid rgba(61,96,128,0.15)',
            color: 'rgba(90,127,160,0.45)',
          }}
        >
          <span>© 2024 Guttenberg Publishing Platform</span>
          <span style={{ fontFamily: '"Source Code Pro", monospace', fontSize: '0.65rem' }}>
            v1.0.0
          </span>
        </footer>
      </div>
    </div>
  );
};
