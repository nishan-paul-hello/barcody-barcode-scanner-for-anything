import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        if (failureCount >= 3) {
          return false;
        }

        // Don't retry on certain status codes
        if (error instanceof AxiosError) {
          const status = error.response?.status;
          if (status && [401, 403, 404].includes(status)) {
            return false;
          }
        }
        return true;
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
  mutationCache: new MutationCache({
    onError: (error: unknown) => {
      console.warn('Mutation Error:', error);
    },
  }),
  queryCache: new QueryCache({
    onError: (error) => {
      console.warn('Query Error:', error);
    },
  }),
});
