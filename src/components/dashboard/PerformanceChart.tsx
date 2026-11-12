import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { PortfolioSnapshot } from '../../types/portfolio.types';
import { calculateStockSummary } from '../../utils/calculations';
import { formatINR, formatCompactINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { BarChart3, TrendingUp } from 'lucide-react';

interface PerformanceChartProps {
  snapshots: PortfolioSnapshot[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ snapshots }) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  // Prepare chart dataset from real snapshot records
  const chartData = snapshots.map((snap) => {
    const summary = calculateStockSummary(snap.data || []);
    return {
      date: snap.date,
      displayDate: formatDate(snap.date, 'DD MMM'),
      currentValue: summary.totalCurrentValue,
      referenceValue: summary.totalReferenceValue,
      difference: summary.totalDifference,
      percentageChange: summary.percentageChange,
      stocksCount: summary.totalStocks,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-200 text-xs font-sans min-w-[200px]">
          <div className="font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-2">
            Snapshot Date: {formatDate(data.date, 'DD MMMM YYYY')}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Current Value:</span>
              <span className="font-bold text-indigo-600 font-mono">
                {formatINR(data.currentValue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Reference / Buy:</span>
              <span className="font-bold text-slate-700 font-mono">
                {formatINR(data.referenceValue)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-slate-500">Gain / Loss:</span>
              <span
                className={`font-bold font-mono ${
                  data.difference >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {formatINR(data.difference, { showSign: true })} ({data.percentageChange.toFixed(2)}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Holdings:</span>
              <span>{data.stocksCount} stocks</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Portfolio Performance Trend
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical comparison of Current Value vs Reference Value across snapshots
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setChartType('area')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              chartType === 'area'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Area Trend
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              chartType === 'bar'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Comparison Bar
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-72 w-full pt-6">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorRef" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatCompactINR(val)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="currentValue"
                name="Current Portfolio Value"
                stroke="#4f46e5"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorCurrent)"
              />
              <Area
                type="monotone"
                dataKey="referenceValue"
                name="Reference / Buy Value"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorRef)"
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatCompactINR(val)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
              />
              <Bar
                dataKey="currentValue"
                name="Current Value"
                fill="#4f46e5"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="referenceValue"
                name="Reference Value"
                fill="#cbd5e1"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
