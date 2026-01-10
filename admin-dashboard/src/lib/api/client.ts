import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

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

        const response = await axios.post(`${API_URL}/auth/refresh`, {
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
  loginWithGoogle: async (token: string) => {
    const response = await apiClient.post('/auth/google', { token });
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export const adminApi = {
  getAnalyticsOverview: async () => {
    const response = await apiClient.get('/admin/analytics/overview');
    return response.data;
  },
  getAnalyticsTrends: async () => {
    const response = await apiClient.get('/admin/analytics/trends');
    return response.data;
  },
  getBarcodeTypes: async () => {
    const response = await apiClient.get('/admin/analytics/barcode-types');
    return response.data;
  },
  getDevices: async () => {
    const response = await apiClient.get('/admin/analytics/devices');
    return response.data;
  },
  getUsers: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/admin/users', {
      params: { page, limit },
    });
    return response.data;
  },
  getScans: async (
    params: Record<string, string | number | boolean | string[] | undefined>
  ) => {
    const response = await apiClient.get('/admin/scans', { params });
    return response.data;
  },
};
