import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { TrackEventDto } from '@/lib/api/types';

export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: (filters: Record<string, unknown> | undefined) =>
    [...analyticsKeys.all, 'dashboard', filters] as const,
};

export function useAnalytics(dateRange?: {
  startDate: string;
  endDate: string;
}) {
  return useQuery({
    queryKey: analyticsKeys.dashboard(dateRange),
    queryFn: () => api.analytics.getAnalytics(dateRange),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useTrackEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: TrackEventDto) => api.analytics.trackEvent(dto),
    onSuccess: () => {
      // Invalidate analytics cache after event tracking as required
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
    },
  });
}
