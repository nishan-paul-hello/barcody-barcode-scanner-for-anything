import { QueryClient, QueryCache } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        if (failureCount >= 3) return false;

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
    mutations: {
      onError: (error) => {
        let message = 'An unexpected error occurred';
        if (error instanceof AxiosError) {
          message = error.response?.data?.message || error.message || message;
        } else if (error instanceof Error) {
          message = error.message;
        }
        toast.error(message);
        console.error('Mutation Error:', error);
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      let message = 'Failed to fetch data';
      if (error instanceof AxiosError) {
        // Don't show toast for 401s as they are handled by auth logic
        if (error.response?.status === 401) return;
        message = error.response?.data?.message || error.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
      console.error('Query Error:', error);
    },
  }),
});
