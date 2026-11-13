import React from 'react';
import { formatINR } from '../../utils/currency';
import { StatBadge } from '../common/StatBadge';

interface PortfolioKpiStripProps {
  totalCurrentValue: number;
  totalReferenceValue: number;
  totalDifference: number;
  percentageChange: number;
  secondaryLabel?: string;
}

export const PortfolioKpiStrip: React.FC<PortfolioKpiStripProps> = ({
  totalCurrentValue,
  totalReferenceValue,
  totalDifference,
  percentageChange,
}) => {
  const isPositive = totalDifference >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-default)] text-xs">
      <div className="p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)]">
        <span className="text-[var(--text-secondary)] font-semibold uppercase tracking-wider text-[11px]">
          Total Current Value
        </span>
        <p className="text-lg font-bold font-mono text-[var(--text-primary)] mt-1">
          {formatINR(totalCurrentValue)}
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)]">
        <span className="text-[var(--text-secondary)] font-semibold uppercase tracking-wider text-[11px]">
          Reference Capital
        </span>
        <p className="text-lg font-bold font-mono text-[var(--text-secondary)] mt-1">
          {formatINR(totalReferenceValue)}
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)]">
        <span className="text-[var(--text-secondary)] font-semibold uppercase tracking-wider text-[11px]">
          Net Profit / Loss
        </span>
        <p
          className={`text-lg font-bold font-mono mt-1 ${
            isPositive ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'
          }`}
        >
          {formatINR(totalDifference, { showSign: true })}
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] flex flex-col justify-between">
        <span className="text-[var(--text-secondary)] font-semibold uppercase tracking-wider text-[11px]">
          Total Return
        </span>
        <div className="mt-1.5">
          <StatBadge percentage={percentageChange} size="md" />
        </div>
      </div>
    </div>
  );
};
