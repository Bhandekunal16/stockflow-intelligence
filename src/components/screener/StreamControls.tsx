import React from 'react';
import { Play, Square, RefreshCw, Radio, AlertCircle, Loader2 } from 'lucide-react';
import {
  ScreenerConnectionStatus,
  ScreenerPollingInterval,
} from '../../types/screener.types';
import { formatDateTime } from '../../utils/date';

interface StreamControlsProps {
  connectionStatus: ScreenerConnectionStatus;
  intervalSeconds: ScreenerPollingInterval;
  onIntervalChange: (interval: ScreenerPollingInterval) => void;
  onFetchSnapshot: () => void;
  onStartStream: () => void;
  onStopStream: () => void;
  isFetchingSnapshot: boolean;
  lastReceivedAt: string | null;
  hasCodeError?: boolean;
}

const POLLING_INTERVALS: ScreenerPollingInterval[] = [5, 15, 30, 60];

export const StreamControls: React.FC<StreamControlsProps> = ({
  connectionStatus,
  intervalSeconds,
  onIntervalChange,
  onFetchSnapshot,
  onStartStream,
  onStopStream,
  isFetchingSnapshot,
  lastReceivedAt,
  hasCodeError = false,
}) => {
  const isStreaming =
    connectionStatus === 'connecting' || connectionStatus === 'connected';

  const statusMeta = {
    disconnected: {
      label: 'Disconnected',
      pillClass:
        'bg-[var(--bg-canvas)] border-[var(--border-default)] text-[var(--text-secondary)]',
      icon: Radio,
    },
    connecting: {
      label: 'Connecting',
      pillClass:
        'bg-[var(--status-warning)]/10 border-[var(--status-warning)]/30 text-[var(--status-warning)]',
      icon: Loader2,
    },
    connected: {
      label: 'Connected',
      pillClass:
        'bg-[var(--status-success)]/10 border-[var(--status-success)]/30 text-[var(--status-success)]',
      icon: Radio,
    },
    error: {
      label: 'Error',
      pillClass:
        'bg-[var(--status-error)]/10 border-[var(--status-error)]/30 text-[var(--status-error)]',
      icon: AlertCircle,
    },
  }[connectionStatus];

  const StatusIcon = statusMeta.icon;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 border-t border-[var(--border-default)]">
      {/* Left: Polling Interval & Connection Status */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label
            htmlFor="screener-interval-select"
            className="text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap"
          >
            Polling Interval
          </label>
          <select
            id="screener-interval-select"
            value={intervalSeconds}
            disabled={isStreaming}
            onChange={(e) =>
              onIntervalChange(Number(e.target.value) as ScreenerPollingInterval)
            }
            className="px-3 py-2 min-h-[40px] rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] disabled:opacity-50 cursor-pointer"
          >
            {POLLING_INTERVALS.map((sec) => (
              <option key={sec} value={sec}>
                Every {sec}s
              </option>
            ))}
          </select>
        </div>

        <div
          role="status"
          aria-live="polite"
          className={`inline-flex items-center gap-2 px-3 py-1.5 min-h-[36px] rounded-xl border text-xs font-semibold ${statusMeta.pillClass}`}
        >
          <StatusIcon
            className={`w-3.5 h-3.5 ${
              connectionStatus === 'connecting' ? 'animate-spin' : ''
            }`}
            aria-hidden="true"
          />
          <span>{statusMeta.label}</span>
        </div>

        {lastReceivedAt && (
          <span className="text-[11px] font-mono text-[var(--text-secondary)]">
            Last packet: {formatDateTime(lastReceivedAt)}
          </span>
        )}
      </div>

      {/* Right: Primary Actions */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onFetchSnapshot}
          disabled={isFetchingSnapshot || hasCodeError}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl bg-[var(--bg-canvas)] hover:bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              isFetchingSnapshot ? 'animate-spin text-[var(--accent-primary)]' : ''
            }`}
            aria-hidden="true"
          />
          <span>{isFetchingSnapshot ? 'Fetching...' : 'Fetch Snapshot'}</span>
        </button>

        {isStreaming ? (
          <button
            type="button"
            onClick={onStopStream}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl bg-[var(--status-error)]/15 hover:bg-[var(--status-error)]/25 border border-[var(--status-error)]/40 text-[var(--status-error)] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            <span>Stop Streaming</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onStartStream}
            disabled={hasCodeError}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-[var(--accent-contrast)] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Start Streaming</span>
          </button>
        )}
      </div>
    </div>
  );
};
