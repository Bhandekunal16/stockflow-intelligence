import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';
import { PortfolioStock } from '../../types/portfolio.types';
import { calculateDifference, calculatePercentageChange } from '../../utils/calculations';
import { formatINR, formatPercentage } from '../../utils/currency';

interface TopPerformersListProps {
  stocks: PortfolioStock[];
}

export const TopPerformersList: React.FC<TopPerformersListProps> = ({ stocks }) => {
  const analyzed = stocks.map((stock) => ({
    ...stock,
    difference: calculateDifference(stock.currentValue, stock.referenceValue),
    percentage: calculatePercentageChange(stock.currentValue, stock.referenceValue),
  }));

  const bestPerforming = [...analyzed]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3);

  const worstPerforming = [...analyzed]
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Best Performing */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              aria-hidden="true"
              className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center"
            >
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Top Gainers</h4>
              <p className="text-xs text-slate-500">Highest percentage return</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            Outperforming
          </span>
        </div>

        <div className="space-y-3">
          {bestPerforming.map((stock, i) => (
            <div
              key={`${stock.company}-best-${i}`}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="min-w-0 pr-3">
                <p className="text-xs font-bold text-slate-900 truncate">{stock.company}</p>
                <p className="text-xs text-slate-600 font-mono mt-0.5">
                  {stock.shares} shares • Val: {formatINR(stock.currentValue)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span
                  className={`inline-flex items-center text-xs font-bold font-mono ${
                    stock.percentage >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {stock.percentage >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" aria-hidden="true" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" aria-hidden="true" />
                  )}
                  {formatPercentage(stock.percentage)}
                </span>
                <p
                  className={`text-xs font-mono font-medium ${
                    stock.difference >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {formatINR(stock.difference, { showSign: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Worst Performing */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              aria-hidden="true"
              className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 flex items-center justify-center"
            >
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Underperforming Stocks</h4>
              <p className="text-xs text-slate-500">Lowest percentage return</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
            Drawdown
          </span>
        </div>

        <div className="space-y-3">
          {worstPerforming.map((stock, i) => (
            <div
              key={`${stock.company}-worst-${i}`}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="min-w-0 pr-3">
                <p className="text-xs font-bold text-slate-900 truncate">{stock.company}</p>
                <p className="text-xs text-slate-600 font-mono mt-0.5">
                  {stock.shares} shares • Val: {formatINR(stock.currentValue)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span
                  className={`inline-flex items-center text-xs font-bold font-mono ${
                    stock.percentage >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {stock.percentage >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" aria-hidden="true" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" aria-hidden="true" />
                  )}
                  {formatPercentage(stock.percentage)}
                </span>
                <p
                  className={`text-xs font-mono font-medium ${
                    stock.difference >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {formatINR(stock.difference, { showSign: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
