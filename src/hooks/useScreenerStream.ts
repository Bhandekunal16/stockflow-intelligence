import { useState, useRef, useCallback, useEffect } from 'react';
import {
  screenerService,
  normalizeAndValidateCompanyCode,
} from '../services/screener.service';
import {
  ScreenerConnectionStatus,
  ScreenerSnapshotData,
  ScreenerStreamRecord,
} from '../types/screener.types';

interface UseScreenerStreamOptions {
  onRecord?: (record: ScreenerStreamRecord) => void;
  onError?: (message: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

const MAX_STREAM_HISTORY = 60;

export function useScreenerStream(options?: UseScreenerStreamOptions) {
  const [connectionStatus, setConnectionStatus] =
    useState<ScreenerConnectionStatus>('disconnected');
  const [records, setRecords] = useState<ScreenerStreamRecord[]>([]);
  const [latestRecord, setLatestRecord] = useState<ScreenerStreamRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastReceivedAt, setLastReceivedAt] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const activeSessionRef = useRef<number>(0);
  const activeCompanyRef = useRef<string>('');
  const callbacksRef = useRef(options);
  callbacksRef.current = options;

  const stopStream = useCallback((silent = false) => {
    activeSessionRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setConnectionStatus((prev) =>
      prev === 'disconnected' ? prev : 'disconnected'
    );
    if (!silent) {
      callbacksRef.current?.onDisconnected?.();
    }
  }, []);

  useEffect(() => {
    return () => {
      activeSessionRef.current += 1;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
  }, []);

  const processLine = useCallback(
    (rawLine: string, sessionId: number, companyCode: string) => {
      if (activeSessionRef.current !== sessionId) return;
      const trimmed = rawLine.trim();
      if (!trimmed) return;

      let parsed: any;
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        const msg = 'Received malformed NDJSON record from stock stream.';
        setError(msg);
        callbacksRef.current?.onError?.(msg);
        return;
      }

      if (!parsed || typeof parsed !== 'object') {
        return;
      }

      if (parsed.success === false) {
        const msg =
          parsed.message || parsed.error || 'Stream reported a stock extraction error.';
        setError(msg);
        callbacksRef.current?.onError?.(msg);
        return;
      }

      const payload: ScreenerSnapshotData =
        parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;

      const record: ScreenerStreamRecord = {
        time: typeof payload.time === 'string' ? payload.time : new Date().toISOString(),
        company:
          typeof payload.company === 'string' ? payload.company : companyCode,
        companyCode:
          typeof parsed.companyCode === 'string'
            ? parsed.companyCode
            : typeof payload.companyCode === 'string'
            ? payload.companyCode
            : companyCode,
        price: typeof payload.price === 'number' ? payload.price : null,
        marketCap: typeof payload.marketCap === 'number' ? payload.marketCap : null,
        stockPE: typeof payload.stockPE === 'number' ? payload.stockPE : null,
        high: typeof payload.high === 'number' ? payload.high : null,
        low: typeof payload.low === 'number' ? payload.low : null,
        ratios:
          payload.ratios && typeof payload.ratios === 'object' ? payload.ratios : {},
        chunks: typeof payload.chunks === 'number' ? payload.chunks : undefined,
        totalChars: typeof payload.totalChars === 'number' ? payload.totalChars : undefined,
        changed: Boolean(parsed.changed),
        receivedAt: new Date().toISOString(),
      };

      setLatestRecord(record);
      setLastReceivedAt(record.receivedAt);

      if (record.price === null) {
        const missingMsg = `Missing stock price in streamed update for ${record.companyCode || companyCode}.`;
        setError(missingMsg);
      }

      setRecords((prev) => {
        const isDuplicate = prev.some(
          (existing) => existing.time === record.time && existing.price === record.price
        );
        if (isDuplicate) {
          return prev;
        }
        return [...prev, record].slice(-MAX_STREAM_HISTORY);
      });

      callbacksRef.current?.onRecord?.(record);
    },
    []
  );

  const startStream = useCallback(
    async (rawCompanyCode: string, everySeconds: number) => {
      const validation = normalizeAndValidateCompanyCode(rawCompanyCode);
      if (!validation.valid) {
        const msg = validation.error || 'Invalid company code.';
        setError(msg);
        setConnectionStatus('error');
        callbacksRef.current?.onError?.(msg);
        return;
      }

      // Ensure no multiple simultaneous streams
      activeSessionRef.current += 1;
      const sessionId = activeSessionRef.current;
      activeCompanyRef.current = validation.companyCode;
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setConnectionStatus('connecting');
      setError(null);

      let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

      try {
        reader = await screenerService.openStreamReader({
          company: validation.companyCode,
          every: everySeconds,
          signal: controller.signal,
        });

        if (controller.signal.aborted || activeSessionRef.current !== sessionId) {
          await reader.cancel().catch(() => {});
          return;
        }

        setConnectionStatus('connected');
        callbacksRef.current?.onConnected?.();

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (controller.signal.aborted || activeSessionRef.current !== sessionId) {
            break;
          }

          if (value) {
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';
            for (const line of lines) {
              processLine(line, sessionId, validation.companyCode);
            }
          }

          if (done) {
            buffer += decoder.decode();
            if (buffer.trim()) {
              processLine(buffer, sessionId, validation.companyCode);
            }
            if (activeSessionRef.current === sessionId) {
              setConnectionStatus('disconnected');
              callbacksRef.current?.onDisconnected?.();
            }
            break;
          }
        }
      } catch (err: any) {
        if (
          err?.name === 'AbortError' ||
          controller.signal.aborted ||
          activeSessionRef.current !== sessionId
        ) {
          return;
        }

        const msg = err?.message || 'Stock price stream disconnected unexpectedly.';
        setError(msg);
        setConnectionStatus('error');
        callbacksRef.current?.onError?.(msg);
      } finally {
        if (reader) {
          try {
            reader.releaseLock();
          } catch {
            // Reader may already be released
          }
        }
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [processLine]
  );

  const resetHistory = useCallback(() => {
    setRecords([]);
    setLatestRecord(null);
    setLastReceivedAt(null);
    setError(null);
  }, []);

  return {
    connectionStatus,
    records,
    latestRecord,
    error,
    lastReceivedAt,
    startStream,
    stopStream,
    resetHistory,
  };
}
