import axios from 'axios';
import type { AxiosError, AxiosInstance } from 'axios';
import axiosRetry, {
  exponentialDelay,
  isNetworkOrIdempotentRequestError,
} from 'axios-retry';
import type {
  AnalyticsOverview,
  AnalyticsTrend,
  BarcodeTypeDistribution,
  DeviceBreakdown,
  PaginatedResponse,
  Scan,
  ScanFilters,
  User,
  PaginationParams,
  ApiErrorResponse,
} from './types';

const baseURL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosRetry(apiClient, {
  retries: 3,
  retryDelay: exponentialDelay,
  retryCondition: (error: AxiosError) => {
    return (
      isNetworkOrIdempotentRequestError(error) ||
      (error.response ? error.response.status >= 500 : false)
    );
  },
});

// Response Interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Ensure responseData is correctly typed based on the error response structure
    const responseData: ApiErrorResponse | undefined = error.response
      ?.data as ApiErrorResponse;
    const apiError = {
      message:
        responseData?.message ||
        error.message ||
        'An unexpected error occurred',
      statusCode: error.response?.status || 500,
      error: responseData?.error || error.name || 'API_ERROR',
    };
    return Promise.reject(apiError);
  }
);

export const api = {
  admin: {
    getAnalyticsOverview: (dateRange: { start: string; end: string }) =>
      apiClient
        .get<AnalyticsOverview>('/admin/analytics/overview', {
          params: dateRange,
        })
        .then((r) => r.data),

    getAnalyticsTrends: (
      dateRange: { start: string; end: string },
      metric: string
    ) =>
      apiClient
        .get<
          AnalyticsTrend[]
        >('/admin/analytics/trends', { params: { ...dateRange, metric } })
        .then((r) => r.data),

    getBarcodeTypes: () =>
      apiClient
        .get<BarcodeTypeDistribution[]>('/admin/analytics/barcodes')
        .then((r) => r.data),

    getDeviceBreakdown: () =>
      apiClient
        .get<DeviceBreakdown[]>('/admin/analytics/devices')
        .then((r) => r.data),

    getUsers: (params: PaginationParams) =>
      apiClient
        .get<PaginatedResponse<User>>('/admin/users', { params })
        .then((r) => r.data),

    getScans: (filters: ScanFilters) =>
      apiClient
        .get<PaginatedResponse<Scan>>('/admin/scans', { params: filters })
        .then((r) => r.data),
  },
};

export default apiClient;
