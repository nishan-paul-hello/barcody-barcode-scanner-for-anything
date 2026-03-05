import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export const productKeys = {
  all: ['products'] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (barcode: string) => [...productKeys.details(), barcode] as const,
};

export function useProduct(barcode: string) {
  return useQuery({
    queryKey: productKeys.detail(barcode),
    queryFn: () => api.products.getProduct(barcode),
    enabled: !!barcode,
    staleTime: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
}

export function useCompareProducts(barcodes: string[]) {
  return useQuery({
    queryKey: ['products', 'compare', barcodes.join(',')],
    queryFn: () => api.products.compareProducts(barcodes),
    enabled: barcodes.length >= 2,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
