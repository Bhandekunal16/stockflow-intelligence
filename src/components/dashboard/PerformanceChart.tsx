import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { PortfolioSnapshot } from '../../types/portfolio.types';
import { calculateStockSummary } from '../../utils/calculations';
import { formatINR, formatCompactINR } from '../../utils/currency';
import { formatDate, formatDateTime } from '../../utils/date';
import { TrendingUp, Activity } from 'lucide-react';
import { GRAPHITE_THEME } from '../../styles/theme';

interface PerformanceChartProps {
  snapshots: PortfolioSnapshot[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ snapshots }) => {
  const [metricMode, setMetricMode] = useState<'valuation' | 'pnl'>('valuation');

  // Sort chronologically and compute snapshot metrics
  const chartData = useMemo(() => {
    return [...snapshots]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((snap) => {
        const summary = calculateStockSummary(snap.data || []);
        const timestamp = snap.updatedAt || snap.createdAt;
        return {
          date: snap.date,
          displayDate: formatDate(snap.date, 'DD MMM'),
          timestampLabel: timestamp ? formatDateTime(timestamp) : `${formatDate(snap.date, 'DD MMM YYYY')} (IST)`,
          currentValue: summary.totalCurrentValue,
          referenceValue: summary.totalReferenceValue,
          difference: summary.totalDifference,
          percentageChange: summary.percentageChange,
          stocksCount: summary.totalStocks,
        };
      });
  }, [snapshots]);

  const latestDiff = chartData.length > 0 ? chartData[chartData.length - 1].difference : 0;
  const pnlStroke = latestDiff >= 0 ? GRAPHITE_THEME.success : GRAPHITE_THEME.error;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[var(--bg-canvas)] p-4 rounded-xl shadow-xl border border-[var(--border-default)] text-xs font-sans min-w-[220px]">
          <div className="border-b border-[var(--border-default)] pb-2 mb-2.5">
            <p className="font-semibold text-[var(--text-primary)]">
              {formatDate(data.date, 'DD MMMM YYYY')}
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] font-mono mt-0.5">
              Timestamp: {data.timestampLabel}
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[var(--text-secondary)]">Current Value:</span>
              <span className="font-bold text-[var(--accent-primary)] font-mono">
                {formatINR(data.currentValue)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[var(--text-secondary)]">Reference / Buy:</span>
              <span className="font-bold text-[var(--status-info)] font-mono">
                {formatINR(data.referenceValue)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-[var(--border-default)]">
              <span className="text-[var(--text-secondary)]">Net P&amp;L:</span>
              <span
                className={`font-bold font-mono ${
                  data.difference >= 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'
                }`}
              >
                {formatINR(data.difference, { showSign: true })} ({data.percentageChange.toFixed(2)}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
              <span>Holdings:</span>
              <span className="font-mono">{data.stocksCount} stocks</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-default)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-[var(--border-default)]">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--accent-primary)]" aria-hidden="true" />
            Portfolio Performance Trend
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Historical line trajectory of portfolio valuation and net profit/loss across snapshots
          </p>
        </div>

        {/* Series Mode Toggle */}
        <div
          role="group"
          aria-label="Performance line chart metric"
          className="flex items-center bg-[var(--bg-canvas)] border border-[var(--border-default)] p-1 rounded-xl self-start sm:self-auto"
        >
          <button
            type="button"
            aria-pressed={metricMode === 'valuation'}
            onClick={() => setMetricMode('valuation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              metricMode === 'valuation'
                ? 'bg-[var(--bg-elevated)] text-[var(--accent-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
            Valuation
          </button>
          <button
            type="button"
            aria-pressed={metricMode === 'pnl'}
            onClick={() => setMetricMode('pnl')}
            className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              metricMode === 'pnl'
                ? 'bg-[var(--bg-elevated)] text-[var(--accent-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" aria-hidden="true" />
            Net P&amp;L
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-72 w-full pt-6">
        {chartData.length === 0 ? (
          <div className="h-full w-full rounded-xl bg-[var(--bg-canvas)] border border-dashed border-[var(--border-default)] flex flex-col items-center justify-center p-6 text-center">
            <TrendingUp className="w-7 h-7 text-[var(--text-secondary)] mb-2" aria-hidden="true" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              No Performance History Available
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm">
              Upload at least one portfolio screenshot to plot valuation and P&amp;L trends over time.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {metricMode === 'valuation' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={GRAPHITE_THEME.border}
                  strokeOpacity={0.55}
                  vertical={false}
                />
                <XAxis
                  dataKey="displayDate"
                  stroke={GRAPHITE_THEME.textSecondary}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={16}
                />
                <YAxis
                  stroke={GRAPHITE_THEME.textSecondary}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(val) => formatCompactINR(val)}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: GRAPHITE_THEME.border, strokeDasharray: '3 3' }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="plainline"
                  wrapperStyle={{
                    paddingBottom: '14px',
                    fontSize: '12px',
                    color: GRAPHITE_THEME.textSecondary,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="currentValue"
                  name="Current Portfolio Value"
                  stroke={GRAPHITE_THEME.accentPrimary}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: GRAPHITE_THEME.accentPrimary, stroke: GRAPHITE_THEME.bgCard, strokeWidth: 2 }}
                  activeDot={{ r: 5.5, fill: GRAPHITE_THEME.accentPrimary, stroke: GRAPHITE_THEME.textPrimary, strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="referenceValue"
                  name="Reference / Buy Value"
                  stroke={GRAPHITE_THEME.info}
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={{ r: 3, fill: GRAPHITE_THEME.info, stroke: GRAPHITE_THEME.bgCard, strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: GRAPHITE_THEME.info, stroke: GRAPHITE_THEME.textPrimary, strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={GRAPHITE_THEME.border}
                  strokeOpacity={0.55}
                  vertical={false}
                />
                <XAxis
                  dataKey="displayDate"
                  stroke={GRAPHITE_THEME.textSecondary}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={16}
                />
                <YAxis
                  stroke={GRAPHITE_THEME.textSecondary}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(val) => formatCompactINR(val)}
                />
                <ReferenceLine y={0} stroke={GRAPHITE_THEME.border} strokeDasharray="4 4" />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: GRAPHITE_THEME.border, strokeDasharray: '3 3' }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="plainline"
                  wrapperStyle={{
                    paddingBottom: '14px',
                    fontSize: '12px',
                    color: GRAPHITE_THEME.textSecondary,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="difference"
                  name="Net Profit / Loss (₹)"
                  stroke={pnlStroke}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: pnlStroke, stroke: GRAPHITE_THEME.bgCard, strokeWidth: 2 }}
                  activeDot={{ r: 5.5, fill: pnlStroke, stroke: GRAPHITE_THEME.textPrimary, strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
