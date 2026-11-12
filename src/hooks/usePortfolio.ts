import { useState, useEffect, useCallback, useMemo } from 'react';
import { PortfolioSnapshot, PortfolioSummaryMetrics } from '../types/portfolio.types';
import { portfolioService } from '../services/portfolio.service';
import { getPortfolioSummaryFromSnapshots } from '../utils/calculations';

export function usePortfolio() {
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await portfolioService.getAllSnapshots();
      if (res.success && Array.isArray(res.data)) {
        // Sort chronologically ascending for trends, descending for latest
        const sorted = [...res.data].sort((a, b) => a.date.localeCompare(b.date));
        setSnapshots(sorted);
      } else {
        setSnapshots([]);
      }
    } catch (err: any) {
      if (err.statusCode === 404) {
        setSnapshots([]);
      } else {
        setError(err.message || 'Failed to load portfolio snapshots');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  const latestSnapshot = useMemo(() => {
    if (snapshots.length === 0) return null;
    return [...snapshots].sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [snapshots]);

  const metrics: PortfolioSummaryMetrics = useMemo(() => {
    return getPortfolioSummaryFromSnapshots(snapshots);
  }, [snapshots]);

  return {
    snapshots,
    latestSnapshot,
    metrics,
    loading,
    error,
    refetch: fetchSnapshots,
  };
}
