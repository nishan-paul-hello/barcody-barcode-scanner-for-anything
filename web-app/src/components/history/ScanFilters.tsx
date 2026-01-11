import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  BarcodeType,
  DeviceType,
  type PaginationParams,
} from '@/lib/api/types';
import { Search, X } from 'lucide-react';

interface ScanFiltersProps {
  filters: Partial<PaginationParams>;
  onFilterChange: (key: keyof PaginationParams, value: unknown) => void;
  onClearFilters: () => void;
}

export function ScanFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: ScanFiltersProps) {
  return (
    <div className="bg-card/50 flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex flex-col gap-4 md:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search barcodes..."
            className="pl-9"
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap gap-2">
          {/* Barcode Type */}
          <Select
            value={filters.barcodeType}
            onValueChange={(val) =>
              onFilterChange('barcodeType', val === 'ALL' ? undefined : val)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Barcode Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {Object.values(BarcodeType).map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Device Type */}
          <Select
            value={filters.deviceType}
            onValueChange={(val) =>
              onFilterChange('deviceType', val === 'ALL' ? undefined : val)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Device Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Devices</SelectItem>
              {Object.values(DeviceType).map((type) => (
                <SelectItem key={type} value={type} className="capitalize">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Range & Actions */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm whitespace-nowrap">
            Filter Date:
          </span>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              className="w-[150px]"
              value={filters.startDate ? filters.startDate.split('T')[0] : ''}
              onChange={(e) =>
                onFilterChange(
                  'startDate',
                  e.target.value
                    ? new Date(e.target.value).toISOString()
                    : undefined
                )
              }
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="date"
              className="w-[150px]"
              value={filters.endDate ? filters.endDate.split('T')[0] : ''}
              onChange={(e) =>
                onFilterChange(
                  'endDate',
                  e.target.value
                    ? new Date(e.target.value).toISOString()
                    : undefined
                )
              }
            />
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-muted-foreground hover:text-foreground self-start md:self-auto"
        >
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
