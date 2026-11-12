import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { formatPercentage, formatINR } from '../../utils/currency';

interface StatBadgeProps {
  percentage: number;
  difference?: number;
  size?: 'sm' | 'md' | 'lg';
  showDifference?: boolean;
}

export const StatBadge: React.FC<StatBadgeProps> = ({
  percentage,
  difference,
  size = 'md',
  showDifference = false,
}) => {
  const isPositive = percentage > 0.001;
  const isNegative = percentage < -0.001;

  const colorStyles = isPositive
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : isNegative
    ? 'bg-rose-50 text-rose-700 border-rose-200'
    : 'bg-slate-100 text-slate-700 border-slate-200';

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-1.5',
  };

  const iconSize = size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-medium ${colorStyles} ${sizeStyles[size]}`}
    >
      {isPositive ? (
        <ArrowUpRight className={iconSize} />
      ) : isNegative ? (
        <ArrowDownRight className={iconSize} />
      ) : (
        <Minus className={iconSize} />
      )}
      <span>{formatPercentage(percentage)}</span>
      {showDifference && difference !== undefined && (
        <span className="opacity-80 ml-0.5">({formatINR(difference, { showSign: true })})</span>
      )}
    </span>
  );
};
