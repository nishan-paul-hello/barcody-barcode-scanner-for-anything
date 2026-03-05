import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { DateRange } from 'react-day-picker';

export const useAnalyticsOverview = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ['analytics', 'overview', dateRange],
    queryFn: () =>
      api.admin.getAnalyticsOverview({
        startDate: dateRange?.from?.toISOString(),
        endDate: dateRange?.to?.toISOString(),
      }),
    refetchInterval: 30000, // Real-time updates every 30s
  });
};

export const useAnalyticsTrends = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ['analytics', 'trends', dateRange],
    queryFn: () =>
      api.admin.getAnalyticsTrends({
        startDate: dateRange?.from?.toISOString(),
        endDate: dateRange?.to?.toISOString(),
      }),
  });
};

export const useBarcodeTypes = () => {
  return useQuery({
    queryKey: ['analytics', 'barcode-types'],
    queryFn: () => api.admin.getBarcodeTypes(),
  });
};

export const useDeviceBreakdown = () => {
  return useQuery({
    queryKey: ['analytics', 'devices'],
    queryFn: () => api.admin.getDeviceBreakdown(),
  });
};

export const useRetentionCohorts = () => {
  return useQuery({
    queryKey: ['analytics', 'retention'],
    queryFn: () => api.admin.getRetentionCohorts(),
  });
};

export const useTopBarcodes = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ['analytics', 'top-barcodes', dateRange],
    queryFn: () =>
      api.admin.getTopBarcodes({
        startDate: dateRange?.from?.toISOString(),
        endDate: dateRange?.to?.toISOString(),
      }),
  });
};

export const useHourlyActivity = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ['analytics', 'hourly', dateRange],
    queryFn: () =>
      api.admin.getHourlyActivity({
        startDate: dateRange?.from?.toISOString(),
        endDate: dateRange?.to?.toISOString(),
      }),
  });
};

export const useUsers = (params: { page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => api.admin.getUsers(params),
    placeholderData: (prev) => prev,
  });
};

export const useScans = (
  params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    query?: string;
  } = {}
) => {
  return useQuery({
    queryKey: ['admin', 'scans', params],
    queryFn: () => api.admin.getScans(params),
    placeholderData: (prev) => prev,
  });
};
