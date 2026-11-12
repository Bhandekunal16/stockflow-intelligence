import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Search,
  ArrowUpDown,
  TrendingUp,
} from 'lucide-react';
import { portfolioService } from '../services/portfolio.service';
import { PortfolioSnapshot } from '../types/portfolio.types';
import { formatINR } from '../utils/currency';
import {
  calculateDifference,
  calculatePercentageChange,
  calculateStockSummary,
} from '../utils/calculations';
import { formatDate } from '../utils/date';
import { StatBadge } from '../components/common/StatBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface OutletContextType {
  snapshots?: PortfolioSnapshot[];
}

type SortColumn = 'company' | 'shares' | 'currentValue' | 'referenceValue' | 'difference' | 'percentage';

export const PortfolioDetails: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const context = useOutletContext<OutletContextType>();
  const snapshots = Array.isArray(context?.snapshots) ? context.snapshots : [];

  const [snapshot, setSnapshot] = useState<PortfolioSnapshot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('currentValue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Fetch snapshot for date
  useEffect(() => {
    if (!date) return;
    let isMounted = true;

    async function loadSnapshot() {
      try {
        setLoading(true);
        setError(null);
        const res = await portfolioService.getSnapshotByDate(date!);
        if (isMounted) {
          if (res.success && res.data) {
            // Handle both array of snapshots and single snapshot object
            let snapItem: PortfolioSnapshot | null = null;
            if (Array.isArray(res.data)) {
              snapItem = res.data.find((s: any) => s.date === date) || res.data[0] || null;
            } else {
              snapItem = res.data;
            }

            if (snapItem) {
              setSnapshot({
                ...snapItem,
                date: snapItem.date || date!,
                data: Array.isArray(snapItem.data) ? snapItem.data : [],
              });
            } else {
              setError(`No portfolio snapshot found for date: ${date}`);
            }
          } else {
            setError(res.message || `No portfolio snapshot found for date: ${date}`);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || `No portfolio snapshot found for date: ${date}`);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSnapshot();

    return () => {
      isMounted = false;
    };
  }, [date]);

  // Compute chronologically sorted snapshot dates for Previous / Next navigation
  const dateNav = useMemo(() => {
    if (!date || snapshots.length === 0) return { prev: null, next: null };
    const dates = [...snapshots].map((s) => s.date).sort();
    const currentIndex = dates.indexOf(date);
    if (currentIndex === -1) return { prev: null, next: null };

    return {
      prev: currentIndex > 0 ? dates[currentIndex - 1] : null,
      next: currentIndex < dates.length - 1 ? dates[currentIndex + 1] : null,
    };
  }, [date, snapshots]);

  const rawStocks = useMemo(() => {
    return Array.isArray(snapshot?.data) ? snapshot.data : [];
  }, [snapshot]);

  const summary = useMemo(() => {
    return calculateStockSummary(rawStocks);
  }, [rawStocks]);

  const processedStocks = useMemo(() => {
    const list = rawStocks.map((stock) => {
      const difference = calculateDifference(stock.currentValue, stock.referenceValue);
      const percentage = calculatePercentageChange(stock.currentValue, stock.referenceValue);
      return {
        ...stock,
        difference,
        percentage,
      };
    });

    return list
      .filter((s) => s.company.toLowerCase().includes(searchQuery.trim().toLowerCase()))
      .sort((a, b) => {
        const valA: any = a[sortColumn];
        const valB: any = b[sortColumn];
        if (typeof valA === 'string') {
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
  }, [rawStocks, searchQuery, sortColumn, sortDirection]);

  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('desc');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" label={`Loading portfolio snapshot for ${date}...`} />;
  }

  if (error || !snapshot) {
    return (
      <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto space-y-4">
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Snapshot Not Found</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {error || `Unable to locate portfolio records for ${date}.`}
        </p>
        <Link
          to="/history"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to History
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation & Date Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/history"
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Back to History"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Snapshot: {formatDate(snapshot.date || date, 'DD MMMM YYYY')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              Key: {snapshot.date || date} • Captured in Asia/Kolkata timezone
            </p>
          </div>
        </div>

        {/* Previous / Next Snapshot Navigation */}
        <div className="flex items-center gap-2">
          {dateNav.prev && (
            <button
              onClick={() => navigate(`/history/${dateNav.prev}`)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev ({dateNav.prev})</span>
            </button>
          )}

          {dateNav.next && (
            <button
              onClick={() => navigate(`/history/${dateNav.next}`)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Next ({dateNav.next})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Strip */}
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
          <span className="text-slate-400 font-medium">Total Difference (P&L)</span>
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

      {/* Stock Details Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search holding name or ticker..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Recorded Holdings: <span className="font-bold text-slate-800">{rawStocks.length}</span>
          </div>
        </div>

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
                    {searchQuery ? `No holdings match "${searchQuery}"` : 'No holdings in this snapshot'}
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
