export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  googleId: string;
  createdAt: string;
  lastLogin: string;
  role: 'admin' | 'user';
  isAdmin: boolean;
}

export interface Scan {
  id: string;
  userId: string;
  barcodeData: string;
  barcodeType: string;
  deviceType: string;
  scannedAt: string;
  metadata?: Record<string, unknown>;
  user?: User;
  productName?: string | null;
  brand?: string | null;
  category?: string | null;
  nutritionGrade?: string | null;
}

export interface AnalyticsOverview {
  totalScans: number;
  totalUsers: number;
  activeUsers: number;
  activeToday: number;
  scanGrowth: number;
  userGrowth: number;
  scanGrowthPercent: number;
  userGrowthPercent: number;
  successRate: number;
}

export interface AnalyticsTrend {
  date: string;
  count: number;
}

export interface AnalyticsTrendResponse {
  data: AnalyticsTrend[];
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

export interface RetentionCohort {
  weekStart: string;
  newUsers: number;
  retention: number[];
}

export interface RetentionResponse {
  cohorts: RetentionCohort[];
}

export interface HourlyActivity {
  hour: number;
  count: number;
}

export interface TopBarcode {
  barcodeData: string;
  barcodeType: string;
  productName: string | null;
  count: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  isAdmin: boolean;
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
