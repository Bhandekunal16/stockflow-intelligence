import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useToast } from '../common/Toast';

export const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const { snapshots, latestSnapshot, refetch, loading } = usePortfolio();
  const { success } = useToast();

  const handleRefresh = async () => {
    await refetch();
    success('Portfolio Synchronized', 'Retrieved latest snapshot status from server.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        holdingsCount={latestSnapshot?.data?.length || 0}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        <Header onRefresh={handleRefresh} isRefreshing={loading} />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ snapshots, latestSnapshot, refetch, loading }} />
        </main>
      </div>
    </div>
  );
};
