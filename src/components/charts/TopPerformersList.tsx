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
      <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-default)]">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-2.5">
            <div
              aria-hidden="true"
              className="w-9 h-9 rounded-xl bg-[var(--status-success)]/10 border border-[var(--status-success)]/30 text-[var(--status-success)] flex items-center justify-center"
            >
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">Top Gainers</h4>
              <p className="text-xs text-[var(--text-secondary)]">Highest percentage return</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[var(--status-success)]/10 text-[var(--status-success)] border border-[var(--status-success)]/30">
            Outperforming
          </span>
        </div>

        <div className="space-y-3">
          {bestPerforming.map((stock, i) => (
            <div
              key={`${stock.company}-best-${i}`}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] hover:bg-[var(--bg-elevated)]/40 transition-colors"
            >
              <div className="min-w-0 pr-3">
                <p className="text-xs font-bold text-[var(--text-primary)] truncate">{stock.company}</p>
                <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                  {stock.shares} shares • Val: {formatINR(stock.currentValue)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span
                  className={`inline-flex items-center text-xs font-bold font-mono ${
                    stock.percentage >= 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'
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
                    stock.difference >= 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'
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
      <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-default)]">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-2.5">
            <div
              aria-hidden="true"
              className="w-9 h-9 rounded-xl bg-[var(--status-error)]/10 border border-[var(--status-error)]/30 text-[var(--status-error)] flex items-center justify-center"
            >
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">Underperforming Stocks</h4>
              <p className="text-xs text-[var(--text-secondary)]">Lowest percentage return</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[var(--status-error)]/10 text-[var(--status-error)] border border-[var(--status-error)]/30">
            Drawdown
          </span>
        </div>

        <div className="space-y-3">
          {worstPerforming.map((stock, i) => (
            <div
              key={`${stock.company}-worst-${i}`}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] hover:bg-[var(--bg-elevated)]/40 transition-colors"
            >
              <div className="min-w-0 pr-3">
                <p className="text-xs font-bold text-[var(--text-primary)] truncate">{stock.company}</p>
                <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                  {stock.shares} shares • Val: {formatINR(stock.currentValue)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span
                  className={`inline-flex items-center text-xs font-bold font-mono ${
                    stock.percentage >= 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'
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
                    stock.difference >= 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'
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
