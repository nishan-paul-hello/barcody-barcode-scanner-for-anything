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
