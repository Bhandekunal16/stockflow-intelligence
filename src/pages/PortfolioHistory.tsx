import React, { useState, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  History,
  Calendar,
  ArrowRight,
  GitCompare,
  X,
  UploadCloud,
} from 'lucide-react';
import { PortfolioSnapshot } from '../types/portfolio.types';
import { calculateStockSummary, calculatePercentageChange } from '../utils/calculations';
import { formatINR } from '../utils/currency';
import { formatDate } from '../utils/date';
import { StatBadge } from '../components/common/StatBadge';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';

interface OutletContextType {
  snapshots: PortfolioSnapshot[];
  refetch: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const PortfolioHistory: React.FC = () => {
  const { snapshots, refetch, loading, error } = useOutletContext<OutletContextType>();

  const [dateSearch, setDateSearch] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const processedSnapshots = useMemo(() => {
    return snapshots.map((snap) => {
      const summary = calculateStockSummary(snap.data || []);
      return {
        ...snap,
        ...summary,
      };
    });
  }, [snapshots]);

  const filtered = useMemo(() => {
    return [...processedSnapshots]
      .filter((s) => s.date.includes(dateSearch.trim()))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [processedSnapshots, dateSearch]);

  const toggleCompareDate = (date: string) => {
    if (selectedForCompare.includes(date)) {
      setSelectedForCompare(selectedForCompare.filter((d) => d !== date));
    } else if (selectedForCompare.length >= 2) {
      setSelectedForCompare([selectedForCompare[1], date]);
    } else {
      setSelectedForCompare([...selectedForCompare, date]);
    }
  };

  const compareData = useMemo(() => {
    if (selectedForCompare.length !== 2) return null;
    const snapA = processedSnapshots.find((s) => s.date === selectedForCompare[0]);
    const snapB = processedSnapshots.find((s) => s.date === selectedForCompare[1]);
    if (!snapA || !snapB) return null;

    const [earlier, later] = [snapA, snapB].sort((a, b) => a.date.localeCompare(b.date));
    const valueDelta = later.totalCurrentValue - earlier.totalCurrentValue;
    const valueDeltaPct = calculatePercentageChange(
      later.totalCurrentValue,
      earlier.totalCurrentValue
    );

    return { earlier, later, valueDelta, valueDeltaPct };
  }, [selectedForCompare, processedSnapshots]);

  if (loading && snapshots.length === 0) {
    return <LoadingSpinner size="lg" label="Loading portfolio history snapshots..." />;
  }

  if (error && snapshots.length === 0) {
    return <ErrorState message={error} onRetry={refetch} isRetrying={loading} />;
  }

  if (snapshots.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Portfolio History</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Browse and inspect all historical portfolio snapshots indexed by date.
          </p>
        </div>
        <EmptyState
          title="No Historical Snapshots Recorded"
          description="Every time you upload a portfolio screenshot, a snapshot is saved for that date. Upload your first snapshot to start tracking your timeline."
          actionText="Upload Snapshot"
          actionHref="/upload"
          icon={History}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Portfolio History</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {snapshots.length} historical snapshot{snapshots.length !== 1 ? 's' : ''} stored in
            Asia/Kolkata timezone
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-[var(--accent-contrast)] text-xs font-semibold rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" aria-hidden="true" />
          Upload New Snapshot
        </Link>
      </div>

      {/* Filter & Compare Toolbar Card */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[var(--border-default)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Date Search & Date Picker */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <label htmlFor="history-date-filter" className="sr-only">
                Filter snapshots by date
              </label>
              <Calendar
                className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="history-date-filter"
                type="text"
                value={dateSearch}
                onChange={(e) => setDateSearch(e.target.value)}
                placeholder="Filter by YYYY-MM-DD..."
                className="w-full min-h-[40px] pl-9 pr-9 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/25 focus:border-[var(--accent-primary)] transition-colors"
              />
              {dateSearch && (
                <button
                  type="button"
                  onClick={() => setDateSearch('')}
                  aria-label="Clear date filter"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="relative">
              <label htmlFor="history-date-picker" className="sr-only">
                Pick specific date
              </label>
              <input
                id="history-date-picker"
                type="date"
                value={/^\d{4}-\d{2}-\d{2}$/.test(dateSearch) ? dateSearch : ''}
                onChange={(e) => setDateSearch(e.target.value)}
                className="min-h-[40px] px-3 py-2 text-xs text-[var(--text-primary)] bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/25 focus:border-[var(--accent-primary)]"
              />
            </div>
          </div>

          {/* Comparison Action Status */}
          <div className="flex flex-wrap items-center gap-2.5">
            {selectedForCompare.length === 0 && (
              <span className="text-xs text-[var(--text-secondary)]">
                Select any 2 dates to compare performance
              </span>
            )}
            {selectedForCompare.length === 1 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-medium border border-[var(--accent-primary)]/30">
                  {selectedForCompare[0]} selected — choose 1 more
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedForCompare([])}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline cursor-pointer px-1 py-1"
                >
                  Clear
                </button>
              </div>
            )}
            {selectedForCompare.length === 2 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompareModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-[var(--accent-contrast)] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <GitCompare className="w-4 h-4" aria-hidden="true" />
                  <span>Compare ({selectedForCompare.join(' vs ')})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedForCompare([])}
                  aria-label="Clear comparison selection"
                  className="px-3 py-2 min-h-[40px] rounded-xl border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] text-xs font-semibold cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Snapshots Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[var(--bg-canvas)]/70 text-[var(--text-secondary)] uppercase tracking-wider font-semibold border-b border-[var(--border-default)]">
              <tr>
                <th scope="col" className="py-3 px-4 text-center w-16">
                  Compare
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6 whitespace-nowrap">
                  Snapshot Date
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6 text-center whitespace-nowrap">
                  Holdings
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                  Total Current Value
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                  Reference Capital
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                  Difference (P&L)
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                  % Change
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6 text-center whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 px-6 text-center text-[var(--text-secondary)]">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      No snapshots match &ldquo;{dateSearch}&rdquo;
                    </p>
                    <button
                      type="button"
                      onClick={() => setDateSearch('')}
                      className="mt-3 px-4 py-2 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)]/80 text-[var(--text-primary)] text-xs font-semibold cursor-pointer"
                    >
                      Show All Snapshots
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((snap) => {
                  const isChecked = selectedForCompare.includes(snap.date);
                  const checkboxId = `compare-${snap._id}`;
                  return (
                    <tr
                      key={snap._id}
                      className={`hover:bg-[var(--bg-elevated)]/40 transition-colors ${
                        isChecked ? 'bg-[var(--accent-primary)]/10' : ''
                      }`}
                    >
                      <td className="py-2 px-2 text-center">
                        <label
                          htmlFor={checkboxId}
                          className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer rounded-lg hover:bg-[var(--bg-elevated)]/60"
                        >
                          <input
                            id={checkboxId}
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCompareDate(snap.date)}
                            aria-label={`Select snapshot ${snap.date} for comparison`}
                            className="w-4 h-4 rounded border-[var(--border-default)] accent-[var(--accent-primary)] cursor-pointer"
                          />
                        </label>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-[var(--text-primary)] whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[var(--accent-primary)] flex-shrink-0" aria-hidden="true" />
                          <span>{formatDate(snap.date, 'DD MMMM YYYY')}</span>
                          <span className="text-[11px] font-normal text-[var(--text-secondary)] font-mono">
                            ({snap.date})
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-center font-mono font-medium text-[var(--text-secondary)] whitespace-nowrap">
                        {snap.totalStocks} stocks
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-bold text-[var(--text-primary)] whitespace-nowrap">
                        {formatINR(snap.totalCurrentValue)}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right font-mono text-[var(--text-secondary)] whitespace-nowrap">
                        {formatINR(snap.totalReferenceValue)}
                      </td>
                      <td
                        className={`py-3.5 px-4 sm:px-6 text-right font-mono font-semibold whitespace-nowrap ${
                          snap.totalDifference >= 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'
                        }`}
                      >
                        {formatINR(snap.totalDifference, { showSign: true })}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <StatBadge percentage={snap.percentageChange} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                        <Link
                          to={`/history/${snap.date}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[36px] rounded-xl bg-[var(--bg-elevated)]/70 hover:bg-[var(--accent-primary)] hover:text-[var(--accent-contrast)] text-[var(--text-primary)] font-semibold text-xs transition-colors cursor-pointer"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accessible Side-by-Side Comparison Modal */}
      <Modal
        isOpen={showCompareModal && Boolean(compareData)}
        onClose={() => setShowCompareModal(false)}
        title="Portfolio Performance Comparison"
        titleId="compare-modal-title"
        icon={<GitCompare className="w-5 h-5 text-[var(--accent-primary)]" aria-hidden="true" />}
        footer={
          <button
            type="button"
            onClick={() => setShowCompareModal(false)}
            className="px-4 py-2 min-h-[40px] rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)]/80 text-[var(--text-primary)] font-semibold text-xs transition-colors cursor-pointer"
          >
            Close Comparison
          </button>
        }
      >
        {compareData && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] text-xs">
                <span className="text-[var(--text-secondary)] font-semibold uppercase tracking-wider text-[11px]">
                  Baseline Snapshot
                </span>
                <h4 className="text-base font-bold text-[var(--text-primary)] mt-1">
                  {formatDate(compareData.earlier.date, 'DD MMM YYYY')}
                </h4>
                <div className="mt-3 space-y-1.5 font-mono">
                  <p className="flex justify-between">
                    <span className="text-[var(--text-secondary)] font-sans">Value:</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {formatINR(compareData.earlier.totalCurrentValue)}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-[var(--text-secondary)] font-sans">Holdings:</span>
                    <span className="text-[var(--text-secondary)]">{compareData.earlier.totalStocks} stocks</span>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--accent-primary)]/50 text-xs">
                <span className="text-[var(--accent-primary)] font-semibold uppercase tracking-wider text-[11px]">
                  Comparison Snapshot
                </span>
                <h4 className="text-base font-bold text-[var(--text-primary)] mt-1">
                  {formatDate(compareData.later.date, 'DD MMM YYYY')}
                </h4>
                <div className="mt-3 space-y-1.5 font-mono">
                  <p className="flex justify-between">
                    <span className="text-[var(--text-secondary)] font-sans">Value:</span>
                    <span className="font-bold text-[var(--accent-primary)]">
                      {formatINR(compareData.later.totalCurrentValue)}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-[var(--text-secondary)] font-sans">Holdings:</span>
                    <span className="text-[var(--text-secondary)]">{compareData.later.totalStocks} stocks</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-elevated)]/50 border border-[var(--border-default)] text-[var(--text-primary)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[var(--text-secondary)] uppercase tracking-wider font-semibold text-[11px]">
                  Period Portfolio Valuation Delta
                </span>
                <h4
                  className={`text-lg font-bold font-mono mt-0.5 ${
                    compareData.valueDelta >= 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'
                  }`}
                >
                  {formatINR(compareData.valueDelta, { showSign: true })}
                </h4>
              </div>
              <div>
                <StatBadge percentage={compareData.valueDeltaPct} size="lg" />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
