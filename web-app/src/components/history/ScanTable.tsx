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
    if (sortBy !== column) return null;
    return sortOrder === 'ASC' ? ' ↑' : ' ↓';
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Skeleton className="h-4 w-4" />
              </TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Device</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
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
          <Smartphone className="text-muted-foreground h-8 w-8" />
        </div>
        <h3 className="text-lg font-medium">No scans found</h3>
        <p className="text-muted-foreground mt-1 mb-4 max-w-sm">
          Try adjusting your filters or start scanning barcodes to build your
          history.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
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
              onClick={() => onSortChange('barcodeData')}
            >
              Barcode {renderSortIcon('barcodeData')}
            </TableHead>
            <TableHead
              className="hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onSortChange('barcodeType')}
            >
              Type {renderSortIcon('barcodeType')}
            </TableHead>
            <TableHead>Product</TableHead>
            <TableHead
              className="hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onSortChange('scannedAt')}
            >
              Date {renderSortIcon('scannedAt')}
            </TableHead>
            <TableHead>Device</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scans.map((scan) => (
            <TableRow
              key={scan.id}
              className="hover:bg-muted/30 cursor-pointer"
              onClick={() => onView(scan)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.includes(scan.id)}
                  onCheckedChange={(checked) => onSelectOne(scan.id, !!checked)}
                />
              </TableCell>
              <TableCell className="font-mono text-sm font-medium">
                {scan.barcodeData}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-mono text-xs">
                  {scan.barcodeType}
                </Badge>
              </TableCell>
              <TableCell>
                {scan.product ? (
                  <div className="flex items-center gap-2">
                    {scan.product.images && scan.product.images.length > 0 && (
                      <img
                        src={scan.product.images[0]}
                        alt=""
                        className="h-6 w-6 rounded-sm border bg-white object-contain"
                      />
                    )}
                    <span
                      className="block max-w-[150px] truncate"
                      title={scan.product.name}
                    >
                      {scan.product.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs italic">
                    Unknown
                  </span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                {new Date(scan.scannedAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs capitalize">
                  {scan.deviceType === 'mobile' ? (
                    <Smartphone className="h-3.5 w-3.5" />
                  ) : (
                    <Monitor className="h-3.5 w-3.5" />
                  )}
                  {scan.deviceType}
                </div>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
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
                      <Trash2 className="mr-2 h-4 w-4" />
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
