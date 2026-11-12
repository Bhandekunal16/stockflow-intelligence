import React, { useState, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Search,
  ArrowUpDown,
  Briefcase,
  UploadCloud,
  TrendingUp,
  PiggyBank,
  Percent,
} from 'lucide-react';
import { PortfolioSnapshot, PortfolioStock } from '../types/portfolio.types';
import { formatINR } from '../utils/currency';
import { calculateDifference, calculatePercentageChange, calculateStockSummary } from '../utils/calculations';
import { formatDate } from '../utils/date';
import { StatBadge } from '../components/common/StatBadge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface OutletContextType {
  snapshots: PortfolioSnapshot[];
  latestSnapshot: PortfolioSnapshot | null;
  loading: boolean;
}

type SortColumn = 'company' | 'shares' | 'currentValue' | 'referenceValue' | 'difference' | 'percentage';

export const Holdings: React.FC = () => {
  const { latestSnapshot, loading } = useOutletContext<OutletContextType>();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('currentValue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const stocks: PortfolioStock[] = latestSnapshot?.data || [];

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const processedStocks = useMemo(() => {
    return stocks
      .map((stock) => {
        const difference = calculateDifference(stock.currentValue, stock.referenceValue);
        const percentage = calculatePercentageChange(stock.currentValue, stock.referenceValue);
        return {
          ...stock,
          difference,
          percentage,
        };
      })
      .filter((stock) =>
        stock.company.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
      .sort((a, b) => {
        const valA: any = a[sortColumn];
        const valB: any = b[sortColumn];
        if (typeof valA === 'string') {
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
  }, [stocks, searchQuery, sortColumn, sortDirection]);

  const summary = useMemo(() => calculateStockSummary(stocks), [stocks]);

  if (loading && !latestSnapshot) {
    return <LoadingSpinner size="lg" label="Loading portfolio holdings..." />;
  }

  if (stocks.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Holdings</h2>
          <p className="text-xs text-slate-500 mt-1">
            View all current stock holdings and live valuations from your latest snapshot.
          </p>
        </div>
        <EmptyState
          title="No Active Holdings Found"
          description="You don't have any holdings saved in the system yet. Upload a screenshot to generate your active holdings portfolio."
          actionText="Upload Portfolio Screenshot"
          actionHref="/upload"
          icon={Briefcase}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Metrics Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Portfolio Holdings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active holdings from latest snapshot on{' '}
            <span className="font-semibold text-slate-700">
              {formatDate(latestSnapshot?.date, 'DD MMMM YYYY')}
            </span>
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all self-start md:self-auto cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          Update Holdings
        </Link>
      </div>

      {/* Snapshot Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-xs">
        <div className="p-3 rounded-xl bg-slate-50">
          <span className="text-slate-400 font-medium">Total Current Value</span>
          <p className="text-base font-bold font-mono text-slate-900 mt-1">
            {formatINR(summary.totalCurrentValue)}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50">
          <span className="text-slate-400 font-medium">Reference Capital</span>
          <p className="text-base font-bold font-mono text-slate-700 mt-1">
            {formatINR(summary.totalReferenceValue)}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50">
          <span className="text-slate-400 font-medium">Net Profit / Loss</span>
          <p
            className={`text-base font-bold font-mono mt-1 ${
              summary.totalDifference >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatINR(summary.totalDifference, { showSign: true })}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50">
          <span className="text-slate-400 font-medium">Total Return</span>
          <div className="mt-1">
            <StatBadge percentage={summary.percentageChange} size="sm" />
          </div>
        </div>
      </div>

      {/* Table & Controls Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by company name or ticker..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Showing:</span>
            <span className="font-semibold text-slate-800 font-mono">
              {processedStocks.length} of {stocks.length} holdings
            </span>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th
                  onClick={() => handleSort('company')}
                  className="py-3.5 px-6 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Company</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('shares')}
                  className="py-3.5 px-6 text-right cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Shares</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('currentValue')}
                  className="py-3.5 px-6 text-right cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Current Value</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('referenceValue')}
                  className="py-3.5 px-6 text-right cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Reference Value</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('difference')}
                  className="py-3.5 px-6 text-right cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Difference (P&L)</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('percentage')}
                  className="py-3.5 px-6 text-right cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>% Change</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedStocks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No holdings match your search "{searchQuery}"
                  </td>
                </tr>
              ) : (
                processedStocks.map((stock, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {stock.company.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="truncate max-w-sm">{stock.company}</span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-medium text-slate-700">
                      {stock.shares.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-slate-900">
                      {formatINR(stock.currentValue)}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-slate-600">
                      {formatINR(stock.referenceValue)}
                    </td>
                    <td
                      className={`py-4 px-6 text-right font-mono font-semibold ${
                        stock.difference >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatINR(stock.difference, { showSign: true })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <StatBadge percentage={stock.percentage} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
