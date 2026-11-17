import { apiClient } from "./api";
import { PortfolioSignalsResponse } from "../types/portfolioSignals.types";

export const API_BASE_URL = "https://stock-up-agent.vercel.app";
export const SIGNALS_ENDPOINT = `${API_BASE_URL}/api/portfolio/signals`;

export interface FetchPortfolioSignalsResult {
  data: PortfolioSignalsResponse;
  durationMs: number;
  httpStatus?: number;
}

function normalizeSignalsPayload(
  raw: unknown,
  httpStatus?: number,
): PortfolioSignalsResponse {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      success: false,
      message:
        httpStatus === 504
          ? "Script execution timed out"
          : "Invalid response format received from Portfolio Signals API",
    };
  }

  const record = raw as Record<string, unknown>;
  const success = record.success === true;
  const exitCode =
    typeof record.exitCode === "number" ? record.exitCode : undefined;
  const output = typeof record.output === "string" ? record.output : "";
  const error = typeof record.error === "string" ? record.error : undefined;
  const message =
    typeof record.message === "string" ? record.message : undefined;

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

  async generateSignals(
    signal?: AbortSignal,
  ): Promise<FetchPortfolioSignalsResult> {
    const startTime = performance.now();

    try {
      const response = await fetch(SIGNALS_ENDPOINT, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal,
      });

      const durationMs = Math.round(performance.now() - startTime);
      const httpStatus = response.status;

      const raw = await response.json();
      const normalized = normalizeSignalsPayload(raw, httpStatus);

      if (!response.ok && normalized.success) {
        normalized.success = false;
      }

      if (!normalized.success && !normalized.error && !normalized.message) {
        normalized.message =
          httpStatus === 504
            ? "Script execution timed out"
            : `Failed to execute portfolio signals (HTTP ${httpStatus})`;
      }

      return {
        data: normalized,
        durationMs,
        httpStatus,
      };
    } catch (err: any) {
      if (
        err?.name === "AbortError" ||
        err?.name === "CanceledError" ||
        err?.code === "ERR_CANCELED"
      ) {
        throw err;
      }

      return {
        data: {
          success: false,
          message: err?.message || "Failed to connect to Portfolio Signals API",
        },
        durationMs: Math.round(performance.now() - startTime),
      };
    }
  },
};
