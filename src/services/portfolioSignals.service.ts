import { apiClient } from './api';
import { PortfolioSignalsResponse } from '../types/portfolioSignals.types';

export const API_BASE_URL = 'https://stock-up-agent.vercel.app';
export const SIGNALS_ENDPOINT = `${API_BASE_URL}/api/portfolio/signals`;

export interface FetchPortfolioSignalsResult {
  data: PortfolioSignalsResponse;
  durationMs: number;
  httpStatus?: number;
}

function normalizeSignalsPayload(
  raw: unknown,
  httpStatus?: number
): PortfolioSignalsResponse {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      success: false,
      message:
        httpStatus === 504
          ? 'Script execution timed out'
          : 'Invalid response format received from Portfolio Signals API',
    };
  }

  const record = raw as Record<string, unknown>;
  const success = record.success === true;
  const exitCode = typeof record.exitCode === 'number' ? record.exitCode : undefined;
  const output = typeof record.output === 'string' ? record.output : '';
  const error = typeof record.error === 'string' ? record.error : undefined;
  const message = typeof record.message === 'string' ? record.message : undefined;

  return {
    success,
    exitCode,
    output,
    error,
    message,
  };
}

export const portfolioSignalsService = {
  /**
   * Execute Portfolio Signals script via GET /api/portfolio/signals
   * Routed through same-origin Express proxy in browser to avoid cross-origin CORS restrictions
   * while targeting https://stock-up-agent.vercel.app/api/portfolio/signals.
   */
  async generateSignals(signal?: AbortSignal): Promise<FetchPortfolioSignalsResult> {
    const startTime = performance.now();

    try {
      const response = await apiClient.get<PortfolioSignalsResponse>('/api/portfolio/signals', {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 120000,
        signal,
        validateStatus: (status) => status >= 200 && status < 600,
      });

      const durationMs = Math.round(performance.now() - startTime);
      const httpStatus = response.status;
      const normalized = normalizeSignalsPayload(response.data, httpStatus);

      if (httpStatus >= 500 && normalized.success) {
        normalized.success = false;
      }

      if (!normalized.success && !normalized.error && !normalized.message) {
        if (httpStatus === 504) {
          normalized.message = 'Script execution timed out';
        } else if (httpStatus >= 500) {
          normalized.message = `Failed to execute portfolio signals (HTTP ${httpStatus})`;
        } else {
          normalized.message = 'Failed to execute portfolio signals';
        }
      }

      return {
        data: normalized,
        durationMs,
        httpStatus,
      };
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') {
        throw err;
      }

      const durationMs = Math.round(performance.now() - startTime);
      const originalResponse = err?.originalError?.response;
      const httpStatus = originalResponse?.status ?? err?.statusCode;

      if (originalResponse?.data && typeof originalResponse.data === 'object') {
        const normalized = normalizeSignalsPayload(originalResponse.data, httpStatus);
        normalized.success = false;
        return {
          data: normalized,
          durationMs,
          httpStatus,
        };
      }

      let message = 'Failed to execute portfolio signals';
      if (httpStatus === 504 || err?.originalError?.code === 'ECONNABORTED') {
        message = 'Script execution timed out';
      } else if (err?.message) {
        message = err.message;
      }

      return {
        data: {
          success: false,
          message,
        },
        durationMs,
        httpStatus,
      };
    }
  },
};
