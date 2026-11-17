import React, { useState, useMemo, useCallback } from 'react';
import { AlertTriangle, Activity, Trash2 } from 'lucide-react';
import {
  DEFAULT_COMPANY_CODE,
  normalizeAndValidateCompanyCode,
} from '../services/screener.service';
import { useScreenerSnapshot } from '../hooks/useScreenerSnapshot';
import { useScreenerStream } from '../hooks/useScreenerStream';
import {
  ScreenerPollingInterval,
  ScreenerStreamRecord,
} from '../types/screener.types';
import { useToast } from '../components/common/Toast';
import { StockSelector } from '../components/screener/StockSelector';
import { StockOverview } from '../components/screener/StockOverview';
import { StockRatios } from '../components/screener/StockRatios';
import { StockPriceChart } from '../components/screener/StockPriceChart';
import { formatDateTime } from '../utils/date';

export const ScreenerDashboard: React.FC = () => {
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  // Strictly kept in React state (no localStorage/sessionStorage)
  const [companyCode, setCompanyCode] = useState<string>(DEFAULT_COMPANY_CODE);
  const [inputCode, setInputCode] = useState<string>(DEFAULT_COMPANY_CODE);
  const [intervalSeconds, setIntervalSeconds] =
    useState<ScreenerPollingInterval>(30);

  const {
    snapshot,
    loading: snapshotLoading,
    error: snapshotError,
    fetchSnapshot,
    clearSnapshot,
    clearError: clearSnapshotError,
  } = useScreenerSnapshot({
    onSuccess: (data) => {
      toastSuccess(
        'Snapshot Loaded',
        `${data.companyCode || companyCode} • ${
          data.price !== null ? `₹${data.price}` : data.company
        }`
      );
    },
    onError: (message) => {
      toastError('Snapshot Fetch Failed', message);
    },
  });

  const {
    connectionStatus,
    records: streamRecords,
    latestRecord,
    error: streamError,
    lastReceivedAt,
    startStream,
    stopStream,
    resetHistory,
  } = useScreenerStream({
    onConnected: () => {
      toastInfo(
        'Stream Connected',
        `Monitoring ${companyCode} every ${intervalSeconds}s.`
      );
    },
    onError: (message) => {
      toastError('Screener Stream Error', message);
    },
  });

  // Active data prioritizes latest streamed record when available; falls back to manual snapshot
  const activeData = latestRecord ?? snapshot;

  // Combine snapshot + stream records for the price line chart without duplicates
  const combinedPriceRecords = useMemo<ScreenerStreamRecord[]>(() => {
    const merged: ScreenerStreamRecord[] = [];
    const seen = new Set<string>();

    if (snapshot) {
      const key = `${snapshot.time}-${snapshot.price}`;
      seen.add(key);
      merged.push({
        ...snapshot,
        changed: false,
        receivedAt: snapshot.time,
      });
    }

    for (const rec of streamRecords) {
      const key = `${rec.time}-${rec.price}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(rec);
      }
    }

    return merged;
  }, [snapshot, streamRecords]);

  // Switch company cleanly: stop previous stream, reset history, fetch new snapshot, do NOT auto-stream
  const switchCompanyAndFetch = useCallback(
    (nextCode: string) => {
      stopStream(true);
      resetHistory();
      clearSnapshot();
      setCompanyCode(nextCode);
      setInputCode(nextCode);
      fetchSnapshot(nextCode);
    },
    [stopStream, resetHistory, clearSnapshot, fetchSnapshot]
  );

  const handleSelectCompanyCode = useCallback(
    (presetCode: string) => {
      const validation = normalizeAndValidateCompanyCode(presetCode);
      if (!validation.valid) return;
      switchCompanyAndFetch(validation.companyCode);
    },
    [switchCompanyAndFetch]
  );

  const handleFetchSnapshot = useCallback(() => {
    const validation = normalizeAndValidateCompanyCode(inputCode);
    if (!validation.valid) {
      toastError('Invalid Company Code', validation.error || 'Enter a valid company code.');
      return;
    }

    if (validation.companyCode !== companyCode) {
      switchCompanyAndFetch(validation.companyCode);
    } else {
      clearSnapshotError();
      fetchSnapshot(validation.companyCode);
    }
  }, [
    inputCode,
    companyCode,
    toastError,
    switchCompanyAndFetch,
    clearSnapshotError,
    fetchSnapshot,
  ]);

  const handleStartStream = useCallback(() => {
    const validation = normalizeAndValidateCompanyCode(inputCode);
    if (!validation.valid) {
      toastError('Invalid Company Code', validation.error || 'Enter a valid company code.');
      return;
    }

    if (validation.companyCode !== companyCode) {
      stopStream(true);
      resetHistory();
      clearSnapshot();
      setCompanyCode(validation.companyCode);
      setInputCode(validation.companyCode);
    } else {
      clearSnapshotError();
    }

    startStream(validation.companyCode, intervalSeconds);
  }, [
    inputCode,
    companyCode,
    intervalSeconds,
    toastError,
    stopStream,
    resetHistory,
    clearSnapshot,
    clearSnapshotError,
    startStream,
  ]);

  const activeError = streamError || snapshotError;
  const reversedRecords = useMemo(
    () => [...streamRecords].reverse(),
    [streamRecords]
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
          Live Stock Screener
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Monitor Screener.in stock snapshots, financial ratios, and continuous NDJSON updates by company code.
        </p>
      </div>

      {/* Company Selection & Stream Controls */}
      <StockSelector
        activeCompanyCode={companyCode}
        inputCode={inputCode}
        onInputCodeChange={setInputCode}
        onSelectCompanyCode={handleSelectCompanyCode}
        intervalSeconds={intervalSeconds}
        onIntervalChange={setIntervalSeconds}
        connectionStatus={connectionStatus}
        onFetchSnapshot={handleFetchSnapshot}
        onStartStream={handleStartStream}
        onStopStream={() => stopStream(false)}
        isFetchingSnapshot={snapshotLoading}
        lastReceivedAt={lastReceivedAt}
      />

      {/* Inline Error Alert (only when error exists) */}
      {activeError && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-[var(--status-error)]/10 border border-[var(--status-error)]/30 flex items-start gap-3"
        >
          <AlertTriangle
            className="w-5 h-5 text-[var(--status-error)] flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[var(--status-error)]">
              Screener API Notice
            </h3>
            <p className="text-xs text-[var(--text-primary)] mt-0.5 leading-relaxed">
              {activeError}
            </p>
          </div>
        </div>
      )}

      {/* Stock Overview KPI Cards */}
      <StockOverview
        companyCode={companyCode}
        data={activeData}
        priceChanged={Boolean(latestRecord?.changed)}
      />

      {/* Price Chart + Dynamic Ratios Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <StockPriceChart records={combinedPriceRecords} />
        <StockRatios ratios={activeData?.ratios} />
      </div>

      {/* Received Stream Records Table */}
      <section
        aria-labelledby="stream-records-heading"
        className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-default)] space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3 min-w-0">
            <div
              aria-hidden="true"
              className="w-9 h-9 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] text-[var(--accent-primary)] flex items-center justify-center flex-shrink-0"
            >
              <Activity className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3
                id="stream-records-heading"
                className="text-base font-bold text-[var(--text-primary)] truncate"
              >
                Streamed Price Records ({companyCode})
              </h3>
              <p className="text-xs text-[var(--text-secondary)] truncate">
                Periodic polled snapshots from Screener.in (not exchange-level tick data)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              {streamRecords.length} record{streamRecords.length !== 1 ? 's' : ''}
            </span>
            {streamRecords.length > 0 && (
              <button
                type="button"
                onClick={resetHistory}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {reversedRecords.length === 0 ? (
          <div className="p-6 rounded-xl bg-[var(--bg-canvas)] border border-dashed border-[var(--border-default)] text-center">
            <p className="text-xs text-[var(--text-secondary)]">
              No streamed records received yet for {companyCode}. Click &ldquo;Start Streaming&rdquo; to begin periodic monitoring.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-default)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  <th className="py-2.5 pr-4">Timestamp</th>
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">Stock P/E</th>
                  <th className="py-2.5 px-3 text-right">High / Low</th>
                  <th className="py-2.5 pl-3 text-right">Change Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]/60">
                {reversedRecords.map((rec, idx) => (
                  <tr
                    key={`${rec.time}-${idx}`}
                    className={`transition-colors ${
                      rec.changed
                        ? 'bg-[var(--status-success)]/5 hover:bg-[var(--status-success)]/10'
                        : 'hover:bg-[var(--bg-elevated)]/30'
                    }`}
                  >
                    <td className="py-3 pr-4 font-mono text-[var(--text-primary)] whitespace-nowrap">
                      {formatDateTime(rec.time)}
                    </td>
                    <td className="py-3 px-3 text-[var(--text-secondary)] max-w-[200px] truncate">
                      {rec.company}
                    </td>
                    <td
                      className={`py-3 px-3 font-mono font-bold text-right whitespace-nowrap ${
                        rec.changed
                          ? 'text-[var(--status-success)]'
                          : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {rec.price !== null
                        ? `₹${rec.price.toLocaleString('en-IN')}`
                        : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[var(--text-secondary)] text-right whitespace-nowrap">
                      {rec.stockPE !== null ? rec.stockPE : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[var(--text-secondary)] text-right whitespace-nowrap">
                      {rec.high !== null || rec.low !== null
                        ? `${rec.high ?? '—'} / ${rec.low ?? '—'}`
                        : '—'}
                    </td>
                    <td className="py-3 pl-3 text-right whitespace-nowrap">
                      {rec.changed ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--status-success)]/15 border border-[var(--status-success)]/30 text-[var(--status-success)] font-semibold">
                          Changed
                        </span>
                      ) : (
                        <span className="text-[var(--text-secondary)] font-medium">
                          Unchanged
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
