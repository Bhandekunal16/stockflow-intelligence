import { apiClient } from './api';
import {
  ScreenerCompanyPreset,
  ScreenerSnapshotData,
  ScreenerSnapshotResponse,
} from '../types/screener.types';

export const DEFAULT_COMPANY_CODE = 'TATAGOLD';
export const COMPANY_CODE_PATTERN = /^[A-Z0-9_-]+$/;

export const SCREENER_COMPANY_PRESETS: ScreenerCompanyPreset[] = [
  { label: 'Tata Gold ETF', code: 'TATAGOLD' },
  { label: 'Reliance Industries', code: 'RELIANCE' },
  { label: 'Tata Consultancy Services', code: 'TCS' },
  { label: 'Infosys', code: 'INFY' },
  { label: 'HDFC Bank', code: 'HDFCBANK' },
  { label: 'Suzlon Energy', code: 'SUZLON' },
];

export function getScreenerBaseUrl(): string {
  const configured = (
    import.meta.env.VITE_SCREENER_API_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    ''
  ).trim();

  if (configured) {
    if (
      typeof window !== 'undefined' &&
      window.location.protocol === 'https:' &&
      configured.startsWith('http://')
    ) {
      return '';
    }
    // Avoid calling localhost:3000 explicitly when already running on same-origin
    if (
      typeof window !== 'undefined' &&
      configured === window.location.origin
    ) {
      return '';
    }
    return configured.replace(/\/$/, '');
  }

  return '';
}

export function normalizeAndValidateCompanyCode(rawCode: string): {
  valid: boolean;
  companyCode: string;
  error?: string;
} {
  const normalized = rawCode.trim().toUpperCase();

  if (!normalized) {
    return {
      valid: false,
      companyCode: '',
      error: 'Company code is required (e.g. TATAGOLD, RELIANCE, TCS).',
    };
  }

  if (
    normalized.includes('HTTP://') ||
    normalized.includes('HTTPS://') ||
    normalized.includes('SCREENER.IN') ||
    normalized.includes('/')
  ) {
    return {
      valid: false,
      companyCode: normalized,
      error:
        'Enter a company code only (such as TATAGOLD or RELIANCE), not a full URL.',
    };
  }

  if (!COMPANY_CODE_PATTERN.test(normalized)) {
    return {
      valid: false,
      companyCode: normalized,
      error:
        'Invalid company code. Use only uppercase letters, numbers, underscores (_), or hyphens (-).',
    };
  }

  return {
    valid: true,
    companyCode: normalized,
  };
}

function buildErrorMessage(
  statusCode: number | undefined,
  rawData: any,
  fallback: string
): string {
  if (rawData && typeof rawData === 'object') {
    if (typeof rawData.message === 'string' && rawData.message.trim()) {
      return rawData.message.trim();
    }
    if (typeof rawData.error === 'string' && rawData.error.trim()) {
      return rawData.error.trim();
    }
  }

  switch (statusCode) {
    case 400:
      return 'Bad request (HTTP 400): Invalid or missing company code.';
    case 422:
      return 'Unprocessable stock data (HTTP 422): Missing stock price or unable to parse company page.';
    case 502:
      return 'Backend gateway error (HTTP 502): Unable to reach the Screener upstream service.';
    case 500:
      return 'Server error (HTTP 500): Unexpected failure while fetching Screener data.';
    default:
      return fallback;
  }
}

export const screenerService = {
  async fetchSnapshot(
    rawCompanyCode: string,
    signal?: AbortSignal
  ): Promise<ScreenerSnapshotData> {
    const validation = normalizeAndValidateCompanyCode(rawCompanyCode);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid company code.');
    }

    const base = getScreenerBaseUrl();
    const endpoint = `${base}/api/screener/snapshot`;

    try {
      const response = await apiClient.get<ScreenerSnapshotResponse>(endpoint, {
        params: { company: validation.companyCode },
        signal,
        timeout: 30000,
        validateStatus: (status) => status >= 200 && status < 600,
      });

      const payload = response.data;
      if (response.status >= 400 || !payload?.success) {
        const msg = buildErrorMessage(
          response.status,
          payload,
          `Snapshot request failed (HTTP ${response.status})`
        );
        const err = new Error(msg);
        (err as any).statusCode = response.status;
        if (payload?.data) {
          (err as any).partialData = {
            ...payload.data,
            companyCode: payload.companyCode || validation.companyCode,
          };
        }
        throw err;
      }

      if (!payload.data) {
        throw new Error('Stock snapshot returned empty data.');
      }

      return {
        ...payload.data,
        companyCode: payload.companyCode || validation.companyCode,
      };
    } catch (err: any) {
      if (
        err?.name === 'CanceledError' ||
        err?.name === 'AbortError' ||
        err?.code === 'ERR_CANCELED'
      ) {
        throw err;
      }

      if ((err as any).statusCode) {
        throw err;
      }

      const originalStatus =
        err?.originalError?.response?.status ?? err?.statusCode;
      const originalData = err?.originalError?.response?.data;
      const msg = buildErrorMessage(
        originalStatus,
        originalData,
        err?.message || 'Screener backend server is unavailable.'
      );
      const wrapped = new Error(msg);
      (wrapped as any).statusCode = originalStatus;
      if (originalData?.data) {
        (wrapped as any).partialData = {
          ...originalData.data,
          companyCode: originalData.companyCode || validation.companyCode,
        };
      }
      throw wrapped;
    }
  },

  async openStreamReader(options: {
    company: string;
    every: number;
    signal: AbortSignal;
  }): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    const validation = normalizeAndValidateCompanyCode(options.company);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid company code.');
    }

    const base = getScreenerBaseUrl();
    const params = new URLSearchParams();
    params.set('company', validation.companyCode);
    params.set('every', String(Math.max(5, options.every)));

    const streamUrl = `${base}/api/screener/stream?${params.toString()}`;
    const response = await fetch(streamUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/x-ndjson, application/json',
      },
      signal: options.signal,
    });

    if (!response.ok) {
      let parsedError: any = null;
      try {
        const text = await response.text();
        parsedError = JSON.parse(text);
      } catch {
        // Ignore non-JSON error body
      }
      const msg = buildErrorMessage(
        response.status,
        parsedError,
        `Stream connection failed (HTTP ${response.status})`
      );
      const err = new Error(msg);
      (err as any).statusCode = response.status;
      throw err;
    }

    if (!response.body) {
      throw new Error('Streaming response body is not supported in this browser.');
    }

    return response.body.getReader();
  },
};
