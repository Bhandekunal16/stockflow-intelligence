import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { PieChart as PieIcon, TrendingUp, UploadCloud } from 'lucide-react';
import { PortfolioSnapshot } from '../types/portfolio.types';
import { AllocationPieChart } from '../components/charts/AllocationPieChart';
import { CurrentVsRefBarChart } from '../components/charts/CurrentVsRefBarChart';
import { TopPerformersList } from '../components/charts/TopPerformersList';
import { PerformanceChart } from '../components/dashboard/PerformanceChart';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { calculateStockSummary } from '../utils/calculations';
import { formatINR, formatPercentage } from '../utils/currency';
import { formatDate } from '../utils/date';

interface OutletContextType {
  snapshots: PortfolioSnapshot[];
  latestSnapshot: PortfolioSnapshot | null;
  refetch: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const Analytics: React.FC = () => {
  const { snapshots, latestSnapshot, refetch, loading, error } =
    useOutletContext<OutletContextType>();

  const stocks = latestSnapshot?.data || [];
  const hasData = snapshots.length > 0 && stocks.length > 0;

  if (loading && snapshots.length === 0) {
    return <LoadingSpinner size="lg" label="Generating portfolio analytics..." />;
  }

  if (error && snapshots.length === 0) {
    return <ErrorState message={error} onRetry={refetch} isRetrying={loading} />;
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Portfolio Analytics</h2>
          <p className="text-xs text-slate-600 mt-1">
            Visual breakdown of asset distribution, gainers/losers, and historical trajectory.
          </p>
        </div>
        <EmptyState
          title="No Analytics Available Yet"
          description="Analytics are computed from your verified screenshot extractions. Upload a portfolio screenshot to generate your visual charts."
          actionText="Upload Portfolio Screenshot"
          actionHref="/upload"
          icon={PieIcon}
        />
      </div>
    );
  }

  const summary = calculateStockSummary(stocks);
  const isPositive = summary.totalDifference >= 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Portfolio Analytics</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Deep financial analytics powered by {snapshots.length} historical snapshot
            {snapshots.length > 1 ? 's' : ''}
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" aria-hidden="true" />
          Update Portfolio
        </Link>
      </div>

      {/* Snapshot High-Level Stat Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Active Valuation
          </span>
          <h3 className="text-xl font-bold font-mono text-indigo-700 mt-1">
            {formatINR(summary.totalCurrentValue)}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Snapshot: {formatDate(latestSnapshot?.date, 'DD MMM YYYY')}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Invested Capital
          </span>
          <h3 className="text-xl font-bold font-mono text-slate-800 mt-1">
            {formatINR(summary.totalReferenceValue)}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Reference cost basis</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Overall Unrealized Return
          </span>
          <h3
            className={`text-xl font-bold font-mono mt-1 ${
              isPositive ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatINR(summary.totalDifference, { showSign: true })}
          </h3>
          <p
            className={`text-xs font-semibold mt-0.5 ${
              isPositive ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatPercentage(summary.percentageChange)} total return
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Diversification
          </span>
          <h3 className="text-xl font-bold font-mono text-slate-900 mt-1">
            {stocks.length} Holdings
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Individual asset positions</p>
        </div>
      </div>

      {/* Top 2 Visual Charts: Asset Allocation Pie & Current vs Reference Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AllocationPieChart stocks={stocks} />
        <CurrentVsRefBarChart stocks={stocks} topCount={6} />
      </div>

      {/* Top Gainers & Losers */}
      <TopPerformersList stocks={stocks} />

      {/* Historical Portfolio Growth Trend */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" aria-hidden="true" />
          <h3 className="text-base font-bold text-slate-900">Historical Portfolio Growth</h3>
        </div>
        <PerformanceChart snapshots={snapshots} />
      </div>
    </div>
  );
};
