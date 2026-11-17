export type ScreenerRatioValue =
  | number
  | string
  | Array<number | string>
  | null
  | undefined;

export type ScreenerRatios = Record<string, ScreenerRatioValue>;

export interface ScreenerSnapshotData {
  time: string;
  company: string;
  companyCode?: string;
  price: number | null;
  marketCap: number | null;
  stockPE: number | null;
  high: number | null;
  low: number | null;
  ratios: ScreenerRatios;
  chunks?: number;
  totalChars?: number;
}

export interface ScreenerSnapshotResponse {
  success: boolean;
  companyCode?: string;
  data?: ScreenerSnapshotData;
  message?: string;
  error?: string;
}

export interface ScreenerStreamRecord extends ScreenerSnapshotData {
  changed?: boolean;
  receivedAt: string;
}

export type ScreenerConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

export type ScreenerPollingInterval = 5 | 15 | 30 | 60;

export interface ScreenerCompanyPreset {
  label: string;
  code: string;
}
