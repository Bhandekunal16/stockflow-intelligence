import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { ScreenerStreamRecord } from '../../types/screener.types';
import { GRAPHITE_THEME } from '../../styles/theme';
import { formatDateTime } from '../../utils/date';

interface StockPriceChartProps {
  records: ScreenerStreamRecord[];
}

export const StockPriceChart: React.FC<StockPriceChartProps> = ({ records }) => {
  const chartData = useMemo(() => {
    const seen = new Set<string>();
    const points: Array<{
      time: string;
      timeLabel: string;
      fullTimestamp: string;
      price: number;
      changed: boolean;
      company: string;
    }> = [];

    for (const rec of records) {
      if (rec.price === null || rec.price === undefined || Number.isNaN(rec.price)) {
        continue;
      }
      const dedupeKey = `${rec.time}-${rec.price}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const dateObj = new Date(rec.time);
      const timeLabel = Number.isNaN(dateObj.getTime())
        ? rec.time
        : new Intl.DateTimeFormat('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }).format(dateObj);

      points.push({
        time: rec.time,
        timeLabel,
        fullTimestamp: formatDateTime(rec.time),
        price: rec.price,
        changed: Boolean(rec.changed),
        company: rec.company,
      });
    }

    return points;
  }, [records]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-[var(--bg-canvas)] p-3.5 rounded-xl shadow-xl border border-[var(--border-default)] text-xs min-w-[200px]">
          <div className="border-b border-[var(--border-default)] pb-2 mb-2">
            <p className="font-semibold text-[var(--text-primary)] truncate max-w-[220px]">
              {point.company}
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] font-mono mt-0.5">
              {point.fullTimestamp}
            </p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[var(--text-secondary)]">Price:</span>
            <span className="font-bold font-mono text-[var(--accent-primary)]">
              ₹{point.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          {point.changed && (
            <p className="mt-1.5 text-[11px] font-medium text-[var(--status-success)]">
              Price change detected
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <section
      aria-labelledby="stock-price-chart-heading"
      className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-default)] flex flex-col h-full"
    >
      <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-3 min-w-0">
          <div
            aria-hidden="true"
            className="w-9 h-9 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] text-[var(--accent-primary)] flex items-center justify-center flex-shrink-0"
          >
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3
              id="stock-price-chart-heading"
              className="text-base font-bold text-[var(--text-primary)] truncate"
            >
              Price History
            </h3>
            <p className="text-xs text-[var(--text-secondary)] truncate">
              Live polled price trajectory from Screener stream
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-[var(--text-secondary)] flex-shrink-0">
          {chartData.length} point{chartData.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="h-72 w-full">
        {chartData.length === 0 ? (
          <div className="h-full w-full rounded-xl bg-[var(--bg-canvas)] border border-dashed border-[var(--border-default)] flex flex-col items-center justify-center p-6 text-center">
            <TrendingUp className="w-7 h-7 text-[var(--text-secondary)] mb-2" aria-hidden="true" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              No Price Points Recorded Yet
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xs">
              Fetch a snapshot or start streaming to plot price updates over time.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 16, left: -4, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={GRAPHITE_THEME.border}
                strokeOpacity={0.55}
                vertical={false}
              />
              <XAxis
                dataKey="timeLabel"
                stroke={GRAPHITE_THEME.textSecondary}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={20}
              />
              <YAxis
                stroke={GRAPHITE_THEME.textSecondary}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={62}
                domain={['auto', 'auto']}
                tickFormatter={(val) =>
                  `₹${Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                }
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: GRAPHITE_THEME.border, strokeDasharray: '3 3' }}
              />
              <Line
                type="monotone"
                dataKey="price"
                name="Price (₹)"
                stroke={GRAPHITE_THEME.accentPrimary}
                strokeWidth={2.5}
                isAnimationActive={false}
                dot={(props: any) => {
                  const { cx, cy, payload, index } = props;
                  if (cx === undefined || cy === undefined) return <g key={index} />;
                  const fill = payload?.changed
                    ? GRAPHITE_THEME.success
                    : GRAPHITE_THEME.accentPrimary;
                  return (
                    <circle
                      key={`dot-${index}`}
                      cx={cx}
                      cy={cy}
                      r={payload?.changed ? 4.5 : 3}
                      fill={fill}
                      stroke={GRAPHITE_THEME.bgCard}
                      strokeWidth={1.5}
                    />
                  );
                }}
                activeDot={{
                  r: 6,
                  fill: GRAPHITE_THEME.accentPrimary,
                  stroke: GRAPHITE_THEME.textPrimary,
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
};
