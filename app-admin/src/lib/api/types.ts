export interface User {
  id: string;
  email: string;
  googleId: string;
  createdAt: string;
  lastLogin: string;
  role: 'admin' | 'user';
}

export interface Scan {
  id: string;
  userId: string;
  barcodeData: string;
  barcodeType: string;
  deviceType: string;
  scannedAt: string;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsOverview {
  totalScans: number;
  totalUsers: number;
  activeUsers: number;
  scanGrowth: number;
  userGrowth: number;
}

export interface AnalyticsTrend {
  timestamp: string;
  value: number;
}

export interface BarcodeTypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface DeviceBreakdown {
  device: string;
  count: number;
  percentage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ScanFilters extends PaginationParams {
  userId?: string;
  barcodeType?: string;
  startDate?: string;
  endDate?: string;
}

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error: string;
}
