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
    ? 'bg-[var(--status-success)]/10 text-[var(--status-success)] border-[var(--status-success)]/30'
    : isNegative
    ? 'bg-[var(--status-error)]/10 text-[var(--status-error)] border-[var(--status-error)]/30'
    : 'bg-[var(--bg-elevated)]/60 text-[var(--text-secondary)] border-[var(--border-default)]';

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-1.5',
  };

  const iconSize = size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-medium font-mono ${colorStyles} ${sizeStyles[size]}`}
    >
      {isPositive ? (
        <ArrowUpRight className={iconSize} aria-hidden="true" />
      ) : isNegative ? (
        <ArrowDownRight className={iconSize} aria-hidden="true" />
      ) : (
        <Minus className={iconSize} aria-hidden="true" />
      )}
      <span>{formatPercentage(percentage)}</span>
      {showDifference && difference !== undefined && (
        <span className="opacity-85 ml-0.5">({formatINR(difference, { showSign: true })})</span>
      )}
    </span>
  );
};
