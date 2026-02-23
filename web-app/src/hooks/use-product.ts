import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { ProductLookupResponse } from '@/lib/api/types';

export function useProduct(barcode: string | null) {
  return useQuery<ProductLookupResponse>({
    queryKey: ['product', barcode],
    queryFn: () => api.products.getProduct(barcode!),
    enabled: !!barcode,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });
}
