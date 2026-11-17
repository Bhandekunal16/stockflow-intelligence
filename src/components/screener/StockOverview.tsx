import React from 'react';
import {
  Building2,
  IndianRupee,
  Landmark,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';
import { KpiCard } from '../common/KpiCard';
import { ScreenerSnapshotData } from '../../types/screener.types';
import { formatDateTime } from '../../utils/date';

interface StockOverviewProps {
  companyCode: string;
  data: ScreenerSnapshotData | null;
  priceChanged?: boolean;
}

function formatPriceValue(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `₹${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;
}

function formatMarketCapValue(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `₹${new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(value)}`;
}

function formatNumberValue(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(value);
}

export const StockOverview: React.FC<StockOverviewProps> = ({
  companyCode,
  data,
  priceChanged = false,
}) => {
  const displayCode = data?.companyCode || companyCode;
  const companyName = data?.company || 'No Snapshot Loaded Yet';
  const lastUpdatedText = data?.time ? formatDateTime(data.time) : '—';
  const lastUpdatedTimeOnly = data?.time
    ? new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(new Date(data.time))
    : '—';

  return (
    <section aria-labelledby="stock-overview-heading" className="space-y-4">
      {/* Company Name & Company Code Banner */}
      <div className="bg-[var(--bg-card)] px-5 py-4 rounded-2xl border border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            aria-hidden="true"
            className="w-10 h-10 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] text-[var(--accent-primary)] flex items-center justify-center flex-shrink-0"
          >
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                Company Overview
              </p>
              <span className="px-2 py-0.5 rounded-md bg-[var(--bg-canvas)] border border-[var(--border-default)] font-mono text-[11px] font-semibold text-[var(--accent-primary)]">
                {displayCode}
              </span>
            </div>
            <h3
              id="stock-overview-heading"
              className="text-base sm:text-lg font-bold text-[var(--text-primary)] truncate mt-0.5"
              title={companyName}
            >
              {companyName}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] flex-shrink-0">
          <Clock className="w-3.5 h-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
          <span>Last Updated:</span>
          <span className="font-mono text-[var(--text-primary)]">{lastUpdatedText}</span>
        </div>
      </div>

      {/* Stock Information KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <KpiCard
          title="Current Price"
          value={formatPriceValue(data?.price)}
          description={priceChanged ? 'Updated on latest poll' : 'Latest market price'}
          icon={IndianRupee}
          accent={priceChanged ? 'green' : 'violet'}
          valueTone={priceChanged ? 'success' : 'default'}
          tooltip={`Current Price (${displayCode}): ${formatPriceValue(data?.price)}`}
        />

        <KpiCard
          title="Market Cap"
          value={formatMarketCapValue(data?.marketCap)}
          description="Reported cap (₹ Cr)"
          icon={Landmark}
          accent="gray"
          tooltip={`Market Capitalization: ${formatMarketCapValue(data?.marketCap)} Cr`}
        />

        <KpiCard
          title="Stock P/E"
          value={formatNumberValue(data?.stockPE)}
          description="Price-to-earnings ratio"
          icon={Gauge}
          accent="violet"
          tooltip={`Stock P/E: ${formatNumberValue(data?.stockPE)}`}
        />

        <KpiCard
          title="High"
          value={formatPriceValue(data?.high)}
          description="52-week high"
          icon={ArrowUpRight}
          accent="green"
          tooltip={`High: ${formatPriceValue(data?.high)}`}
        />

        <KpiCard
          title="Low"
          value={formatPriceValue(data?.low)}
          description="52-week low"
          icon={ArrowDownRight}
          accent="red"
          tooltip={`Low: ${formatPriceValue(data?.low)}`}
        />

        <KpiCard
          title="Last Updated"
          value={lastUpdatedTimeOnly}
          description={data?.time ? lastUpdatedText : 'Awaiting snapshot'}
          icon={Clock}
          accent={data?.time ? 'amber' : 'gray'}
          tooltip={`Last Updated Timestamp: ${lastUpdatedText}`}
        />
      </div>
    </section>
  );
};
