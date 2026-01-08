import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type {
  ScanResponseDto,
  CreateScanDto,
  BulkCreateScansDto,
  PaginationParams,
  PaginatedResponse,
} from '@/lib/api/types';
import { toast } from 'sonner';

export const scanKeys = {
  all: ['scans'] as const,
  lists: () => [...scanKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...scanKeys.lists(), params] as const,
  details: () => [...scanKeys.all, 'detail'] as const,
  detail: (id: string) => [...scanKeys.details(), id] as const,
};

export function useScans(params: PaginationParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: scanKeys.list(params),
    queryFn: () => api.scans.getScans(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useScan(id: string) {
  return useQuery({
    queryKey: scanKeys.detail(id),
    queryFn: () => api.scans.getScan(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateScan() {
  const queryClient = useQueryClient();
  const firstPageKey = scanKeys.list({ page: 1, limit: 10 });

  return useMutation({
    mutationFn: (dto: CreateScanDto) => api.scans.createScan(dto),
    onMutate: async (newScan) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: scanKeys.all });

      // Snapshot the previous value
      const previousScans =
        queryClient.getQueryData<PaginatedResponse<ScanResponseDto>>(
          firstPageKey
        );

      // Optimistically update to the new value
      if (previousScans) {
        queryClient.setQueryData(firstPageKey, {
          ...previousScans,
          data: [
            {
              id: 'temp-id-' + Date.now(),
              userId: 'me',
              barcodeData: newScan.barcodeData,
              barcodeType: newScan.barcodeType,
              rawData: newScan.rawData || '',
              scannedAt: newScan.scannedAt || new Date().toISOString(),
              deviceType: newScan.deviceType || 'web',
              metadata: newScan.metadata || {},
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...previousScans.data,
          ],
          total: previousScans.total + 1,
        });
      }

      return { previousScans };
    },
    onError: (_err, _newScan, context) => {
      if (context?.previousScans) {
        queryClient.setQueryData(firstPageKey, context.previousScans);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: scanKeys.all });
    },
    onSuccess: () => {
      toast.success('Scan created successfully');
    },
  });
}

export function useDeleteScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.scans.deleteScan(id),
    onMutate: async (id) => {
      // This is a bit complex for paginated data as the item could be on any page.
      // For simplicity, we'll try to remove it from the first page if it exists there.
      const firstPageKey = scanKeys.list({ page: 1, limit: 10 });
      await queryClient.cancelQueries({ queryKey: scanKeys.all });

      const previousScans =
        queryClient.getQueryData<PaginatedResponse<ScanResponseDto>>(
          firstPageKey
        );

      if (previousScans) {
        queryClient.setQueryData(firstPageKey, {
          ...previousScans,
          data: previousScans.data.filter((scan) => scan.id !== id),
          total: previousScans.total - 1,
        });
      }

      return { previousScans };
    },
    onError: (_err, _id, context) => {
      const firstPageKey = scanKeys.list({ page: 1, limit: 10 });
      if (context?.previousScans) {
        queryClient.setQueryData(firstPageKey, context.previousScans);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: scanKeys.all });
    },
    onSuccess: () => {
      toast.success('Scan deleted successfully');
    },
  });
}

export function useBulkCreateScans() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: BulkCreateScansDto) => api.scans.bulkCreateScans(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scanKeys.lists() });
      toast.success('Batch scans uploaded successfully');
    },
  });
}
