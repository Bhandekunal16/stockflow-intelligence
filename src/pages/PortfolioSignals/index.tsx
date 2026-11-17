import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RefreshCw, AlertTriangle } from 'lucide-react';
import { portfolioSignalsService } from '../../services/portfolioSignals.service';
import {
  SignalExecutionResult,
  SignalExecutionStatus,
} from '../../types/portfolioSignals.types';
import { useToast } from '../../components/common/Toast';
import { formatDateTime } from '../../utils/date';
import { ExecutionSummary } from './components/ExecutionSummary';
import { ExecutionOutput } from './components/ExecutionOutput';
import { ExecutionHistory } from './components/ExecutionHistory';

export const PortfolioSignals: React.FC = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [status, setStatus] = useState<SignalExecutionStatus>('idle');
  const [history, setHistory] = useState<SignalExecutionResult[]>([]);
  const [activeResult, setActiveResult] = useState<SignalExecutionResult | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleGenerateSignals = useCallback(async () => {
    if (status === 'running') return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStatus('running');

    try {
      const { data, durationMs, httpStatus } =
        await portfolioSignalsService.generateSignals(controller.signal);

      if (controller.signal.aborted) return;

      const isSuccess = data.success === true;
      const errorText = isSuccess
        ? ''
        : data.error?.trim() || data.message?.trim() || 'Script execution failed';

      const record: SignalExecutionResult = {
        id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        executedAt: new Date().toISOString(),
        status: isSuccess ? 'success' : 'failed',
        exitCode: data.exitCode,
        output: data.output || '',
        errorMessage: errorText,
        durationMs,
        httpStatus,
      };

      setActiveResult(record);
      setHistory((prev) => [record, ...prev].slice(0, 15));

      if (isSuccess) {
        setStatus('success');
        toastSuccess(
          'Portfolio Signals Generated',
          data.output?.trim()
            ? data.output.trim().slice(0, 120)
            : 'Signal generation script completed successfully.'
        );
      } else {
        setStatus('failed');
        toastError('Signal Generation Failed', errorText);
      }
    } catch (err: any) {
      if (
        err?.name === 'CanceledError' ||
        err?.name === 'AbortError' ||
        err?.code === 'ERR_CANCELED' ||
        controller.signal.aborted
      ) {
        return;
      }

      const fallbackMessage =
        err?.message || 'Failed to execute portfolio signals';
      const record: SignalExecutionResult = {
        id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        executedAt: new Date().toISOString(),
        status: 'failed',
        output: '',
        errorMessage: fallbackMessage,
        durationMs: 0,
      };

      setActiveResult(record);
      setHistory((prev) => [record, ...prev].slice(0, 15));
      setStatus('failed');
      toastError('Signal Generation Error', fallbackMessage);
    }
  }, [status, toastSuccess, toastError]);

  const isRunning = status === 'running';
  const latestTimestamp = history[0]?.executedAt || activeResult?.executedAt || null;
  const displayedError =
    !isRunning && activeResult?.status === 'failed' && activeResult.errorMessage
      ? activeResult.errorMessage
      : '';

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Portfolio Signals
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Analyze portfolio data and generate trading signals.
          </p>
          <p className="text-[11px] font-mono text-[var(--text-secondary)] mt-1.5">
            Last executed:{' '}
            <span className="text-[var(--text-primary)]">
              {latestTimestamp ? formatDateTime(latestTimestamp) : 'Not executed yet'}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateSignals}
          disabled={isRunning}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-[var(--accent-contrast)] text-xs font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer self-start sm:self-auto"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Generating Signals...</span>
            </>
          ) : activeResult ? (
            <>
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span>Refresh Signals</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" aria-hidden="true" />
              <span>Generate Signals</span>
            </>
          )}
        </button>
      </div>

      {/* A. Execution Summary */}
      <ExecutionSummary status={status} latestResult={activeResult} />

      {/* C. Error Details (shown only when an error exists) */}
      {displayedError && (
        <section
          role="alert"
          aria-labelledby="signal-error-heading"
          className="p-5 rounded-2xl bg-[var(--status-error)]/10 border border-[var(--status-error)]/30 space-y-2"
        >
          <div className="flex items-center gap-2.5 text-[var(--status-error)]">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <h3 id="signal-error-heading" className="text-sm font-bold">
              Error Details
            </h3>
            {activeResult?.httpStatus && (
              <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--status-error)]/15 border border-[var(--status-error)]/30">
                HTTP {activeResult.httpStatus}
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap break-words">
            {displayedError}
          </p>
        </section>
      )}

      {/* B. Execution Output */}
      <ExecutionOutput
        status={status}
        output={activeResult?.output || ''}
        hasRun={Boolean(activeResult)}
      />

      {/* Session Execution History */}
      <ExecutionHistory
        history={history}
        selectedId={activeResult?.id || null}
        onSelect={(record) => {
          if (!isRunning) {
            setActiveResult(record);
            setStatus(record.status);
          }
        }}
      />
    </div>
  );
};
