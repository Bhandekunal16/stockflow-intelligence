import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Activity,
  TrendingUp,
  UploadCloud,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
} from 'lucide-react';
import { PortfolioSnapshot } from '../types/portfolio.types';
import { AllocationLineChart } from '../components/charts/AllocationLineChart';
import { CurrentVsRefLineChart } from '../components/charts/CurrentVsRefLineChart';
import { TopPerformersList } from '../components/charts/TopPerformersList';
import { PerformanceChart } from '../components/dashboard/PerformanceChart';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { KpiCard } from '../components/common/KpiCard';
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
  const formattedCurrent = formatINR(summary.totalCurrentValue);
  const formattedReference = formatINR(summary.totalReferenceValue);
  const formattedDiff = formatINR(summary.totalDifference, { showSign: true });
  const formattedPct = formatPercentage(summary.percentageChange);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard
          title="Active Valuation"
          value={formattedCurrent}
          description={`Snapshot: ${formatDate(latestSnapshot?.date, 'DD MMM YYYY')}`}
          icon={Wallet}
          accent="violet"
          tooltip={`Active Valuation: ${formattedCurrent}`}
        />

        <KpiCard
          title="Invested Capital"
          value={formattedReference}
          description="Reference cost basis"
          icon={PiggyBank}
          accent="gray"
          tooltip={`Invested Capital: ${formattedReference}`}
        />

        <KpiCard
          title="Overall Unrealized Return"
          value={formattedDiff}
          description={
            <span>
              <span className={isPositive ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'}>
                {formattedPct}
              </span>{' '}
              <span>total return</span>
            </span>
          }
          icon={isPositive ? ArrowUpRight : ArrowDownRight}
          accent={isPositive ? 'green' : 'red'}
          valueTone={summary.totalDifference > 0 ? 'success' : summary.totalDifference < 0 ? 'error' : 'default'}
          tooltip={`Overall Unrealized Return: ${formattedDiff} (${formattedPct})`}
        />

        <KpiCard
          title="Diversification"
          value={stocks.length}
          description="Individual active positions"
          icon={Layers}
          accent="amber"
          to="/holdings"
          tooltip="View individual holdings"
        />
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
