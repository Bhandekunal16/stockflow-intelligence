import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Activity, TrendingUp, UploadCloud } from 'lucide-react';
import { PortfolioSnapshot } from '../types/portfolio.types';
import { AllocationLineChart } from '../components/charts/AllocationLineChart';
import { CurrentVsRefLineChart } from '../components/charts/CurrentVsRefLineChart';
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
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Portfolio Analytics</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Visual breakdown of asset distribution, gainers/losers, and historical trajectory.
          </p>
        </div>
        <EmptyState
          title="No Analytics Available Yet"
          description="Analytics are computed from your verified screenshot extractions. Upload a portfolio screenshot to generate your visual charts."
          actionText="Upload Portfolio Screenshot"
          actionHref="/upload"
          icon={Activity}
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
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Portfolio Analytics</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Deep financial analytics powered by {snapshots.length} historical snapshot
            {snapshots.length > 1 ? 's' : ''}
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-[var(--accent-contrast)] text-xs font-semibold rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" aria-hidden="true" />
          Update Portfolio
        </Link>
      </div>

      {/* Snapshot High-Level Stat Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-default)]">
        <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)]">
          <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Active Valuation
          </span>
          <h3 className="text-xl font-bold font-mono text-[var(--accent-primary)] mt-1">
            {formatINR(summary.totalCurrentValue)}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Snapshot: {formatDate(latestSnapshot?.date, 'DD MMM YYYY')}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)]">
          <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Invested Capital
          </span>
          <h3 className="text-xl font-bold font-mono text-[var(--text-primary)] mt-1">
            {formatINR(summary.totalReferenceValue)}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Reference cost basis</p>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)]">
          <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Overall Unrealized Return
          </span>
          <h3
            className={`text-xl font-bold font-mono mt-1 ${
              isPositive ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'
            }`}
          >
            {formatINR(summary.totalDifference, { showSign: true })}
          </h3>
          <p
            className={`text-xs font-semibold font-mono mt-0.5 ${
              isPositive ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'
            }`}
          >
            {formatPercentage(summary.percentageChange)} total return
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)]">
          <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Diversification
          </span>
          <h3 className="text-xl font-bold font-mono text-[var(--text-primary)] mt-1">
            {stocks.length} Holdings
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Individual asset positions</p>
        </div>
      </div>

      {/* Top 2 Visual Line Charts: Allocation Trajectory & Current vs Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AllocationLineChart
          stocks={stocks}
          snapshots={snapshots}
          snapshotDate={latestSnapshot?.date}
          snapshotTimestamp={latestSnapshot?.updatedAt || latestSnapshot?.createdAt}
        />
        <CurrentVsRefLineChart
          stocks={stocks}
          topCount={6}
          snapshotDate={latestSnapshot?.date}
          snapshotTimestamp={latestSnapshot?.updatedAt || latestSnapshot?.createdAt}
        />
      </div>

      {/* Top Gainers & Losers */}
      <TopPerformersList stocks={stocks} />

      {/* Historical Portfolio Growth Trend */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[var(--accent-primary)]" aria-hidden="true" />
          <h3 className="text-base font-bold text-[var(--text-primary)]">Historical Portfolio Growth</h3>
        </div>
        <PerformanceChart snapshots={snapshots} />
      </div>
    </div>
  );
};
