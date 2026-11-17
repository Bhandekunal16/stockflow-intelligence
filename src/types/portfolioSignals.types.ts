export interface PortfolioSignalsResponse {
  success: boolean;
  exitCode?: number;
  output?: string;
  error?: string;
  message?: string;
}

export type SignalExecutionStatus = 'idle' | 'running' | 'success' | 'failed';

export type SignalsApiConnectionStatus = 'ready' | 'connecting' | 'connected' | 'error';

export interface SignalExecutionResult {
  id: string;
  executedAt: string;
  status: 'success' | 'failed';
  exitCode?: number;
  output: string;
  errorMessage: string;
  durationMs: number;
  httpStatus?: number;
}
