import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Search,
  X,
  TrendingUp,
} from 'lucide-react';
import { PortfolioStock } from '../../types/portfolio.types';
import { formatINR } from '../../utils/currency';
import { calculateDifference, calculatePercentageChange } from '../../utils/calculations';
import { StatBadge } from '../common/StatBadge';

export type SortColumn =
  | 'company'
  | 'shares'
  | 'currentValue'
  | 'referenceValue'
  | 'difference'
  | 'percentage';

interface HoldingsTableProps {
  stocks: PortfolioStock[];
  title?: string;
  subtitle?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  limit?: number;
  showAllLink?: boolean;
  defaultShowAll?: boolean;
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({
  stocks,
  title = 'Portfolio Holdings',
  subtitle,
  searchable = false,
  searchPlaceholder = 'Search by company name or ticker...',
  limit,
  showAllLink = false,
  defaultShowAll = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('currentValue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showAll, setShowAll] = useState<boolean>(
    defaultShowAll || !limit || stocks.length <= limit
  );

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const processedStocks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const mapped = stocks
      .map((stock) => {
        const difference = calculateDifference(stock.currentValue, stock.referenceValue);
        const percentage = calculatePercentageChange(stock.currentValue, stock.referenceValue);
        return {
          ...stock,
          difference,
          percentage,
        };
      })
      .filter((s) => !query || s.company.toLowerCase().includes(query))
      .sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDirection === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return sortDirection === 'asc'
          ? Number(valA) - Number(valB)
          : Number(valB) - Number(valA);
      });

    if (limit && !showAll && !query) {
      return mapped.slice(0, limit);
    }
    return mapped;
  }, [stocks, searchQuery, sortColumn, sortDirection, limit, showAll]);

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-secondary)]" aria-hidden="true" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
    );
  };

  const getAriaSort = (column: SortColumn): 'ascending' | 'descending' | 'none' => {
    if (sortColumn !== column) return 'none';
    return sortDirection === 'asc' ? 'ascending' : 'descending';
  };

  const columns: {
    key: SortColumn;
    label: string;
    align: 'left' | 'right';
  }[] = [
    { key: 'company', label: 'Company', align: 'left' },
    { key: 'shares', label: 'Shares', align: 'right' },
    { key: 'currentValue', label: 'Current Value', align: 'right' },
    { key: 'referenceValue', label: 'Reference Value', align: 'right' },
    { key: 'difference', label: 'Difference (P&L)', align: 'right' },
    { key: 'percentage', label: '% Change', align: 'right' },
  ];

  return (
    <section
      aria-label={title}
      className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] overflow-hidden"
    >
      {/* Table Header & Controls */}
      <div className="p-4 sm:p-6 border-b border-[var(--border-default)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--accent-primary)] flex-shrink-0" aria-hidden="true" />
            <span>{title}</span>
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {subtitle ||
              `Showing ${processedStocks.length} of ${stocks.length} holding${
                stocks.length === 1 ? '' : 's'
              }`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {searchable && (
            <div className="relative w-full sm:w-72">
              <label htmlFor="holdings-search" className="sr-only">
                Search holdings by company name
              </label>
              <Search
                className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="holdings-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full min-h-[40px] pl-9 pr-9 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/25 focus:border-[var(--accent-primary)] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search query"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          {limit && stocks.length > limit && !searchQuery && (
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="min-h-[38px] text-xs font-semibold px-3.5 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
            >
              {showAll ? `Show Top ${limit}` : `Show All (${stocks.length})`}
            </button>
          )}

          {showAllLink && (
            <Link
              to="/holdings"
              className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 transition-colors"
            >
              <span>View Holdings</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[var(--bg-canvas)]/70 text-[var(--text-secondary)] uppercase tracking-wider font-semibold border-b border-[var(--border-default)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={getAriaSort(col.key)}
                  className={`py-3 px-4 sm:px-6 whitespace-nowrap ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSort(col.key)}
                    className={`inline-flex items-center gap-1.5 py-1 rounded-md hover:text-[var(--text-primary)] transition-colors cursor-pointer ${
                      col.align === 'right' ? 'flex-row-reverse' : ''
                    } ${sortColumn === col.key ? 'text-[var(--accent-primary)] font-bold' : ''}`}
                  >
                    <span>{col.label}</span>
                    {renderSortIcon(col.key)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]">
            {processedStocks.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 px-6 text-center text-[var(--text-secondary)]">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    No holdings match &ldquo;{searchQuery}&rdquo;
                  </p>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="mt-3 px-4 py-2 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)]/80 text-[var(--text-primary)] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Clear Search Filter
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              processedStocks.map((stock, idx) => (
                <tr key={`${stock.company}-${idx}`} className="hover:bg-[var(--bg-elevated)]/40 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-[var(--text-primary)]">
                    <div className="flex items-center gap-3 min-w-[160px]">
                      <div
                        aria-hidden="true"
                        className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--accent-primary)] font-bold flex items-center justify-center text-xs flex-shrink-0"
                      >
                        {stock.company.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[220px] sm:max-w-xs" title={stock.company}>
                        {stock.company}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-medium text-[var(--text-secondary)] whitespace-nowrap">
                    {stock.shares.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-bold text-[var(--text-primary)] whitespace-nowrap">
                    {formatINR(stock.currentValue)}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right font-mono text-[var(--text-secondary)] whitespace-nowrap">
                    {formatINR(stock.referenceValue)}
                  </td>
                  <td
                    className={`py-3.5 px-4 sm:px-6 text-right font-mono font-semibold whitespace-nowrap ${
                      stock.difference >= 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'
                    }`}
                  >
                    {formatINR(stock.difference, { showSign: true })}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                    <StatBadge percentage={stock.percentage} size="sm" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
