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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-xs">
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
          Total Current Value
        </span>
        <p className="text-lg font-bold font-mono text-slate-900 mt-1">
          {formatINR(totalCurrentValue)}
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
          Reference Capital
        </span>
        <p className="text-lg font-bold font-mono text-slate-700 mt-1">
          {formatINR(totalReferenceValue)}
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
          Net Profit / Loss
        </span>
        <p
          className={`text-lg font-bold font-mono mt-1 ${
            isPositive ? 'text-emerald-700' : 'text-rose-700'
          }`}
        >
          {formatINR(totalDifference, { showSign: true })}
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
          Total Return
        </span>
        <div className="mt-1.5">
          <StatBadge percentage={percentageChange} size="md" />
        </div>
      </div>
    </div>
  );
};
