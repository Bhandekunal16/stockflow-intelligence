import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, ExternalLink, TrendingUp, Layers } from 'lucide-react';
import { PortfolioStock } from '../../types/portfolio.types';
import { formatINR } from '../../utils/currency';
import { calculateDifference, calculatePercentageChange } from '../../utils/calculations';
import { StatBadge } from '../common/StatBadge';

interface TopHoldingsTableProps {
  stocks: PortfolioStock[];
  limit?: number;
}

type SortField = 'company' | 'shares' | 'currentValue' | 'referenceValue' | 'difference' | 'percentage';

export const TopHoldingsTable: React.FC<TopHoldingsTableProps> = ({ stocks, limit = 5 }) => {
  const [sortField, setSortField] = useState<SortField>('currentValue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  // If stocks <= 10, default to showing all holdings
  const [showAll, setShowAll] = useState<boolean>(stocks.length <= 10);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const processedStocks = useMemo(() => {
    const list = stocks.map((stock) => {
      const difference = calculateDifference(stock.currentValue, stock.referenceValue);
      const percentage = calculatePercentageChange(stock.currentValue, stock.referenceValue);
      return {
        ...stock,
        difference,
        percentage,
      };
    });

    list.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return showAll ? list : list.slice(0, limit);
  }, [stocks, sortField, sortOrder, limit, showAll]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Portfolio Holdings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Displaying {processedStocks.length} of {stocks.length} assets sorted by{' '}
            <span className="font-semibold text-slate-700 capitalize">{sortField}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {stocks.length > limit && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {showAll ? 'Show Top 5' : `Show All (${stocks.length})`}
            </button>
          )}

          <Link
            to="/holdings"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            Holdings Page
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
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
            {processedStocks.map((stock, idx) => (
              <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                    {stock.company.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="truncate max-w-xs">{stock.company}</span>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
