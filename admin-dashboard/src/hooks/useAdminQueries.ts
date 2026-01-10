import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { ScanFilters } from '@/lib/api/types';

// Query Keys
export const adminQueryKeys = {
  overview: (start: string, end: string) =>
    ['admin', 'analytics', 'overview', { start, end }] as const,
  trends: (start: string, end: string, metric: string) =>
    ['admin', 'analytics', 'trends', { start, end, metric }] as const,
  barcodes: () => ['admin', 'analytics', 'barcodes'] as const,
  devices: () => ['admin', 'analytics', 'devices'] as const,
  users: (page: number, limit: number) =>
    ['admin', 'users', { page, limit }] as const,
  scans: (filters: ScanFilters) => ['admin', 'scans', filters] as const,
};

// Hooks
export const useAnalyticsOverview = (dateRange: {
  start: string;
  end: string;
}) => {
  return useQuery({
    queryKey: adminQueryKeys.overview(dateRange.start, dateRange.end),
    queryFn: () => api.admin.getAnalyticsOverview(dateRange),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // 1 minute auto-refetch
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useAnalyticsTrends = (
  dateRange: { start: string; end: string },
  metric: string
) => {
  return useQuery({
    queryKey: adminQueryKeys.trends(dateRange.start, dateRange.end, metric),
    queryFn: () => api.admin.getAnalyticsTrends({ ...dateRange, metric }),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // 1 minute auto-refetch
  });
};

export const useBarcodeTypes = () => {
  return useQuery({
    queryKey: adminQueryKeys.barcodes(),
    queryFn: () => api.admin.getBarcodeTypes(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useDeviceBreakdown = () => {
  return useQuery({
    queryKey: adminQueryKeys.devices(),
    queryFn: () => api.admin.getDeviceBreakdown(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUsers = (page: number, limit: number) => {
  return useQuery({
    queryKey: adminQueryKeys.users(page, limit),
    queryFn: () => api.admin.getUsers({ page, limit }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useScans = (
  page: number,
  limit: number,
  filters: Omit<ScanFilters, 'page' | 'limit'> = {}
) => {
  const combinedFilters = { page, limit, ...filters };
  return useQuery({
    queryKey: adminQueryKeys.scans(combinedFilters),
    queryFn: () => api.admin.getScans(combinedFilters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
