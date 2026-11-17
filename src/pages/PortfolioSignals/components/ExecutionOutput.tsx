import React, { useState } from 'react';
import { Terminal, Copy, Check, Loader2 } from 'lucide-react';
import { SignalExecutionStatus } from '../../../types/portfolioSignals.types';

interface ExecutionOutputProps {
  status: SignalExecutionStatus;
  output: string;
  hasRun: boolean;
}

export const ExecutionOutput: React.FC<ExecutionOutputProps> = ({
  status,
  output,
  hasRun,
}) => {
  const [copied, setCopied] = useState(false);
  const isRunning = status === 'running';
  const hasOutput = output.trim().length > 0;

  const handleCopy = async () => {
    if (!hasOutput) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard permission failures
    }
  };

  return (
    <section
      aria-labelledby="execution-output-heading"
      className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-default)] flex flex-col"
    >
      <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-3 min-w-0">
          <div
            aria-hidden="true"
            className="w-9 h-9 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] text-[var(--accent-primary)] flex items-center justify-center flex-shrink-0"
          >
            <Terminal className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3
              id="execution-output-heading"
              className="text-base font-bold text-[var(--text-primary)] truncate"
            >
              Execution Output
            </h3>
            <p className="text-xs text-[var(--text-secondary)] truncate">
              Raw output returned by the Portfolio Signals API
            </p>
          </div>
        </div>

        {hasOutput && !isRunning && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy execution output"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer flex-shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[var(--status-success)]" aria-hidden="true" />
                <span className="text-[var(--status-success)]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="rounded-xl bg-[var(--bg-sidebar)] border border-[var(--border-default)] overflow-hidden">
        {/* Terminal top bar */}
        <div className="px-4 py-2 border-b border-[var(--border-default)]/70 flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)]">
          <span>stdout</span>
          <span
            className={
              isRunning
                ? 'text-[var(--status-warning)]'
                : status === 'success'
                ? 'text-[var(--status-success)]'
                : status === 'failed'
                ? 'text-[var(--status-error)]'
                : 'text-[var(--text-secondary)]'
            }
          >
            {isRunning
              ? 'running...'
              : status === 'success'
              ? 'completed'
              : status === 'failed'
              ? 'failed'
              : 'idle'}
          </span>
        </div>

        {/* Scrollable output body */}
        <div className="p-4 max-h-96 min-h-[180px] overflow-auto font-mono text-xs leading-relaxed">
          {isRunning ? (
            <div className="flex items-center gap-2.5 text-[var(--status-warning)]">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" aria-hidden="true" />
              <span>Executing portfolio signal generation script on remote endpoint...</span>
            </div>
          ) : hasOutput ? (
            <pre className="text-[var(--text-primary)] whitespace-pre font-mono">
              {output}
            </pre>
          ) : hasRun ? (
            <p className="text-[var(--text-secondary)] italic">
              No standard output returned for this execution.
            </p>
          ) : (
            <p className="text-[var(--text-secondary)]">
              Click &ldquo;Generate Signals&rdquo; to run the Portfolio Signals API and view execution output.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
