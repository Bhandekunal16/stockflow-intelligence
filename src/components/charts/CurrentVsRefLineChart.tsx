import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { PortfolioStock } from '../../types/portfolio.types';
import { formatINR, formatCompactINR, formatPercentage } from '../../utils/currency';
import { formatDate, formatDateTime } from '../../utils/date';
import { calculatePercentageChange } from '../../utils/calculations';
import { GRAPHITE_THEME } from '../../styles/theme';

interface CurrentVsRefLineChartProps {
  stocks: PortfolioStock[];
  topCount?: number;
  snapshotDate?: string | null;
  snapshotTimestamp?: string | null;
}

export const CurrentVsRefLineChart: React.FC<CurrentVsRefLineChartProps> = ({
  stocks,
  topCount = 6,
  snapshotDate,
  snapshotTimestamp,
}) => {
  const data = useMemo(() => {
    const timestampLabel = snapshotTimestamp
      ? formatDateTime(snapshotTimestamp)
      : snapshotDate
      ? `${formatDate(snapshotDate, 'DD MMM YYYY')} (IST)`
      : 'Latest Snapshot';

    return [...stocks]
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, topCount)
      .map((s) => {
        const difference = s.currentValue - s.referenceValue;
        const pct = calculatePercentageChange(s.currentValue, s.referenceValue);
        return {
          name: s.company.length > 14 ? `${s.company.slice(0, 12)}...` : s.company,
          fullName: s.company,
          currentValue: s.currentValue,
          referenceValue: s.referenceValue,
          difference,
          pct,
          timestampLabel,
        };
      });
  }, [stocks, topCount, snapshotDate, snapshotTimestamp]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-[var(--bg-canvas)] p-3.5 rounded-xl shadow-xl border border-[var(--border-default)] text-xs min-w-[215px]">
          <div className="border-b border-[var(--border-default)] pb-2 mb-2">
            <p className="font-semibold text-[var(--text-primary)]">{item.fullName}</p>
            <p className="text-[11px] text-[var(--text-secondary)] font-mono mt-0.5">
              {item.timestampLabel}
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-secondary)]">Current Value:</span>
              <span className="font-bold text-[var(--accent-primary)] font-mono">
                {formatINR(item.currentValue)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-secondary)]">Reference / Buy:</span>
              <span className="font-bold text-[var(--status-info)] font-mono">
                {formatINR(item.referenceValue)}
              </span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-[var(--border-default)]">
              <span className="text-[var(--text-secondary)]">P&amp;L Difference:</span>
              <span
                className={`font-bold font-mono ${
                  item.difference >= 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'
                }`}
              >
                {formatINR(item.difference, { showSign: true })} ({formatPercentage(item.pct)})
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-default)] flex flex-col h-full">
      <div className="border-b border-[var(--border-default)] pb-4 mb-4">
        <h3 className="text-base font-bold text-[var(--text-primary)]">Current vs Reference Value</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Top {topCount} holdings valuation versus initial capital invested
        </p>
      </div>

      <div className="h-72 w-full">
        {data.length === 0 ? (
          <div className="h-full w-full rounded-xl bg-[var(--bg-canvas)] border border-dashed border-[var(--border-default)] flex flex-col items-center justify-center p-6 text-center">
            <TrendingUp className="w-7 h-7 text-[var(--text-secondary)] mb-2" aria-hidden="true" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              No Holding Comparison Data
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xs">
              Upload a portfolio snapshot to compare current valuations against reference capital.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 12, left: -8, bottom: 20 }}>
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
                angle={-20}
                textAnchor="end"
                tickLine={false}
                axisLine={false}
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
                  fontSize: '11px',
                  paddingBottom: '12px',
                  color: GRAPHITE_THEME.textSecondary,
                }}
              />
              <Line
                type="monotone"
                dataKey="currentValue"
                name="Current Value"
                stroke={GRAPHITE_THEME.accentPrimary}
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: GRAPHITE_THEME.accentPrimary, stroke: GRAPHITE_THEME.bgCard, strokeWidth: 2 }}
                activeDot={{ r: 5.5, fill: GRAPHITE_THEME.accentPrimary, stroke: GRAPHITE_THEME.textPrimary, strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="referenceValue"
                name="Reference Value"
                stroke={GRAPHITE_THEME.info}
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={{ r: 3, fill: GRAPHITE_THEME.info, stroke: GRAPHITE_THEME.bgCard, strokeWidth: 2 }}
                activeDot={{ r: 5, fill: GRAPHITE_THEME.info, stroke: GRAPHITE_THEME.textPrimary, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
