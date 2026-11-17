import React from 'react';
import { History, CheckCircle2, AlertCircle } from 'lucide-react';
import { SignalExecutionResult } from '../../../types/portfolioSignals.types';
import { formatDateTime } from '../../../utils/date';

interface ExecutionHistoryProps {
  history: SignalExecutionResult[];
  selectedId: string | null;
  onSelect: (record: SignalExecutionResult) => void;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export const ExecutionHistory: React.FC<ExecutionHistoryProps> = ({
  history,
  selectedId,
  onSelect,
}) => {
  return (
    <section
      aria-labelledby="execution-history-heading"
      className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-default)] space-y-4"
    >
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-3 min-w-0">
          <div
            aria-hidden="true"
            className="w-9 h-9 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] text-[var(--accent-primary)] flex items-center justify-center flex-shrink-0"
          >
            <History className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3
              id="execution-history-heading"
              className="text-base font-bold text-[var(--text-primary)] truncate"
            >
              Session Execution History
            </h3>
            <p className="text-xs text-[var(--text-secondary)] truncate">
              Recent runs in this browser session (not persisted on backend)
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-[var(--text-secondary)] flex-shrink-0">
          {history.length} run{history.length !== 1 ? 's' : ''}
        </span>
      </div>

      {history.length === 0 ? (
        <div className="p-6 rounded-xl bg-[var(--bg-canvas)] border border-dashed border-[var(--border-default)] text-center">
          <p className="text-xs font-medium text-[var(--text-secondary)]">
            No executions recorded in this session yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border-default)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                <th className="py-2.5 pr-3">Timestamp</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Exit Code</th>
                <th className="py-2.5 pl-3 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]/60">
              {history.map((item) => {
                const isSelected = item.id === selectedId;
                const isSuccess = item.status === 'success';

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[var(--accent-primary)]/10'
                        : 'hover:bg-[var(--bg-elevated)]/40'
                    }`}
                  >
                    <td className="py-3 pr-3 font-mono text-[var(--text-primary)] whitespace-nowrap">
                      {formatDateTime(item.executedAt)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 font-semibold ${
                          isSuccess
                            ? 'text-[var(--status-success)]'
                            : 'text-[var(--status-error)]'
                        }`}
                      >
                        {isSuccess ? (
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                        <span>{isSuccess ? 'Success' : 'Failed'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[var(--text-secondary)] whitespace-nowrap">
                      {item.exitCode !== undefined ? item.exitCode : '—'}
                    </td>
                    <td className="py-3 pl-3 font-mono text-[var(--text-secondary)] text-right whitespace-nowrap">
                      {formatDuration(item.durationMs)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
