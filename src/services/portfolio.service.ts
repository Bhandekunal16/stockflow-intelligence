import { apiClient } from './api';
import {
  ExtractionResponse,
  HistoricalResponse,
  SnapshotDetailResponse,
  HealthCheckResponse,
  PortfolioSnapshot,
} from '../types/portfolio.types';

export const portfolioService = {
  /**
   * Health check
   * GET /
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    const response = await apiClient.get<HealthCheckResponse>('/', {
      params: { format: 'json' },
    });
    return response.data;
  },

  /**
   * Extract portfolio from uploaded screenshot
   * POST /api/portfolio/extract
   * Content-Type: multipart/form-data, field name: 'image'
   */
  async extractPortfolio(
    file: File,
    onUploadProgress?: (percentage: number) => void
  ): Promise<ExtractionResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<ExtractionResponse>('/api/portfolio/extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress?.(percentCompleted);
        }
      },
    });

    return response.data;
  },

  /**
   * Retrieve all historical portfolio snapshots
   * GET /api/portfolio
   */
  async getAllSnapshots(): Promise<HistoricalResponse> {
    try {
      const response = await apiClient.get<HistoricalResponse>('/api/portfolio');
      return response.data;
    } catch (err: any) {
      // 404 means no records found yet, handle cleanly
      if (err.statusCode === 404) {
        return {
          success: false,
          count: 0,
          data: [],
          message: 'No portfolio records found',
          statusCode: 404,
        };
      }
      throw err;
    }
  },

  /**
   * Retrieve snapshot for a specific date (YYYY-MM-DD)
   * GET /api/portfolio/:date
   */
  async getSnapshotByDate(date: string): Promise<SnapshotDetailResponse> {
    const response = await apiClient.get<any>(`/api/portfolio/${date}`);
    const resData = response.data;

    // The backend API might return { data: [ { ...snapshot } ] } or { data: { ...snapshot } }
    if (resData && resData.data) {
      if (Array.isArray(resData.data)) {
        const found =
          resData.data.find((s: PortfolioSnapshot) => s.date === date) || resData.data[0] || null;
        return {
          ...resData,
          data: found,
        };
      }
    }

    return resData;
  },

  /**
   * Reset / clear snapshots (optional utility for settings)
   * DELETE /api/portfolio
   */
  async clearAllSnapshots(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>('/api/portfolio');
    return response.data;
  },
};
