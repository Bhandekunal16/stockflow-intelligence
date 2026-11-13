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
import { formatINR, formatPercentage } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { KpiCard } from '../common/KpiCard';

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
  const formattedCurrent = formatINR(totalCurrentValue);
  const formattedReference = formatINR(totalReferenceValue);
  const formattedDiff = formatINR(totalDifference, { showSign: true });
  const formattedPct = formatPercentage(percentageChange);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
      <KpiCard
        title="Total Current Value"
        value={formattedCurrent}
        description="Live market valuation"
        icon={Wallet}
        accent="violet"
        tooltip={`Total Current Value: ${formattedCurrent}`}
      />

      <KpiCard
        title="Reference / Invested"
        value={formattedReference}
        description="Total invested capital"
        icon={PiggyBank}
        accent="gray"
        tooltip={`Reference / Invested Capital: ${formattedReference}`}
      />

      <KpiCard
        title="Net Difference (P&L)"
        value={formattedDiff}
        description={
          <span>
            <span className={isProfit ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'}>
              {formattedPct}
            </span>{' '}
            <span>vs reference capital</span>
          </span>
        }
        icon={isProfit ? ArrowUpRight : ArrowDownRight}
        accent={isProfit ? 'green' : 'red'}
        tooltip={`Net P&L: ${formattedDiff} (${formattedPct})`}
      />

      <KpiCard
        title="Total Stocks"
        value={totalStocks}
        description="Unique active holdings"
        icon={Layers}
        accent="amber"
        to="/holdings"
        tooltip="View all active holdings"
      />

      <KpiCard
        title="Last Updated"
        value={lastUpdatedDate ? formatDate(lastUpdatedDate, 'DD MMM YYYY') : 'No data'}
        description={lastUpdatedDate ? 'Asia/Kolkata indexed' : 'Awaiting first upload'}
        icon={Calendar}
        accent={lastUpdatedDate ? 'green' : 'gray'}
        to={lastUpdatedDate ? `/history/${lastUpdatedDate}` : undefined}
        tooltip={
          lastUpdatedDate
            ? `Inspect snapshot for ${formatDate(lastUpdatedDate, 'DD MMM YYYY')}`
            : 'No snapshots available yet'
        }
        className="sm:col-span-2 lg:col-span-1"
      />
    </div>
  );
};
