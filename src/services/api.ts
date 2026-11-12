import axios from 'axios';

// Get base URL from environment or fallback to relative URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // 45 seconds for vision OCR extraction
  headers: {
    Accept: 'application/json',
  },
});

// Response error handler for consistent status code parsing
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let customMessage = 'An unexpected error occurred. Please try again.';
    const statusCode = error.response?.status;
    const backendMessage = error.response?.data?.message;

    if (backendMessage) {
      customMessage = backendMessage;
    } else if (statusCode === 400) {
      customMessage = 'Invalid request or missing image.';
    } else if (statusCode === 404) {
      customMessage = 'No portfolio records found.';
    } else if (statusCode === 413) {
      customMessage = 'File size exceeds 10 MB limit. Please upload a smaller image.';
    } else if (statusCode === 422) {
      customMessage = 'Portfolio extraction failed. Unable to identify readable stock entries from this image.';
    } else if (statusCode === 500) {
      customMessage = 'Internal server error occurred while processing the portfolio.';
    } else if (error.code === 'ECONNABORTED') {
      customMessage = 'Request timed out. The extraction service took too long to respond.';
    } else if (!error.response) {
      customMessage = 'Network error: Unable to reach the portfolio API server.';
    }

    const enhancedError = new Error(customMessage);
    (enhancedError as any).statusCode = statusCode;
    (enhancedError as any).originalError = error;
    return Promise.reject(enhancedError);
  }
);
