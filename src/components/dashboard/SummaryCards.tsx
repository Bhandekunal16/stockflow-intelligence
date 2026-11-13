import React from 'react';
import {
  Wallet,
  Layers,
  Calendar,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { PortfolioSummaryMetrics } from '../../types/portfolio.types';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { StatBadge } from '../common/StatBadge';

interface SummaryCardsProps {
  metrics: PortfolioSummaryMetrics;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ metrics }) => {
  const {
    totalCurrentValue,
    totalReferenceValue,
    totalDifference,
    percentageChange,
    totalStocks,
    lastUpdatedDate,
  } = metrics;

  const isProfit = totalDifference >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* 1. Total Portfolio Value */}
      <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-default)] flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Total Current Value
          </span>
          <div
            aria-hidden="true"
            className="w-9 h-9 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] flex items-center justify-center text-[var(--accent-primary)] flex-shrink-0"
          >
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight font-mono">
            {formatINR(totalCurrentValue)}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Live market valuation</p>
        </div>
      </div>

      {/* 2. Total Reference Value */}
      <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-default)] flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Reference / Invested
          </span>
          <div
            aria-hidden="true"
            className="w-9 h-9 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] flex-shrink-0"
          >
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight font-mono">
            {formatINR(totalReferenceValue)}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Total invested capital</p>
        </div>
      </div>

      {/* 3. Total Investment Difference */}
      <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-default)] flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Net Difference (P&L)
          </span>
          <div
            aria-hidden="true"
            className={`w-9 h-9 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] flex items-center justify-center flex-shrink-0 ${
              isProfit ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'
            }`}
          >
            {isProfit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          </div>
        </div>
        <div>
          <h3
            className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${
              isProfit ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'
            }`}
          >
            {formatINR(totalDifference, { showSign: true })}
          </h3>
          <div className="mt-1.5">
            <StatBadge percentage={percentageChange} size="sm" />
          </div>
        </div>
      </div>

      {/* 4. Total Stocks */}
      <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-default)] flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Total Stocks
          </span>
          <div
            aria-hidden="true"
            className="w-9 h-9 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] flex items-center justify-center text-[var(--status-warning)] flex-shrink-0"
          >
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight font-mono">
            {totalStocks}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Unique active holdings</p>
        </div>
      </div>

      {/* 5. Last Updated Date */}
      <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-default)] flex flex-col justify-between sm:col-span-2 lg:col-span-2 xl:col-span-1">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Last Updated
          </span>
          <div
            aria-hidden="true"
            className="w-9 h-9 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] flex items-center justify-center text-[var(--status-info)] flex-shrink-0"
          >
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
            {lastUpdatedDate ? formatDate(lastUpdatedDate, 'DD MMM YYYY') : 'No snapshots'}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {lastUpdatedDate ? 'Asia/Kolkata indexed' : 'Awaiting first upload'}
          </p>
        </div>
      </div>
    </div>
  );
};
