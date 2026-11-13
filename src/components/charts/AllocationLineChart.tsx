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
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { PortfolioSnapshot, PortfolioStock } from '../../types/portfolio.types';
import { formatINR, formatCompactINR, formatPercentage } from '../../utils/currency';
import { formatDate, formatDateTime } from '../../utils/date';
import { GRAPHITE_CHART_PALETTE, GRAPHITE_THEME } from '../../styles/theme';

interface AllocationLineChartProps {
  stocks: PortfolioStock[];
  snapshots?: PortfolioSnapshot[];
  snapshotDate?: string | null;
  snapshotTimestamp?: string | null;
}

export const AllocationLineChart: React.FC<AllocationLineChartProps> = ({
  stocks,
  snapshots = [],
  snapshotDate,
  snapshotTimestamp,
}) => {
  const hasTimeline = snapshots.length > 1;
  const [viewMode, setViewMode] = useState<'weights' | 'timeline'>(
    hasTimeline ? 'timeline' : 'weights'
  );

  // Holdings weight distribution dataset (Current Weight % vs Invested Weight %)
  const weightData = useMemo(() => {
    const totalCurrent = stocks.reduce((sum, s) => sum + (s.currentValue || 0), 0);
    const totalRef = stocks.reduce((sum, s) => sum + (s.referenceValue || 0), 0);
    const sorted = [...stocks].sort((a, b) => b.currentValue - a.currentValue).slice(0, 7);

    return sorted.map((stock) => {
      const currentWeight = totalCurrent > 0 ? (stock.currentValue / totalCurrent) * 100 : 0;
      const investedWeight = totalRef > 0 ? (stock.referenceValue / totalRef) * 100 : 0;
      return {
        name: stock.company.length > 12 ? `${stock.company.slice(0, 10)}...` : stock.company,
        fullName: stock.company,
        currentWeight: Number(currentWeight.toFixed(2)),
        investedWeight: Number(investedWeight.toFixed(2)),
        currentValue: stock.currentValue,
        referenceValue: stock.referenceValue,
        shares: stock.shares,
        timestampLabel: snapshotTimestamp
          ? formatDateTime(snapshotTimestamp)
          : snapshotDate
          ? `${formatDate(snapshotDate, 'DD MMM YYYY')} (IST)`
          : 'Latest Snapshot',
      };
    });
  }, [stocks, snapshotDate, snapshotTimestamp]);

  // Top 5 holdings time-series dataset across snapshot dates
  const { timelineData, topTickers } = useMemo(() => {
    if (snapshots.length === 0 || stocks.length === 0) {
      return { timelineData: [], topTickers: [] as string[] };
    }

    const topCompanies = [...stocks]
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 5)
      .map((s) => s.company);

    const series = [...snapshots]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((snap) => {
        const ts = snap.updatedAt || snap.createdAt;
        const point: Record<string, any> = {
          date: snap.date,
          displayDate: formatDate(snap.date, 'DD MMM'),
          timestampLabel: ts ? formatDateTime(ts) : `${formatDate(snap.date, 'DD MMM YYYY')} (IST)`,
        };

        topCompanies.forEach((company) => {
          const match = (snap.data || []).find((s) => s.company === company);
          point[company] = match ? match.currentValue : null;
        });

        return point;
      });

    return { timelineData: series, topTickers: topCompanies };
  }, [snapshots, stocks]);

  const activeMode = hasTimeline ? viewMode : 'weights';
  const hasChartData =
    activeMode === 'timeline' ? timelineData.length > 0 && topTickers.length > 0 : weightData.length > 0;

  const WeightTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-[var(--bg-canvas)] p-3.5 rounded-xl shadow-xl border border-[var(--border-default)] text-xs min-w-[210px]">
          <div className="border-b border-[var(--border-default)] pb-2 mb-2">
            <p className="font-semibold text-[var(--text-primary)]">{item.fullName}</p>
            <p className="text-[11px] text-[var(--text-secondary)] font-mono mt-0.5">
              {item.timestampLabel}
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-secondary)]">Current Share:</span>
              <span className="font-bold text-[var(--accent-primary)] font-mono">
                {formatPercentage(item.currentWeight, false)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-secondary)]">Invested Share:</span>
              <span className="font-bold text-[var(--status-info)] font-mono">
                {formatPercentage(item.investedWeight, false)}
              </span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-[var(--border-default)]">
              <span className="text-[var(--text-secondary)]">Market Value:</span>
              <span className="font-mono text-[var(--text-primary)]">{formatINR(item.currentValue)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const TimelineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const row = payload[0].payload;
      return (
        <div className="bg-[var(--bg-canvas)] p-3.5 rounded-xl shadow-xl border border-[var(--border-default)] text-xs min-w-[220px]">
          <div className="border-b border-[var(--border-default)] pb-2 mb-2">
            <p className="font-semibold text-[var(--text-primary)]">
              {formatDate(row.date, 'DD MMMM YYYY')}
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] font-mono mt-0.5">
              Timestamp: {row.timestampLabel}
            </p>
          </div>
          <div className="space-y-1.5">
            {payload.map((entry: any) => (
              <div key={entry.dataKey} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-[var(--text-secondary)] truncate max-w-[130px]">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate">{entry.name}</span>
                </span>
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  {formatINR(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-default)] flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-default)] pb-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            {activeMode === 'timeline' ? 'Top Holdings Value Trajectory' : 'Portfolio Weight Allocation'}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {activeMode === 'timeline'
              ? 'Multi-series value progression across top 5 holdings'
              : 'Current portfolio share (%) vs invested capital share (%)'}
          </p>
        </div>

        {hasTimeline && (
          <div
            role="group"
            aria-label="Allocation line chart view"
            className="flex items-center bg-[var(--bg-canvas)] border border-[var(--border-default)] p-1 rounded-xl self-start sm:self-auto"
          >
            <button
              type="button"
              aria-pressed={activeMode === 'timeline'}
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-1 min-h-[32px] text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeMode === 'timeline'
                  ? 'bg-[var(--bg-elevated)] text-[var(--accent-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Over Time
            </button>
            <button
              type="button"
              aria-pressed={activeMode === 'weights'}
              onClick={() => setViewMode('weights')}
              className={`px-2.5 py-1 min-h-[32px] text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeMode === 'weights'
                  ? 'bg-[var(--bg-elevated)] text-[var(--accent-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Weight %
            </button>
          </div>
        )}
      </div>

      <div className="h-72 w-full">
        {!hasChartData ? (
          <div className="h-full w-full rounded-xl bg-[var(--bg-canvas)] border border-dashed border-[var(--border-default)] flex flex-col items-center justify-center p-6 text-center">
            <TrendingUp className="w-7 h-7 text-[var(--text-secondary)] mb-2" aria-hidden="true" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              No Allocation Data Available
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xs">
              Upload a portfolio screenshot to visualize holding allocation lines.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {activeMode === 'timeline' ? (
              <LineChart data={timelineData} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
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
                  content={<TimelineTooltip />}
                  cursor={{ stroke: GRAPHITE_THEME.border, strokeDasharray: '3 3' }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="plainline"
                  wrapperStyle={{
                    fontSize: '11px',
                    paddingTop: '10px',
                    color: GRAPHITE_THEME.textSecondary,
                  }}
                />
                {topTickers.map((company, idx) => {
                  const color = GRAPHITE_CHART_PALETTE[idx % GRAPHITE_CHART_PALETTE.length];
                  return (
                    <Line
                      key={company}
                      type="monotone"
                      dataKey={company}
                      name={company.length > 16 ? `${company.slice(0, 14)}...` : company}
                      stroke={color}
                      strokeWidth={2.25}
                      connectNulls
                      dot={{ r: 3, fill: color, stroke: GRAPHITE_THEME.bgCard, strokeWidth: 1.5 }}
                      activeDot={{ r: 5, fill: color, stroke: GRAPHITE_THEME.textPrimary, strokeWidth: 2 }}
                    />
                  );
                })}
              </LineChart>
            ) : (
              <LineChart data={weightData} margin={{ top: 10, right: 12, left: -12, bottom: 16 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={GRAPHITE_THEME.border}
                  strokeOpacity={0.55}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke={GRAPHITE_THEME.textSecondary}
                  fontSize={11}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={GRAPHITE_THEME.textSecondary}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={46}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  content={<WeightTooltip />}
                  cursor={{ stroke: GRAPHITE_THEME.border, strokeDasharray: '3 3' }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="plainline"
                  wrapperStyle={{
                    fontSize: '11px',
                    paddingBottom: '10px',
                    color: GRAPHITE_THEME.textSecondary,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="currentWeight"
                  name="Current Weight (%)"
                  stroke={GRAPHITE_THEME.accentPrimary}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: GRAPHITE_THEME.accentPrimary, stroke: GRAPHITE_THEME.bgCard, strokeWidth: 2 }}
                  activeDot={{ r: 5.5, fill: GRAPHITE_THEME.accentPrimary, stroke: GRAPHITE_THEME.textPrimary, strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="investedWeight"
                  name="Invested Weight (%)"
                  stroke={GRAPHITE_THEME.info}
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={{ r: 3, fill: GRAPHITE_THEME.info, stroke: GRAPHITE_THEME.bgCard, strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: GRAPHITE_THEME.info, stroke: GRAPHITE_THEME.textPrimary, strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
