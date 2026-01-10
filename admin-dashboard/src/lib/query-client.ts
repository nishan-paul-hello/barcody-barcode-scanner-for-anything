import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ApiErrorResponse } from './api/types';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Only show toast if the query has a meta.errorMessage
      if (query.meta?.errorMessage) {
        const apiError = error as unknown as ApiErrorResponse;
        toast.error(
          `${query.meta.errorMessage}: ${apiError.message || 'Unknown error'}`
        );
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      // Only show toast if the mutation has a meta.errorMessage
      if (mutation.meta?.errorMessage) {
        const apiError = error as unknown as ApiErrorResponse;
        toast.error(
          `${mutation.meta.errorMessage}: ${apiError.message || 'Unknown error'}`
        );
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute default
      gcTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

// Extension for global meta types
declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: {
      errorMessage?: string;
    };
    mutationMeta: {
      errorMessage?: string;
    };
  }
}
