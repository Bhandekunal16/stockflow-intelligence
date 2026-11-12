import React, { useState, useMemo } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import {
  History,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Search,
  ArrowUpDown,
  GitCompare,
  X,
  UploadCloud,
} from 'lucide-react';
import { PortfolioSnapshot } from '../types/portfolio.types';
import { calculateStockSummary, calculateDifference, calculatePercentageChange } from '../utils/calculations';
import { formatINR } from '../utils/currency';
import { formatDate } from '../utils/date';
import { StatBadge } from '../components/common/StatBadge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface OutletContextType {
  snapshots: PortfolioSnapshot[];
  loading: boolean;
}

export const PortfolioHistory: React.FC = () => {
  const navigate = useNavigate();
  const { snapshots, loading } = useOutletContext<OutletContextType>();

  const [dateSearch, setDateSearch] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Process snapshots with summary metrics
  const processedSnapshots = useMemo(() => {
    return snapshots.map((snap) => {
      const summary = calculateStockSummary(snap.data || []);
      return {
        ...snap,
        ...summary,
      };
    });
  }, [snapshots]);

  // Filter by date string
  const filtered = useMemo(() => {
    return [...processedSnapshots]
      .filter((s) => s.date.includes(dateSearch.trim()))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [processedSnapshots, dateSearch]);

  const toggleCompareDate = (date: string) => {
    if (selectedForCompare.includes(date)) {
      setSelectedForCompare(selectedForCompare.filter((d) => d !== date));
    } else {
      if (selectedForCompare.length >= 2) {
        setSelectedForCompare([selectedForCompare[1], date]);
      } else {
        setSelectedForCompare([...selectedForCompare, date]);
      }
    }
  };

  // Compare side-by-side snapshots
  const compareData = useMemo(() => {
    if (selectedForCompare.length !== 2) return null;
    const snapA = processedSnapshots.find((s) => s.date === selectedForCompare[0]);
    const snapB = processedSnapshots.find((s) => s.date === selectedForCompare[1]);
    if (!snapA || !snapB) return null;

    // Earlier vs Later
    const [earlier, later] = [snapA, snapB].sort((a, b) => a.date.localeCompare(b.date));
    const valueDelta = later.totalCurrentValue - earlier.totalCurrentValue;
    const valueDeltaPct = calculatePercentageChange(later.totalCurrentValue, earlier.totalCurrentValue);

    return { earlier, later, valueDelta, valueDeltaPct };
  }, [selectedForCompare, processedSnapshots]);

  if (loading && snapshots.length === 0) {
    return <LoadingSpinner size="lg" label="Loading portfolio history snapshots..." />;
  }

  if (snapshots.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Portfolio History</h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse and inspect all historical portfolio snapshots indexed by date.
          </p>
        </div>
        <EmptyState
          title="No Historical Snapshots Recorded"
          description="Every time you upload a portfolio screenshot, a snapshot is saved for that date. Upload your first snapshot to start tracking your timeline."
          actionText="Upload Snapshot"
          actionHref="/upload"
          icon={History}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Portfolio History</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {snapshots.length} historical snapshot{snapshots.length !== 1 ? 's' : ''} stored in Asia/Kolkata timezone
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedForCompare.length === 2 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <GitCompare className="w-4 h-4" />
              Compare Selected ({selectedForCompare.join(' vs ')})
            </button>
          )}

          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            Upload New Snapshot
          </Link>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={dateSearch}
                onChange={(e) => setDateSearch(e.target.value)}
                placeholder="Filter by date (e.g. 2026-11)..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            {dateSearch && (
              <button
                onClick={() => setDateSearch('')}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Tip: Select any two checkboxes to compare performance delta</span>
          </div>
        </div>

        {/* Snapshots Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6 w-12 text-center">Compare</th>
                <th className="py-3.5 px-6">Snapshot Date</th>
                <th className="py-3.5 px-6 text-center">Holdings</th>
                <th className="py-3.5 px-6 text-right">Total Current Value</th>
                <th className="py-3.5 px-6 text-right">Reference Capital</th>
                <th className="py-3.5 px-6 text-right">Total Difference (P&L)</th>
                <th className="py-3.5 px-6 text-right">% Change</th>
                <th className="py-3.5 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No snapshots match "{dateSearch}"
                  </td>
                </tr>
              ) : (
                filtered.map((snap) => {
                  const isChecked = selectedForCompare.includes(snap.date);
                  return (
                    <tr
                      key={snap._id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isChecked ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCompareDate(snap.date)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-indigo-600" />
                          <span>{formatDate(snap.date, 'DD MMMM YYYY')}</span>
                          <span className="text-[11px] font-normal text-slate-400 font-mono">
                            ({snap.date})
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center font-mono font-medium text-slate-700">
                        {snap.totalStocks} stocks
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-slate-900">
                        {formatINR(snap.totalCurrentValue)}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-slate-600">
                        {formatINR(snap.totalReferenceValue)}
                      </td>
                      <td
                        className={`py-4 px-6 text-right font-mono font-semibold ${
                          snap.totalDifference >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatINR(snap.totalDifference, { showSign: true })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <StatBadge percentage={snap.percentageChange} size="sm" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Link
                          to={`/history/${snap.date}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          View Details
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-Side Comparison Modal */}
      {showCompareModal && compareData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Portfolio Performance Comparison
                </h3>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 space-y-6">
              {/* Snapshot Comparison Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider">
                    Baseline Snapshot
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">
                    {formatDate(compareData.earlier.date, 'DD MMM YYYY')}
                  </h4>
                  <div className="mt-3 space-y-1.5 font-mono">
                    <p className="flex justify-between">
                      <span className="text-slate-500">Value:</span>
                      <span className="font-bold">{formatINR(compareData.earlier.totalCurrentValue)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Holdings:</span>
                      <span>{compareData.earlier.totalStocks} stocks</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 text-xs">
                  <span className="text-indigo-700 font-semibold uppercase tracking-wider">
                    Comparison Snapshot
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">
                    {formatDate(compareData.later.date, 'DD MMM YYYY')}
                  </h4>
                  <div className="mt-3 space-y-1.5 font-mono">
                    <p className="flex justify-between">
                      <span className="text-slate-500">Value:</span>
                      <span className="font-bold text-indigo-700">
                        {formatINR(compareData.later.totalCurrentValue)}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Holdings:</span>
                      <span>{compareData.later.totalStocks} stocks</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Delta Banner */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                    Period Portfolio Valuation Delta
                  </span>
                  <h4 className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                    {formatINR(compareData.valueDelta, { showSign: true })}
                  </h4>
                </div>
                <div>
                  <StatBadge percentage={compareData.valueDeltaPct} size="lg" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
