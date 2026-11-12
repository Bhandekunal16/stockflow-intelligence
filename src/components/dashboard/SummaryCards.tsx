import React from 'react';
import {
  Wallet,
  TrendingUp,
  Layers,
  Calendar,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { PortfolioSummaryMetrics } from '../../types/portfolio.types';
import { formatINR, formatPercentage } from '../../utils/currency';
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Portfolio Value */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Current Value
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {formatINR(totalCurrentValue)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Live market valuation</p>
        </div>
      </div>

      {/* 2. Total Reference Value */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Reference / Invested
          </span>
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-700 tracking-tight font-mono">
            {formatINR(totalReferenceValue)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Total invested capital</p>
        </div>
      </div>

      {/* 3. Total Investment Difference */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Net Difference (P&L)
          </span>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isProfit
                ? 'bg-emerald-50 border border-emerald-100 text-emerald-600'
                : 'bg-rose-50 border border-rose-100 text-rose-600'
            }`}
          >
            {isProfit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <h3
              className={`text-2xl font-bold font-mono tracking-tight ${
                isProfit ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatINR(totalDifference, { showSign: true })}
            </h3>
          </div>
          <div className="mt-1">
            <StatBadge percentage={percentageChange} size="sm" />
          </div>
        </div>
      </div>

      {/* 4. Total Stocks */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Stocks
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {totalStocks}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Unique active holdings</p>
        </div>
      </div>

      {/* 5. Last Updated Date */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Last Updated
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            {lastUpdatedDate ? formatDate(lastUpdatedDate, 'DD MMM YYYY') : 'No snapshots'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {lastUpdatedDate ? 'Asia/Kolkata indexed' : 'Awaiting first upload'}
          </p>
        </div>
      </div>
    </div>
  );
};
