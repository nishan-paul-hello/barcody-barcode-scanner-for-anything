import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import axiosRetry, {
  exponentialDelay,
  isNetworkOrIdempotentRequestError,
} from 'axios-retry';
import { useAuthStore } from '@/store/useAuthStore';
import type {
  AuthResponseDto,
  CreateScanDto,
  BulkCreateScansDto,
  ScanResponseDto,
  ProductResponseDto,
  TrackEventDto,
  PaginatedResponse,
  PaginationParams,
  GoogleAuthDto,
  RefreshTokenDto,
  User,
  ApiErrorResponse,
  TailscaleInfoDto,
} from './types';

// Define custom property for retry in request config
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

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

// Configure Retry Logic
axiosRetry(apiClient, {
  retries: 3,
  retryDelay: exponentialDelay,
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    return (
      isNetworkOrIdempotentRequestError(error) ||
      (error.response ? error.response.status >= 500 : false)
    );
  },
  onRetry: (retryCount, error) => {
    console.warn(
      `Retry attempt #${retryCount} for request: ${error.config?.url}`
    );
  },
});

// Queue to hold requests while token is refreshing
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Add Authorization Header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Error Handling and Token Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized (Token Expiration)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { refreshAccessToken, logout } = useAuthStore.getState();
        const newToken = await refreshAccessToken();

        if (newToken) {
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } else {
          processQueue(error, null);
          logout();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden (403)');
    }

    // Transform error for consistent format
    const responseData = error.response?.data as ApiErrorResponse | undefined;
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

// --- API Methods ---

export const api = {
  // Auth
  auth: {
    login: (dto: GoogleAuthDto) =>
      apiClient.post<AuthResponseDto>('/auth/google', dto).then((r) => r.data),
    refresh: (dto: RefreshTokenDto) =>
      apiClient.post<AuthResponseDto>('/auth/refresh', dto).then((r) => r.data),
    logout: () => apiClient.post('/auth/logout').then((r) => r.data),
    getMe: () => apiClient.get<User>('/auth/me').then((r) => r.data),
  },

  // Scans
  scans: {
    createScan: (dto: CreateScanDto) =>
      apiClient.post<ScanResponseDto>('/scans', dto).then((r) => r.data),
    getScans: (params?: PaginationParams) =>
      apiClient
        .get<PaginatedResponse<ScanResponseDto>>('/scans', { params })
        .then((r) => r.data),
    getScan: (id: string) =>
      apiClient.get<ScanResponseDto>(`/scans/${id}`).then((r) => r.data),
    deleteScan: (id: string) =>
      apiClient.delete(`/scans/${id}`).then((r) => r.data),
    bulkDeleteScans: (ids: string[]) =>
      apiClient.delete('/scans', { data: { ids } }).then((r) => r.data),
    bulkCreateScans: (dto: BulkCreateScansDto) =>
      apiClient.post<ScanResponseDto[]>('/scans/bulk', dto).then((r) => r.data),
    getScansSince: (timestamp: string) =>
      apiClient
        .get<
          ScanResponseDto[]
        >('/scans/since', { params: { since: timestamp } })
        .then((r) => r.data),
  },

  // Products
  products: {
    getProduct: (barcode: string) =>
      apiClient
        .get<ProductResponseDto>(`/products/${barcode}`)
        .then((r) => r.data),
    compareProducts: (barcodes: string[]) =>
      apiClient
        .get<
          ProductResponseDto[]
        >('/products/compare', { params: { barcodes: barcodes.join(',') } })
        .then((r) => r.data),
  },

  // Export
  export: {
    exportCSV: (scanIds?: string[]) =>
      apiClient
        .post('/export/csv', { scanIds }, { responseType: 'blob' })
        .then((r) => r.data),
    exportJSON: (scanIds?: string[]) =>
      apiClient
        .post('/export/json', { scanIds }, { responseType: 'blob' })
        .then((r) => r.data),
    exportPDF: (scanIds?: string[]) =>
      apiClient
        .post('/export/pdf', { scanIds }, { responseType: 'blob' })
        .then((r) => r.data),
    exportExcel: (scanIds?: string[]) =>
      apiClient
        .post('/export/excel', { scanIds }, { responseType: 'blob' })
        .then((r) => r.data),
  },

  // Analytics
  analytics: {
    trackEvent: (dto: TrackEventDto) =>
      apiClient.post('/analytics/track', dto).then((r) => r.data),
    getAnalytics: (params?: { startDate?: string; endDate?: string }) =>
      apiClient.get('/analytics/dashboard', { params }).then((r) => r.data),
  },

  // Helper for generic file upload
  upload: {
    file: <T = unknown>(
      url: string,
      file: File,
      onProgress?: (progress: number) => void
    ) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient
        .post<T>(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(progress);
            }
          },
        })
        .then((r) => r.data);
    },
  },

  // Setup
  setup: {
    getTailscaleInfo: () =>
      apiClient
        .get<TailscaleInfoDto>('/setup/tailscale-info')
        .then((r) => r.data),
  },

  // Generic Pagination Helper
  paginate: <T>(url: string, params: PaginationParams) =>
    apiClient.get<PaginatedResponse<T>>(url, { params }).then((r) => r.data),
};

export default apiClient;
