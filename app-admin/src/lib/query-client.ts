import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({}),
  mutationCache: new MutationCache({}),
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
