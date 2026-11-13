import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Briefcase, UploadCloud } from 'lucide-react';
import { PortfolioSnapshot, PortfolioStock } from '../types/portfolio.types';
import { calculateStockSummary } from '../utils/calculations';
import { formatDate } from '../utils/date';
import { HoldingsTable } from '../components/portfolio/HoldingsTable';
import { PortfolioKpiStrip } from '../components/portfolio/PortfolioKpiStrip';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface OutletContextType {
  snapshots: PortfolioSnapshot[];
  latestSnapshot: PortfolioSnapshot | null;
  refetch: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const Holdings: React.FC = () => {
  const { latestSnapshot, refetch, loading, error } = useOutletContext<OutletContextType>();

  const stocks: PortfolioStock[] = latestSnapshot?.data || [];
  const summary = calculateStockSummary(stocks);

  if (loading && !latestSnapshot) {
    return <LoadingSpinner size="lg" label="Loading portfolio holdings..." />;
  }

  if (error && !latestSnapshot) {
    return <ErrorState message={error} onRetry={refetch} isRetrying={loading} />;
  }

  if (stocks.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Active Holdings</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            View all current stock holdings and live valuations from your latest snapshot.
          </p>
        </div>
        <EmptyState
          title="No Active Holdings Found"
          description="You don't have any holdings saved in the system yet. Upload a screenshot to generate your active holdings portfolio."
          actionText="Upload Portfolio Screenshot"
          actionHref="/upload"
          icon={Briefcase}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Portfolio Holdings</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Active holdings from latest snapshot on{' '}
            <span className="font-semibold text-[var(--text-primary)]">
              {formatDate(latestSnapshot?.date, 'DD MMMM YYYY')}
            </span>
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-[var(--accent-contrast)] text-xs font-semibold rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" aria-hidden="true" />
          Update Holdings
        </Link>
      </div>

      {/* Unified KPI Summary Strip */}
      <PortfolioKpiStrip
        totalCurrentValue={summary.totalCurrentValue}
        totalReferenceValue={summary.totalReferenceValue}
        totalDifference={summary.totalDifference}
        percentageChange={summary.percentageChange}
      />

      {/* Unified Holdings Table with Search & Sort */}
      <HoldingsTable
        stocks={stocks}
        title="All Active Positions"
        searchable
        searchPlaceholder="Filter by company name or ticker..."
      />
    </div>
  );
};
