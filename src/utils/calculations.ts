import { PortfolioStock, PortfolioSnapshot, PortfolioSummaryMetrics } from '../types/portfolio.types';

/**
 * Calculate investment difference: currentValue - referenceValue
 */
export function calculateDifference(currentValue: number, referenceValue: number): number {
  return currentValue - referenceValue;
}

/**
 * Calculate percentage change: ((currentValue - referenceValue) / referenceValue) * 100
 * Handles zero reference values safely
 */
export function calculatePercentageChange(currentValue: number, referenceValue: number): number {
  if (!referenceValue || referenceValue === 0) {
    if (currentValue > 0) return 100;
    if (currentValue < 0) return -100;
    return 0;
  }
  return ((currentValue - referenceValue) / referenceValue) * 100;
}

/**
 * Aggregate summary metrics from a collection of stocks
 */
export function calculateStockSummary(stocks: PortfolioStock[]): {
  totalCurrentValue: number;
  totalReferenceValue: number;
  totalDifference: number;
  percentageChange: number;
  totalStocks: number;
} {
  if (!stocks || stocks.length === 0) {
    return {
      totalCurrentValue: 0,
      totalReferenceValue: 0,
      totalDifference: 0,
      percentageChange: 0,
      totalStocks: 0,
    };
  }

  const totalCurrentValue = stocks.reduce((acc, stock) => acc + (Number(stock.currentValue) || 0), 0);
  const totalReferenceValue = stocks.reduce((acc, stock) => acc + (Number(stock.referenceValue) || 0), 0);
  const totalDifference = calculateDifference(totalCurrentValue, totalReferenceValue);
  const percentageChange = calculatePercentageChange(totalCurrentValue, totalReferenceValue);

  return {
    totalCurrentValue,
    totalReferenceValue,
    totalDifference,
    percentageChange,
    totalStocks: stocks.length,
  };
}

/**
 * Compute portfolio metrics from the latest snapshot
 */
export function getPortfolioSummaryFromSnapshots(snapshots: PortfolioSnapshot[]): PortfolioSummaryMetrics {
  if (!snapshots || snapshots.length === 0) {
    return {
      totalCurrentValue: 0,
      totalReferenceValue: 0,
      totalDifference: 0,
      percentageChange: 0,
      totalStocks: 0,
      lastUpdatedDate: null,
    };
  }

  // Find latest snapshot by date
  const sorted = [...snapshots].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const summary = calculateStockSummary(latest.data || []);

  return {
    ...summary,
    lastUpdatedDate: latest.date,
  };
}
