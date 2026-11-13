import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useToast } from '../common/Toast';

export const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const { snapshots, latestSnapshot, refetch, loading, error } = usePortfolio();
  const { success, error: toastError } = useToast();

  const handleRefresh = async () => {
    await refetch();
    if (!error) {
      success('Portfolio Synchronized', 'Retrieved latest snapshot status from server.');
    } else {
      toastError('Sync Notice', 'Attempted to refresh portfolio records.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Skip to main content link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-xl focus:text-xs focus:font-semibold focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        holdingsCount={latestSnapshot?.data?.length || 0}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Header
          onRefresh={handleRefresh}
          isRefreshing={loading}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ snapshots, latestSnapshot, refetch, loading, error }} />
        </main>
      </div>
    </div>
  );
};
