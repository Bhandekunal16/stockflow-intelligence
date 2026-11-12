export interface PortfolioStock {
  company: string;
  shares: number;
  currentValue: number;
  referenceValue: number;
}

export interface PortfolioSnapshot {
  _id: string;
  date: string; // YYYY-MM-DD
  data: PortfolioStock[];
  createdAt: string;
  updatedAt: string;
}

export interface ExtractionResponse {
  success: boolean;
  count: number;
  data: PortfolioStock[];
  message?: string;
  statusCode?: number;
}

export interface HistoricalResponse {
  success: boolean;
  count: number;
  data: PortfolioSnapshot[];
  message?: string;
  statusCode?: number;
}

export interface SnapshotDetailResponse {
  success: boolean;
  data: PortfolioSnapshot;
  message?: string;
  statusCode?: number;
}

export interface HealthCheckResponse {
  status?: string;
  success: boolean;
  message: string;
  timezone?: string;
  currentDate?: string;
  timestamp?: string;
}

export interface PortfolioSummaryMetrics {
  totalCurrentValue: number;
  totalReferenceValue: number;
  totalDifference: number;
  percentageChange: number;
  totalStocks: number;
  lastUpdatedDate: string | null;
}
