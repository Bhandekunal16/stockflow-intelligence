import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { PortfolioSnapshot } from '../types/portfolio.types';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { PerformanceChart } from '../components/dashboard/PerformanceChart';
import { TopHoldingsTable } from '../components/dashboard/TopHoldingsTable';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { UploadCloud, Sparkles, ArrowRight } from 'lucide-react';
import { getPortfolioSummaryFromSnapshots } from '../utils/calculations';

interface OutletContextType {
  snapshots: PortfolioSnapshot[];
  latestSnapshot: PortfolioSnapshot | null;
  refetch: () => Promise<void>;
  loading: boolean;
}

export const Dashboard: React.FC = () => {
  const { snapshots, latestSnapshot, loading } = useOutletContext<OutletContextType>();

  const metrics = getPortfolioSummaryFromSnapshots(snapshots);
  const hasData = snapshots.length > 0 && (latestSnapshot?.data?.length ?? 0) > 0;

  if (loading && snapshots.length === 0) {
    return <LoadingSpinner size="lg" label="Retrieving portfolio metrics..." />;
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white p-8 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-100 text-xs font-semibold backdrop-blur-xs mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Automated Portfolio Intelligence
            </span>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              Track your investments with AI Screenshot Extraction
            </h2>
            <p className="text-indigo-200 text-sm mt-2 leading-relaxed">
              Upload your brokerage portfolio screenshots (Zerodha, Groww, Upstox, Angel One, or
              global brokers). StockFolio instantly extracts holdings, computes reference values, and
              indexes daily snapshots in Asia/Kolkata timezone.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-900 text-sm font-bold rounded-xl shadow-sm hover:bg-indigo-50 transition-all cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-indigo-600" />
                Upload First Screenshot
              </Link>
            </div>
          </div>
          {/* Subtle decoration */}
          <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        </div>

        {/* Empty State Card */}
        <EmptyState
          title="No Portfolio Snapshots Recorded Yet"
          description="Your portfolio dashboard is waiting for its first screenshot upload. Upload a screenshot to generate your live valuation and historical tracking."
          actionText="Upload Portfolio Screenshot"
          actionHref="/upload"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner / Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Portfolio Executive Summary</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active snapshot as of{' '}
            <span className="font-semibold text-slate-700">{metrics.lastUpdatedDate}</span> (Asia/Kolkata)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Today's Snapshot
          </Link>
          <Link
            to="/holdings"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            All Holdings
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <SummaryCards metrics={metrics} />

      {/* Charts & Visual Analytics */}
      <div className="grid grid-cols-1 gap-6">
        <PerformanceChart snapshots={snapshots} />
      </div>

      {/* Top Holdings Table */}
      {latestSnapshot && latestSnapshot.data && (
        <TopHoldingsTable stocks={latestSnapshot.data} limit={5} />
      )}
    </div>
  );
};
