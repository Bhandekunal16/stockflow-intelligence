import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PortfolioStock } from '../../types/portfolio.types';
import { formatINR, formatCompactINR } from '../../utils/currency';

interface CurrentVsRefBarChartProps {
  stocks: PortfolioStock[];
  topCount?: number;
}

export const CurrentVsRefBarChart: React.FC<CurrentVsRefBarChartProps> = ({
  stocks,
  topCount = 6,
}) => {
  // Sort by currentValue descending and take top N
  const topStocks = [...stocks]
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, topCount);

  const data = topStocks.map((s) => ({
    name: s.company.length > 14 ? s.company.slice(0, 12) + '...' : s.company,
    fullName: s.company,
    currentValue: s.currentValue,
    referenceValue: s.referenceValue,
    difference: s.currentValue - s.referenceValue,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3.5 rounded-xl shadow-lg border border-slate-200 text-xs">
          <p className="font-semibold text-slate-800 mb-2">{item.fullName}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Current Value:</span>
              <span className="font-bold text-indigo-600 font-mono">
                {formatINR(item.currentValue)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Reference / Buy:</span>
              <span className="font-bold text-slate-700 font-mono">
                {formatINR(item.referenceValue)}
              </span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-slate-100">
              <span className="text-slate-500">P&L Difference:</span>
              <span
                className={`font-bold font-mono ${
                  item.difference >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {formatINR(item.difference, { showSign: true })}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full">
      <div className="border-b border-slate-100 pb-4 mb-4">
        <h3 className="text-base font-bold text-slate-900">Current vs Reference Value</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Top {topCount} holdings valuation versus initial capital invested
        </p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={11}
              interval={0}
              angle={-20}
              textAnchor="end"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => formatCompactINR(val)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }}
            />
            <Bar
              dataKey="currentValue"
              name="Current Value"
              fill="#4f46e5"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="referenceValue"
              name="Reference Value"
              fill="#94a3b8"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
