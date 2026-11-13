import React from 'react';
import {
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { formatINR, formatPercentage } from '../../utils/currency';
import { KpiCard } from '../common/KpiCard';

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
  secondaryLabel,
}) => {
  const isPositive = totalDifference >= 0;
  const isReturnPositive = percentageChange > 0.001;
  const isReturnNegative = percentageChange < -0.001;

  const returnIcon = isReturnPositive
    ? TrendingUp
    : isReturnNegative
      ? TrendingDown
      : Minus;

  const returnAccent = isReturnPositive ? 'green' : isReturnNegative ? 'red' : 'gray';

  const formattedCurrent = formatINR(totalCurrentValue);
  const formattedReference = formatINR(totalReferenceValue);
  const formattedDiff = formatINR(totalDifference, { showSign: true });
  const formattedPct = formatPercentage(percentageChange);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      <KpiCard
        title="Total Current Value"
        value={formattedCurrent}
        description={secondaryLabel || 'Current market valuation'}
        icon={Wallet}
        accent="violet"
        tooltip={`Total Current Value: ${formattedCurrent}`}
      />

      <KpiCard
        title="Reference Capital"
        value={formattedReference}
        description="Invested cost basis"
        icon={PiggyBank}
        accent="gray"
        tooltip={`Reference Capital: ${formattedReference}`}
      />

      <KpiCard
        title="Net Profit / Loss"
        value={formattedDiff}
        description={isPositive ? 'Net unrealized gain' : 'Net unrealized drawdown'}
        icon={isPositive ? ArrowUpRight : ArrowDownRight}
        accent={isPositive ? 'green' : 'red'}
        valueTone={totalDifference > 0 ? 'success' : totalDifference < 0 ? 'error' : 'default'}
        tooltip={`Net Profit / Loss: ${formattedDiff}`}
      />

      <KpiCard
        title="Total Return"
        value={formattedPct}
        description="Return over reference capital"
        icon={returnIcon}
        accent={returnAccent}
        valueTone={isReturnPositive ? 'success' : isReturnNegative ? 'error' : 'default'}
        tooltip={`Total Return: ${formattedPct}`}
      />
    </div>
  );
};
