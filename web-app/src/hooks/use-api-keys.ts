'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

const API_KEYS_QUERY_KEY = ['user', 'api-keys'] as const;

export function useApiKeys() {
  return useQuery({
    queryKey: API_KEYS_QUERY_KEY,
    queryFn: () => api.settings.getApiKeys(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateApiKeys() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.settings.updateApiKeys,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY });
    },
  });
}
