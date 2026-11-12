/**
 * Indian Rupee (₹) currency formatting utilities
 */

export function formatINR(amount: number, options: { decimals?: number; showSign?: boolean } = {}): string {
  const { decimals = 2, showSign = false } = options;

  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0.00';
  }

  const sign = showSign && amount > 0 ? '+' : '';
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(absAmount);

  if (isNegative) {
    return `-${formatted}`;
  }
  return `${sign}${formatted}`;
}

export function formatCompactINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(2)} L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)} K`;
  }
  return `${sign}₹${abs.toFixed(2)}`;
}

export function formatPercentage(pct: number, showSign = true): string {
  if (isNaN(pct) || pct === null || pct === undefined) {
    return '0.00%';
  }
  const sign = showSign && pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}
