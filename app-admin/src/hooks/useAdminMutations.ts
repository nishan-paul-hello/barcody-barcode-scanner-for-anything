import { useQueryClient } from '@tanstack/react-query';

export const useInvalidateAdmin = () => {
  const queryClient = useQueryClient();

  const invalidateAnalytics = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'analytics'] });
  };

  const invalidateUsers = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
  };

  const invalidateScans = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'scans'] });
  };

  return {
    invalidateAnalytics,
    invalidateUsers,
    invalidateScans,
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  };
};
