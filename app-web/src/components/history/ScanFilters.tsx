import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  BarcodeType,
  DeviceType,
  type PaginationParams,
} from '@/lib/api/types';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface ScanFiltersProps {
  filters: Partial<PaginationParams>;
  onFilterChange: (key: keyof PaginationParams, value: unknown) => void;
  onClearFilters: () => void;
  recentSearches?: string[];
}

const NUTRITION_GRADES = ['A', 'B', 'C', 'D', 'E'];
const CATEGORIES = ['Food', 'Beverage', 'Personal Care', 'Health', 'Other'];

export function ScanFilters({
  filters,
  onFilterChange,
  onClearFilters,
  recentSearches = [],
}: ScanFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) =>
      value !== undefined &&
      value !== '' &&
      !['page', 'limit', 'sortBy', 'order'].includes(key)
  ).length;

  const renderFilterChip = (key: keyof PaginationParams, label: string) => {
    const value = filters[key];
    if (!value) {
      return null;
    }

    return (
      <Badge
        key={key}
        variant="secondary"
        className="flex items-center gap-1 px-2 py-1"
      >
        <span className="text-muted-foreground font-normal">{label}:</span>
        <span>{String(value)}</span>
        <button
          type="button"
          onClick={() => onFilterChange(key, undefined)}
          className="hover:bg-muted ml-1 rounded-full p-0.5"
        >
          <X className="size-3" />
        </button>
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card flex flex-col gap-4 rounded-xl border p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          {/* Search bar with suggestions */}
          <div className="group relative flex-1">
            <Search className="text-muted-foreground absolute top-3 left-3 size-4" />
            <Input
              placeholder="Search by barcode or product name"
              className="h-10 pl-10"
              value={filters.search || ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
            {recentSearches.length > 0 && !filters.search && (
              <div className="bg-popover absolute top-11 left-0 z-10 hidden w-full rounded-md border p-2 shadow-md group-focus-within:block">
                <p className="text-muted-foreground px-2 py-1 text-[10px] font-semibold uppercase">
                  Recent Searches
                </p>
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    className="hover:bg-accent flex w-full items-center rounded-sm px-2 py-1.5 text-sm"
                    onClick={() => onFilterChange('search', term)}
                  >
                    <Search className="text-muted-foreground mr-2 size-[3.5]" />
                    {term}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="relative h-10">
                  <Filter className="mr-2 size-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-primary text-primary-foreground absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full text-[10px] font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                  {isOpen ? (
                    <ChevronUp className="ml-2 size-4" />
                  ) : (
                    <ChevronDown className="ml-2 size-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground h-10 px-3 md:hidden lg:inline-flex"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        <Collapsible open={isOpen}>
          <CollapsibleContent className="mt-2 space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Barcode Type */}
              <div className="space-y-2">
                <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Barcode Type
                </label>
                <Select
                  value={filters.barcodeType || 'ALL'}
                  onValueChange={(val) =>
                    onFilterChange(
                      'barcodeType',
                      val === 'ALL' ? undefined : val
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Types" />
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
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Category
                </label>
                <Select
                  value={filters.category || 'ALL'}
                  onValueChange={(val) =>
                    onFilterChange('category', val === 'ALL' ? undefined : val)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat.toLowerCase()}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nutrition Grade */}
              <div className="space-y-2">
                <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Nutrition Grade
                </label>
                <Select
                  value={filters.nutritionGrade || 'ALL'}
                  onValueChange={(val) =>
                    onFilterChange(
                      'nutritionGrade',
                      val === 'ALL' ? undefined : val
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Grades</SelectItem>
                    {NUTRITION_GRADES.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        Grade {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Device Type */}
              <div className="space-y-2">
                <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Device
                </label>
                <Select
                  value={filters.deviceType || 'ALL'}
                  onValueChange={(val) =>
                    onFilterChange(
                      'deviceType',
                      val === 'ALL' ? undefined : val
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Devices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Devices</SelectItem>
                    {Object.values(DeviceType).map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="capitalize"
                      >
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Date Range
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    className="flex-1"
                    value={
                      filters.startDate ? filters.startDate.split('T')[0] : ''
                    }
                    onChange={(e) =>
                      onFilterChange(
                        'startDate',
                        e.target.value
                          ? new Date(e.target.value).toISOString()
                          : undefined
                      )
                    }
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="date"
                    className="flex-1"
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
              <div className="sm:w-32">
                <Button className="w-full" onClick={() => setIsOpen(false)}>
                  Apply
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-muted-foreground mr-1 text-xs font-medium">
            Active:
          </span>
          {renderFilterChip('barcodeType', 'Type')}
          {renderFilterChip('category', 'Category')}
          {renderFilterChip('nutritionGrade', 'Grade')}
          {renderFilterChip('deviceType', 'Device')}
          {filters.startDate && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              <span className="text-muted-foreground font-normal">From:</span>
              <span>{filters.startDate.split('T')[0]}</span>
              <button
                type="button"
                onClick={() => onFilterChange('startDate', undefined)}
                className="hover:bg-muted ml-1 rounded-full p-0.5"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}
          {filters.endDate && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              <span className="text-muted-foreground font-normal">To:</span>
              <span>{filters.endDate.split('T')[0]}</span>
              <button
                type="button"
                onClick={() => onFilterChange('endDate', undefined)}
                className="hover:bg-muted ml-1 rounded-full p-0.5"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
