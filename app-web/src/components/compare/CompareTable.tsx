'use client';

import type {
  ProductComparisonResponse,
  ProductResponseDto,
} from '@/lib/api/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface CompareTableProps {
  products: ProductResponseDto[];
  comparison: ProductComparisonResponse['comparison'];
}

export function CompareTable({ products, comparison }: CompareTableProps) {
  const nutrientLabels: Record<string, string> = {
    calories: 'Calories',
    fat: 'Fat (g)',
    carbs: 'Carbs (g)',
    protein: 'Protein (g)',
    sugar: 'Sugar (g)',
    fiber: 'Fiber (g)',
    salt: 'Salt (g)',
  };

  const getNutrientStatus = (barcode: string, nutrient: string) => {
    const detail = comparison.nutrients[nutrient];
    if (!detail) {
      return null;
    }
    if (detail.best.includes(barcode)) {
      return 'best';
    }
    if (detail.worst.includes(barcode)) {
      return 'worst';
    }
    return null;
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-muted/50 min-w-[150px]">
                Details
              </TableHead>
              {products.map((p) => (
                <TableHead
                  key={p.barcode}
                  className="min-w-[200px] text-center"
                >
                  <div className="flex flex-col items-center gap-2 py-4">
                    <div className="relative h-24 w-24 overflow-hidden rounded-md border bg-white">
                      {p.images?.[0] ? (
                        <Image
                          src={p.images[0]}
                          alt={p.name || 'Product'}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="bg-muted text-muted-foreground flex h-full items-center justify-center text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <span className="line-clamp-2 font-bold">
                      {p.name || 'Unknown Product'}
                    </span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {p.barcode}
                    </Badge>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="bg-muted/30 font-medium">
                Nutrition Grade
              </TableCell>
              {products.map((p) => (
                <TableCell key={p.barcode} className="text-center">
                  <Badge
                    className={cn(
                      'flex h-8 w-8 items-center justify-center p-0 text-lg font-bold',
                      p.nutrition?.grade === 'A' && 'bg-green-600',
                      p.nutrition?.grade === 'B' && 'bg-lime-500',
                      p.nutrition?.grade === 'C' && 'bg-yellow-500',
                      p.nutrition?.grade === 'D' && 'bg-orange-500',
                      p.nutrition?.grade === 'E' && 'bg-red-600'
                    )}
                  >
                    {p.nutrition?.grade || '?'}
                  </Badge>
                  {comparison.nutritionGradesSummary?.best.includes(
                    p.barcode
                  ) && (
                    <div className="mt-1 text-[10px] font-bold text-green-500">
                      BEST CHOICE
                    </div>
                  )}
                </TableCell>
              ))}
            </TableRow>

            {Object.keys(nutrientLabels).map((key) => (
              <TableRow key={key}>
                <TableCell className="bg-muted/30 font-medium">
                  {nutrientLabels[key]}
                </TableCell>
                {products.map((p) => {
                  const status = getNutrientStatus(p.barcode, key);
                  const value = p.nutrition?.[key as keyof typeof p.nutrition];
                  return (
                    <TableCell key={p.barcode} className="text-center">
                      <span
                        className={cn(
                          'font-medium',
                          status === 'best' &&
                            'font-bold text-green-600 dark:text-green-400',
                          status === 'worst' && 'text-red-500 dark:text-red-400'
                        )}
                      >
                        {value !== undefined ? value : 'N/A'}
                      </span>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}

            <TableRow>
              <TableCell className="bg-muted/30 font-medium">Brand</TableCell>
              {products.map((p) => (
                <TableCell key={p.barcode} className="text-center text-sm">
                  {p.brand || '---'}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="bg-muted/30 font-medium">
                Category
              </TableCell>
              {products.map((p) => (
                <TableCell key={p.barcode} className="text-center text-sm">
                  <div className="mx-auto line-clamp-2 max-w-[200px]">
                    {p.category || '---'}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
