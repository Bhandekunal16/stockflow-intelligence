import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { PortfolioSnapshot } from '../types/portfolio.types';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { PerformanceChart } from '../components/dashboard/PerformanceChart';
import { HoldingsTable } from '../components/portfolio/HoldingsTable';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { UploadCloud, Sparkles } from 'lucide-react';
import { getPortfolioSummaryFromSnapshots } from '../utils/calculations';
import { formatDate } from '../utils/date';

interface OutletContextType {
  snapshots: PortfolioSnapshot[];
  latestSnapshot: PortfolioSnapshot | null;
  refetch: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const Dashboard: React.FC = () => {
  const { snapshots, latestSnapshot, refetch, loading, error } =
    useOutletContext<OutletContextType>();

  const metrics = getPortfolioSummaryFromSnapshots(snapshots);
  const hasData = snapshots.length > 0 && (latestSnapshot?.data?.length ?? 0) > 0;

  if (loading && snapshots.length === 0) {
    return <LoadingSpinner size="lg" label="Retrieving portfolio metrics..." />;
  }

  if (error && snapshots.length === 0) {
    return <ErrorState message={error} onRetry={refetch} isRetrying={loading} />;
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-indigo-100 text-xs font-semibold backdrop-blur-xs mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
              Automated Portfolio Intelligence
            </span>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              Track your investments with AI Screenshot Extraction
            </h2>
            <p className="text-indigo-100 text-sm mt-2 leading-relaxed">
              Upload your brokerage portfolio screenshots (Zerodha, Groww, Upstox, Angel One, or
              global brokers). StockFolio instantly extracts holdings, computes reference values,
              and indexes daily snapshots in Asia/Kolkata timezone.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-white text-indigo-900 text-sm font-bold rounded-xl shadow-sm hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                Upload First Screenshot
              </Link>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"
          />
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
    <div className="space-y-6 sm:space-y-8">
      {/* Top Banner / Streamlined Primary Action (Hick's Law) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Portfolio Executive Summary</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Active snapshot as of{' '}
            <span className="font-semibold text-slate-800">
              {formatDate(metrics.lastUpdatedDate, 'DD MMM YYYY')}
            </span>{' '}
            (Asia/Kolkata)
          </p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" aria-hidden="true" />
          Upload Today&apos;s Snapshot
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <SummaryCards metrics={metrics} />

      {/* Charts & Visual Analytics */}
      <PerformanceChart snapshots={snapshots} />

      {/* Top Holdings Table */}
      {latestSnapshot && latestSnapshot.data && (
        <HoldingsTable
          stocks={latestSnapshot.data}
          title="Top Portfolio Holdings"
          subtitle="Ranked by valuation with real-time profit and loss metrics"
          limit={5}
          defaultShowAll={latestSnapshot.data.length <= 10}
          showAllLink
        />
      )}
    </div>
  );
};
