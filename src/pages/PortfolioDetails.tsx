import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { portfolioService } from '../services/portfolio.service';
import { PortfolioSnapshot } from '../types/portfolio.types';
import { calculateStockSummary } from '../utils/calculations';
import { formatDate } from '../utils/date';
import { HoldingsTable } from '../components/portfolio/HoldingsTable';
import { PortfolioKpiStrip } from '../components/portfolio/PortfolioKpiStrip';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface OutletContextType {
  snapshots?: PortfolioSnapshot[];
}

export const PortfolioDetails: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const context = useOutletContext<OutletContextType>();
  const snapshots = Array.isArray(context?.snapshots) ? context.snapshots : [];

  const [snapshot, setSnapshot] = useState<PortfolioSnapshot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;
    let isMounted = true;

    async function loadSnapshot() {
      try {
        setLoading(true);
        setError(null);
        const res = await portfolioService.getSnapshotByDate(date!);
        if (isMounted) {
          if (res.success && res.data) {
            let snapItem: PortfolioSnapshot | null = null;
            if (Array.isArray(res.data)) {
              snapItem = res.data.find((s: any) => s.date === date) || res.data[0] || null;
            } else {
              snapItem = res.data;
            }

            if (snapItem) {
              setSnapshot({
                ...snapItem,
                date: snapItem.date || date!,
                data: Array.isArray(snapItem.data) ? snapItem.data : [],
              });
            } else {
              setError(`No portfolio snapshot found for date: ${date}`);
            }
          } else {
            setError(res.message || `No portfolio snapshot found for date: ${date}`);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || `No portfolio snapshot found for date: ${date}`);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSnapshot();

    return () => {
      isMounted = false;
    };
  }, [date]);

  // Compute chronologically sorted snapshot dates for Previous / Next navigation
  const dateNav = useMemo(() => {
    if (!date || snapshots.length === 0) return { prev: null, next: null };
    const dates = [...snapshots].map((s) => s.date).sort();
    const currentIndex = dates.indexOf(date);
    if (currentIndex === -1) return { prev: null, next: null };

    return {
      prev: currentIndex > 0 ? dates[currentIndex - 1] : null,
      next: currentIndex < dates.length - 1 ? dates[currentIndex + 1] : null,
    };
  }, [date, snapshots]);

  const rawStocks = useMemo(() => {
    return Array.isArray(snapshot?.data) ? snapshot.data : [];
  }, [snapshot]);

  const summary = useMemo(() => {
    return calculateStockSummary(rawStocks);
  }, [rawStocks]);

  if (loading) {
    return <LoadingSpinner size="lg" label={`Loading portfolio snapshot for ${date}...`} />;
  }

  if (error || !snapshot) {
    return (
      <div
        role="alert"
        className="bg-[var(--bg-card)] p-10 rounded-2xl border border-[var(--border-default)] text-center max-w-lg mx-auto space-y-4"
      >
        <div
          aria-hidden="true"
          className="w-12 h-12 rounded-xl bg-[var(--status-error)]/10 border border-[var(--status-error)]/30 text-[var(--status-error)] flex items-center justify-center mx-auto"
        >
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Snapshot Not Found</h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {error || `Unable to locate portfolio records for ${date}.`}
        </p>
        <Link
          to="/history"
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-[var(--accent-contrast)] rounded-xl text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to History
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation & Date Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/history"
            aria-label="Back to portfolio history"
            title="Back to History"
            className="p-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--accent-primary)]" aria-hidden="true" />
              <span>Snapshot: {formatDate(snapshot.date || date, 'DD MMMM YYYY')}</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
              Key: {snapshot.date || date} • Captured in Asia/Kolkata timezone
            </p>
          </div>
        </div>

        {/* Previous / Next Snapshot Navigation */}
        <nav aria-label="Snapshot date navigation" className="flex items-center gap-2">
          {dateNav.prev && (
            <button
              type="button"
              onClick={() => navigate(`/history/${dateNav.prev}`)}
              className="flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] text-xs font-semibold transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              <span>Prev ({dateNav.prev})</span>
            </button>
          )}

          {dateNav.next && (
            <button
              type="button"
              onClick={() => navigate(`/history/${dateNav.next}`)}
              className="flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Next ({dateNav.next})</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </nav>
      </div>

      {/* Unified KPI Strip */}
      <PortfolioKpiStrip
        totalCurrentValue={summary.totalCurrentValue}
        totalReferenceValue={summary.totalReferenceValue}
        totalDifference={summary.totalDifference}
        percentageChange={summary.percentageChange}
      />

      {/* Unified Holdings Table */}
      <HoldingsTable
        stocks={rawStocks}
        title="Snapshot Holdings Breakdown"
        subtitle={`Recorded Holdings: ${rawStocks.length}`}
        searchable
        searchPlaceholder="Search holding name or ticker..."
      />
    </div>
  );
};
