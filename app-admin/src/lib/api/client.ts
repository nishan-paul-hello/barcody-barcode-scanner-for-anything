import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import type {
  AnalyticsOverview,
  AnalyticsTrendResponse,
  AuthResponse,
  BarcodeTypeDistribution,
  DeviceBreakdown,
  HourlyActivity,
  PaginatedResponse,
  RetentionResponse,
  Scan,
  TopBarcode,
  User,
} from './types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized (Token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken, setTokens, logout } = useAuthStore.getState();

        if (!refreshToken) {
          logout();
          return Promise.reject(error);
        }

        const response = await axios.post<{
          accessToken: string;
          refreshToken: string;
        }>(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data;
        setTokens(newAccessToken, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden (Not an admin)
    if (error.response?.status === 403) {
      // Potentially redirect to "Not Authorized" page or show message
      console.error('Not authorized access');
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  loginWithGoogle: async (token: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/google', {
      token,
    });
    return response.data;
  },
  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/logout');
    return response.data;
  },
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
};

export const adminApi = {
  getAnalyticsOverview: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<AnalyticsOverview> => {
    const response = await apiClient.get<AnalyticsOverview>(
      '/admin/analytics/overview',
      {
        params,
      }
    );
    return response.data;
  },
  getAnalyticsTrends: async (params?: {
    startDate?: string;
    endDate?: string;
    metric?: string;
  }): Promise<AnalyticsTrendResponse> => {
    const response = await apiClient.get<AnalyticsTrendResponse>(
      '/admin/analytics/trends',
      { params }
    );
    return response.data;
  },
  getBarcodeTypes: async (): Promise<BarcodeTypeDistribution[]> => {
    const response = await apiClient.get<BarcodeTypeDistribution[]>(
      '/admin/analytics/barcode-types'
    );
    return response.data;
  },
  getDeviceBreakdown: async (): Promise<DeviceBreakdown[]> => {
    const response = await apiClient.get<DeviceBreakdown[]>(
      '/admin/analytics/devices'
    );
    return response.data;
  },
  getRetentionCohorts: async (): Promise<RetentionResponse> => {
    const response = await apiClient.get<RetentionResponse>(
      '/admin/analytics/retention'
    );
    return response.data;
  },
  getTopBarcodes: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<TopBarcode[]> => {
    const response = await apiClient.get<TopBarcode[]>(
      '/admin/analytics/top-barcodes',
      {
        params,
      }
    );
    return response.data;
  },
  getHourlyActivity: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<HourlyActivity[]> => {
    const response = await apiClient.get<HourlyActivity[]>(
      '/admin/analytics/hourly',
      { params }
    );
    return response.data;
  },
  getUsers: async ({
    page = 1,
    limit = 10,
  }: { page?: number; limit?: number } = {}): Promise<
    PaginatedResponse<User>
  > => {
    const response = await apiClient.get<PaginatedResponse<User>>(
      '/admin/users',
      {
        params: { page, limit },
      }
    );
    return response.data;
  },
  getScans: async (
    params: Record<string, string | number | boolean | string[] | undefined>
  ): Promise<PaginatedResponse<Scan>> => {
    const response = await apiClient.get<PaginatedResponse<Scan>>(
      '/admin/scans',
      { params }
    );
    return response.data;
  },
};

export const api = {
  auth: authApi,
  admin: adminApi,
};
