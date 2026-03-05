/* eslint-disable @next/next/no-img-element */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type ScanResponseDto } from '@/lib/api/types';
import { MoreHorizontal, Trash2, Smartphone, Monitor } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ScanTableProps {
  scans: ScanResponseDto[];
  isLoading: boolean;
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
  onView: (scan: ScanResponseDto) => void;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  onSortChange: (column: string) => void;
}

export function ScanTable({
  scans,
  isLoading,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onDelete,
  onView,
  sortBy,
  sortOrder,
  onSortChange,
}: ScanTableProps) {
  const allSelected = scans.length > 0 && selectedIds.length === scans.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < scans.length;

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return null;
    }
    return sortOrder === 'ASC' ? ' ↑' : ' ↓';
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Skeleton className="size-4" />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Device</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {['sr1', 'sr2', 'sr3', 'sr4', 'sr5'].map((id) => (
              <TableRow key={id}>
                <TableCell>
                  <Skeleton className="size-4" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-6 rounded-sm" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="size-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div className="bg-card/30 flex flex-col items-center justify-center rounded-lg border py-12 text-center">
        <div className="bg-muted/50 mb-4 rounded-full p-4">
          <Smartphone className="text-muted-foreground size-8" />
        </div>
        <h3 className="text-lg font-medium">No scans found</h3>
        <p className="text-muted-foreground mt-1 mb-4 max-w-sm">
          Try adjusting your filters or start scanning barcodes to build your
          history.
        </p>
      </div>
    );
  }

  const hasRelevance = scans.some((s) => s.relevance !== undefined);

  return (
    <div className="bg-card overflow-hidden rounded-md border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[50px]">
              <Checkbox
                checked={
                  allSelected || (someSelected ? 'indeterminate' : false)
                }
                onCheckedChange={(checked) => onSelectAll(!!checked)}
              />
            </TableHead>
            <TableHead
              className="hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onSortChange('productName')}
            >
              Product {renderSortIcon('productName')}
            </TableHead>
            <TableHead
              className="hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onSortChange('barcodeType')}
            >
              Type {renderSortIcon('barcodeType')}
            </TableHead>
            <TableHead>Category</TableHead>
            <TableHead
              className="hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onSortChange('nutritionGrade')}
            >
              Grade {renderSortIcon('nutritionGrade')}
            </TableHead>
            {hasRelevance && (
              <TableHead
                className="hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onSortChange('relevance')}
              >
                Match {renderSortIcon('relevance')}
              </TableHead>
            )}
            <TableHead
              className="hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onSortChange('scannedAt')}
            >
              Date {renderSortIcon('scannedAt')}
            </TableHead>
            <TableHead>Device</TableHead>
            <TableHead className="w-[80px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {scans.map((scan) => (
            <TableRow
              key={scan.id}
              className="hover:bg-muted/20 group cursor-pointer"
              onClick={() => onView(scan)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.includes(scan.id)}
                  onCheckedChange={(checked) => onSelectOne(scan.id, !!checked)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="bg-muted/20 size-10 flex-shrink-0 overflow-hidden rounded-md border">
                    {scan.product?.images && scan.product.images.length > 0 ? (
                      <img
                        src={scan.product.images[0]}
                        alt=""
                        className="size-full object-contain p-1"
                      />
                    ) : (
                      <div className="text-muted-foreground flex size-full items-center justify-center text-[10px] uppercase">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span
                      className="max-w-[200px] truncate font-medium"
                      title={scan.product?.name || scan.barcodeData}
                    >
                      {scan.product?.name || 'Unknown Product'}
                    </span>
                    <span className="text-muted-foreground font-mono text-[11px]">
                      {scan.barcodeData}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] uppercase"
                >
                  {scan.barcodeType}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="block max-w-[120px] truncate text-sm capitalize">
                  {scan.product?.category || '-'}
                </span>
              </TableCell>
              <TableCell>
                {scan.product?.nutrition?.grade ? (
                  <Badge
                    className={cn(
                      'font-bold',
                      scan.product.nutrition.grade === 'A' &&
                        'bg-green-600 hover:bg-green-700',
                      scan.product.nutrition.grade === 'B' &&
                        'bg-green-500 hover:bg-green-600',
                      scan.product.nutrition.grade === 'C' &&
                        'bg-yellow-500 hover:bg-yellow-600',
                      scan.product.nutrition.grade === 'D' &&
                        'bg-orange-500 hover:bg-orange-600',
                      scan.product.nutrition.grade === 'E' &&
                        'bg-red-500 hover:bg-red-600'
                    )}
                  >
                    {scan.product.nutrition.grade}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              {hasRelevance && (
                <TableCell>
                  <div className="bg-muted h-1.5 w-12 overflow-hidden rounded-full">
                    <div
                      className="bg-primary size-full h-auto"
                      style={{
                        width: `${Math.min(100, Math.max(0, (scan.relevance || 0) * 100))}%`,
                      }}
                    />
                  </div>
                </TableCell>
              )}
              <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                {new Date(scan.scannedAt).toLocaleDateString()}
                <br />
                <span className="text-[10px] opacity-70">
                  {new Date(scan.scannedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </TableCell>
              <TableCell>
                <div className="text-muted-foreground flex items-center gap-1 text-[11px] capitalize">
                  {scan.deviceType === 'mobile' ? (
                    <Smartphone className="size-3" />
                  ) : (
                    <Monitor className="size-3" />
                  )}
                  {scan.deviceType}
                </div>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="size-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(scan)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(scan.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
