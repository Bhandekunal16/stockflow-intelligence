import { useState, useRef, useCallback, useEffect } from 'react';
import {
  screenerService,
  normalizeAndValidateCompanyCode,
} from '../services/screener.service';
import { ScreenerSnapshotData } from '../types/screener.types';

interface UseScreenerSnapshotOptions {
  onSuccess?: (data: ScreenerSnapshotData) => void;
  onError?: (message: string) => void;
}

export function useScreenerSnapshot(options?: UseScreenerSnapshotOptions) {
  const [snapshot, setSnapshot] = useState<ScreenerSnapshotData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const callbacksRef = useRef(options);
  callbacksRef.current = options;

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const fetchSnapshot = useCallback(async (rawCompanyCode: string) => {
    const validation = normalizeAndValidateCompanyCode(rawCompanyCode);
    if (!validation.valid) {
      const msg = validation.error || 'Invalid company code.';
      setError(msg);
      callbacksRef.current?.onError?.(msg);
      return null;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await screenerService.fetchSnapshot(
        validation.companyCode,
        controller.signal
      );

      if (controller.signal.aborted) return null;

      setSnapshot(data);
      setLastUpdated(data.time || new Date().toISOString());

      if (data.price === null || data.price === undefined) {
        const missingPriceMsg =
          'Stock snapshot succeeded, but current price is unavailable for this company.';
        setError(missingPriceMsg);
        callbacksRef.current?.onError?.(missingPriceMsg);
      } else {
        callbacksRef.current?.onSuccess?.(data);
      }

      return data;
    } catch (err: any) {
      if (
        err?.name === 'CanceledError' ||
        err?.name === 'AbortError' ||
        err?.code === 'ERR_CANCELED' ||
        controller.signal.aborted
      ) {
        return null;
      }

      if (err?.partialData && typeof err.partialData === 'object') {
        setSnapshot(err.partialData as ScreenerSnapshotData);
        setLastUpdated(err.partialData.time || new Date().toISOString());
      }

      const message = err?.message || 'Failed to fetch stock snapshot.';
      setError(message);
      callbacksRef.current?.onError?.(message);
      return null;
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  const clearSnapshot = useCallback(() => {
    abortControllerRef.current?.abort();
    setSnapshot(null);
    setLastUpdated(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    snapshot,
    loading,
    error,
    lastUpdated,
    fetchSnapshot,
    clearSnapshot,
    clearError,
  };
}
