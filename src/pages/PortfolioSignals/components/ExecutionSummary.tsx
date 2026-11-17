import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Terminal,
  Timer,
  Hash,
} from 'lucide-react';
import { KpiCard, KpiAccent, KpiValueTone } from '../../../components/common/KpiCard';
import {
  SignalExecutionResult,
  SignalExecutionStatus,
} from '../../../types/portfolioSignals.types';
import { formatDateTime } from '../../../utils/date';

interface ExecutionSummaryProps {
  status: SignalExecutionStatus;
  latestResult: SignalExecutionResult | null;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export const ExecutionSummary: React.FC<ExecutionSummaryProps> = ({
  status,
  latestResult,
}) => {
  const isRunning = status === 'running';

  let statusLabel = 'Not Run';
  let statusDescription = 'Ready to generate signals';
  let statusIcon = Clock;
  let statusAccent: KpiAccent = 'gray';
  let statusTone: KpiValueTone = 'default';

  if (isRunning) {
    statusLabel = 'Running';
    statusDescription = 'Executing portfolio signals script...';
    statusIcon = Loader2;
    statusAccent = 'amber';
    statusTone = 'default';
  } else if (status === 'success') {
    statusLabel = 'Success';
    statusDescription = 'Signal generation completed';
    statusIcon = CheckCircle2;
    statusAccent = 'green';
    statusTone = 'success';
  } else if (status === 'failed') {
    statusLabel = 'Failed';
    statusDescription = latestResult?.httpStatus
      ? `HTTP ${latestResult.httpStatus} execution error`
      : 'Script returned an error';
    statusIcon = AlertCircle;
    statusAccent = 'red';
    statusTone = 'error';
  }

  const exitCodeValue = isRunning
    ? '...'
    : latestResult?.exitCode !== undefined
    ? String(latestResult.exitCode)
    : '—';

  const exitCodeAccent: KpiAccent = isRunning
    ? 'amber'
    : latestResult?.exitCode === undefined
    ? 'gray'
    : latestResult.exitCode === 0
    ? 'green'
    : 'red';

  const exitCodeTone: KpiValueTone = isRunning
    ? 'default'
    : latestResult?.exitCode === undefined
    ? 'default'
    : latestResult.exitCode === 0
    ? 'success'
    : 'error';

  const exitCodeDesc = isRunning
    ? 'Awaiting process exit'
    : latestResult?.exitCode !== undefined
    ? latestResult.exitCode === 0
      ? 'Clean process termination'
      : 'Non-zero exit status'
    : 'No exit code reported';

  const lastExecValue = isRunning
    ? 'In progress'
    : latestResult
    ? new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(new Date(latestResult.executedAt))
    : 'Not run';

  const lastExecDesc = isRunning
    ? 'Request currently active'
    : latestResult
    ? formatDateTime(latestResult.executedAt)
    : 'Click Generate Signals to run';

  const durationValue = isRunning
    ? 'Measuring...'
    : latestResult
    ? formatDuration(latestResult.durationMs)
    : '—';

  const durationDesc = isRunning
    ? 'Waiting for API response'
    : latestResult
    ? 'Total round-trip execution time'
    : 'Measured per execution';

  return (
    <section aria-label="Execution Summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      <KpiCard
        title="Execution Status"
        value={
          isRunning ? (
            <span className="text-[var(--status-warning)]">{statusLabel}</span>
          ) : (
            statusLabel
          )
        }
        description={statusDescription}
        icon={statusIcon}
        accent={statusAccent}
        valueTone={statusTone}
        tooltip={`Execution Status: ${statusLabel}`}
      />

      <KpiCard
        title="Exit Code"
        value={exitCodeValue}
        description={exitCodeDesc}
        icon={Hash}
        accent={exitCodeAccent}
        valueTone={exitCodeTone}
        tooltip={`Process Exit Code: ${exitCodeValue}`}
      />

      <KpiCard
        title="Last Execution"
        value={lastExecValue}
        description={lastExecDesc}
        icon={Terminal}
        accent={isRunning ? 'amber' : latestResult ? 'violet' : 'gray'}
        tooltip={`Last Execution: ${lastExecDesc}`}
      />

      <KpiCard
        title="Execution Duration"
        value={durationValue}
        description={durationDesc}
        icon={Timer}
        accent={isRunning ? 'amber' : latestResult ? 'violet' : 'gray'}
        tooltip={`Execution Duration: ${durationValue}`}
      />
    </section>
  );
};
