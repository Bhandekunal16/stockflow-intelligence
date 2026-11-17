import React from 'react';
import { Table2 } from 'lucide-react';
import { ScreenerRatioValue, ScreenerRatios } from '../../types/screener.types';

interface StockRatiosProps {
  ratios?: ScreenerRatios | null;
}

function formatSingleRatioValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return '—';
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
    }).format(value);
  }
  return String(value);
}

function renderRatioCell(key: string, value: ScreenerRatioValue) {
  if (value === null || value === undefined) {
    return <span className="text-[var(--text-secondary)] font-mono">—</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-[var(--text-secondary)] font-mono">—</span>;
    }

    const isHighLow =
      value.length === 2 && key.toLowerCase().includes('high') && key.toLowerCase().includes('low');

    if (isHighLow) {
      return (
        <div className="flex flex-wrap items-center justify-end gap-3 font-mono">
          <span className="inline-flex items-center gap-1 text-[var(--status-success)]">
            <span className="text-[11px] text-[var(--text-secondary)] font-sans">High:</span>
            <span className="font-semibold">{formatSingleRatioValue(value[0])}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[var(--status-error)]">
            <span className="text-[11px] text-[var(--text-secondary)] font-sans">Low:</span>
            <span className="font-semibold">{formatSingleRatioValue(value[1])}</span>
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap items-center justify-end gap-2 font-mono">
        {value.map((entry, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 rounded-md bg-[var(--bg-canvas)] border border-[var(--border-default)] text-[var(--text-primary)]"
          >
            {formatSingleRatioValue(entry)}
          </span>
        ))}
      </div>
    );
  }

  return (
    <span className="font-mono font-semibold text-[var(--text-primary)]">
      {formatSingleRatioValue(value)}
    </span>
  );
}

export const StockRatios: React.FC<StockRatiosProps> = ({ ratios }) => {
  const entries = ratios ? Object.entries(ratios) : [];

  return (
    <section
      aria-labelledby="stock-ratios-heading"
      className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-default)] flex flex-col h-full"
    >
      <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-3 min-w-0">
          <div
            aria-hidden="true"
            className="w-9 h-9 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] text-[var(--accent-primary)] flex items-center justify-center flex-shrink-0"
          >
            <Table2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3
              id="stock-ratios-heading"
              className="text-base font-bold text-[var(--text-primary)] truncate"
            >
              Stock Ratios &amp; Metrics
            </h3>
            <p className="text-xs text-[var(--text-secondary)] truncate">
              Dynamically extracted financial ratios from Screener.in
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-[var(--text-secondary)] flex-shrink-0">
          {entries.length} metric{entries.length !== 1 ? 's' : ''}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="flex-1 min-h-[220px] rounded-xl bg-[var(--bg-canvas)] border border-dashed border-[var(--border-default)] flex items-center justify-center p-6 text-center">
          <p className="text-xs text-[var(--text-secondary)]">
            Fetch a snapshot or start streaming to inspect all available financial ratios.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border-default)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                <th className="py-2.5 pr-4">Ratio</th>
                <th className="py-2.5 pl-4 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]/60">
              {entries.map(([key, val]) => (
                <tr key={key} className="hover:bg-[var(--bg-elevated)]/30 transition-colors">
                  <td className="py-3 pr-4 font-medium text-[var(--text-secondary)]">
                    {key}
                  </td>
                  <td className="py-3 pl-4 text-right">{renderRatioCell(key, val)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
