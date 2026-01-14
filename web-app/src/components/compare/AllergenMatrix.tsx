'use client';

import type {
  ProductComparisonResponse,
  ProductResponseDto,
} from '@/lib/api/types';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AllergenMatrixProps {
  data: ProductComparisonResponse['comparison'];
  products: ProductResponseDto[];
}

export function AllergenMatrix({ data, products }: AllergenMatrixProps) {
  // Get unique list of all allergens mentioned across all products
  const allAllergens = Array.from(
    new Set(products.flatMap((p) => p.nutrition?.allergens || []))
  ).sort();

  if (allAllergens.length === 0) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center text-center">
        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
          <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <p className="text-muted-foreground mt-2 font-medium">
          No allergens identified in these products.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Allergen</TableHead>
            {products.map((p) => (
              <TableHead key={p.barcode} className="text-center">
                <div className="mx-auto w-[100px] truncate text-xs font-bold">
                  {p.name || p.barcode}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {allAllergens.map((allergen) => (
            <TableRow key={allergen}>
              <TableCell className="text-xs font-medium capitalize">
                {allergen.replace('en:', '')}
                {data.allergens.common.includes(allergen) && (
                  <Badge
                    variant="outline"
                    className="ml-2 h-4 border-red-200 bg-red-100 px-1 text-[8px] text-red-700"
                  >
                    COMMON
                  </Badge>
                )}
              </TableCell>
              {products.map((p) => {
                const hasAllergen = p.nutrition?.allergens?.includes(allergen);
                return (
                  <TableCell key={p.barcode} className="text-center">
                    {hasAllergen ? (
                      <div className="flex justify-center">
                        <div className="rounded-full bg-red-100 p-1 dark:bg-red-900/30">
                          <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div className="rounded-full bg-green-100 p-1 dark:bg-green-900/30">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-orange-50 p-3 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-[10px] leading-tight">
          <strong>Note:</strong> Allergen information is based on manufacturer
          data. Always check the physical packaging for the most accurate and
          up-to-date information before consumption.
        </p>
      </div>
    </div>
  );
}
