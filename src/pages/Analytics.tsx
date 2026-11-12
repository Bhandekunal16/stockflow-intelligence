import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  UploadCloud,
  Layers,
  Award,
} from 'lucide-react';
import { PortfolioSnapshot } from '../types/portfolio.types';
import { AllocationPieChart } from '../components/charts/AllocationPieChart';
import { CurrentVsRefBarChart } from '../components/charts/CurrentVsRefBarChart';
import { TopPerformersList } from '../components/charts/TopPerformersList';
import { PerformanceChart } from '../components/dashboard/PerformanceChart';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { calculateStockSummary } from '../utils/calculations';
import { formatINR, formatPercentage } from '../utils/currency';
import { formatDate } from '../utils/date';

interface OutletContextType {
  snapshots: PortfolioSnapshot[];
  latestSnapshot: PortfolioSnapshot | null;
  loading: boolean;
}

export const Analytics: React.FC = () => {
  const { snapshots, latestSnapshot, loading } = useOutletContext<OutletContextType>();

  const stocks = latestSnapshot?.data || [];
  const hasData = snapshots.length > 0 && stocks.length > 0;

  if (loading && snapshots.length === 0) {
    return <LoadingSpinner size="lg" label="Generating portfolio analytics..." />;
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Portfolio Analytics</h2>
          <p className="text-xs text-slate-500 mt-1">
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

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Portfolio Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Deep financial analytics powered by {snapshots.length} historical snapshot{snapshots.length > 1 ? 's' : ''}
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          Update Portfolio
        </Link>
      </div>

      {/* Snapshot High-Level Stat Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Valuation
          </span>
          <h3 className="text-xl font-bold font-mono text-indigo-600 mt-1">
            {formatINR(summary.totalCurrentValue)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Snapshot: {formatDate(latestSnapshot?.date, 'DD MMM YYYY')}
          </p>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Invested Capital
          </span>
          <h3 className="text-xl font-bold font-mono text-slate-700 mt-1">
            {formatINR(summary.totalReferenceValue)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Reference cost basis</p>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Overall Unrealized Return
          </span>
          <h3
            className={`text-xl font-bold font-mono mt-1 ${
              summary.totalDifference >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatINR(summary.totalDifference, { showSign: true })}
          </h3>
          <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
            {formatPercentage(summary.percentageChange)} total return
          </p>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Diversification
          </span>
          <h3 className="text-xl font-bold font-mono text-slate-800 mt-1">
            {stocks.length} Holdings
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Individual asset positions</p>
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
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Historical Portfolio Growth</h3>
        </div>
        <PerformanceChart snapshots={snapshots} />
      </div>
    </div>
  );
};
