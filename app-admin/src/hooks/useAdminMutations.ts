import { useQueryClient } from '@tanstack/react-query';

export const useInvalidateAdmin = () => {
  const queryClient = useQueryClient();

  const invalidateAnalytics = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'analytics'] });
  };

  const invalidateUsers = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
  };

  const invalidateScans = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'scans'] });
  };

  return {
    invalidateAnalytics,
    invalidateUsers,
    invalidateScans,
    invalidateAll: () =>
      void queryClient.invalidateQueries({ queryKey: ['admin'] }),
  };
};
