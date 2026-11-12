import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PortfolioStock } from '../../types/portfolio.types';
import { formatINR, formatPercentage } from '../../utils/currency';

interface AllocationPieChartProps {
  stocks: PortfolioStock[];
}

const COLORS = [
  '#4f46e5', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#64748b', // Slate
];

export const AllocationPieChart: React.FC<AllocationPieChartProps> = ({ stocks }) => {
  const totalValue = stocks.reduce((sum, s) => sum + (s.currentValue || 0), 0);

  // Group into top 7 and "Others" if too many stocks
  const sorted = [...stocks].sort((a, b) => b.currentValue - a.currentValue);
  const topCount = 7;
  const topStocks = sorted.slice(0, topCount);
  const remaining = sorted.slice(topCount);

  const data = topStocks.map((stock) => ({
    name: stock.company,
    value: stock.currentValue,
    shares: stock.shares,
    percentage: totalValue > 0 ? (stock.currentValue / totalValue) * 100 : 0,
  }));

  if (remaining.length > 0) {
    const remainingValue = remaining.reduce((sum, s) => sum + (s.currentValue || 0), 0);
    data.push({
      name: `Other Holdings (${remaining.length})`,
      value: remainingValue,
      shares: remaining.reduce((sum, s) => sum + s.shares, 0),
      percentage: totalValue > 0 ? (remainingValue / totalValue) * 100 : 0,
    });
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200 text-xs">
          <p className="font-semibold text-slate-800 mb-1">{item.name}</p>
          <div className="space-y-1">
            <p className="text-indigo-600 font-mono font-bold">{formatINR(item.value)}</p>
            <p className="text-slate-500">{formatPercentage(item.percentage, false)} of portfolio</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full">
      <div className="border-b border-slate-100 pb-4 mb-4">
        <h3 className="text-base font-bold text-slate-900">Portfolio Asset Allocation</h3>
        <p className="text-xs text-slate-500 mt-0.5">Value distribution across holdings</p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
