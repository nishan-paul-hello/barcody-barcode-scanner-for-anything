import { useState, useCallback, useMemo } from 'react';
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

  const activeFilterCount = useMemo(
    () =>
      Object.entries(filters).filter(
        ([key, value]) =>
          value !== undefined &&
          value !== '' &&
          !['page', 'limit', 'sortBy', 'order'].includes(key)
      ).length,
    [filters]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange('search', e.target.value);
    },
    [onFilterChange]
  );

  const handleBarcodeTypeChange = useCallback(
    (val: string) => {
      onFilterChange('barcodeType', val === 'ALL' ? undefined : val);
    },
    [onFilterChange]
  );

  const handleCategoryChange = useCallback(
    (val: string) => {
      onFilterChange('category', val === 'ALL' ? undefined : val);
    },
    [onFilterChange]
  );

  const handleNutritionGradeChange = useCallback(
    (val: string) => {
      onFilterChange('nutritionGrade', val === 'ALL' ? undefined : val);
    },
    [onFilterChange]
  );

  const handleDeviceTypeChange = useCallback(
    (val: string) => {
      onFilterChange('deviceType', val === 'ALL' ? undefined : val);
    },
    [onFilterChange]
  );

  const handleStartDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange(
        'startDate',
        e.target.value ? new Date(e.target.value).toISOString() : undefined
      );
    },
    [onFilterChange]
  );

  const handleEndDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange(
        'endDate',
        e.target.value ? new Date(e.target.value).toISOString() : undefined
      );
    },
    [onFilterChange]
  );

  const handleApply = useCallback(() => {
    setIsOpen(false);
  }, []);

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
              onChange={handleSearchChange}
            />
            {recentSearches.length > 0 && !filters.search && (
              <div className="bg-popover absolute top-11 left-0 z-10 hidden w-full rounded-md border p-2 shadow-md group-focus-within:block">
                <p className="text-muted-foreground px-2 py-1 text-[10px] font-semibold uppercase">
                  Recent Searches
                </p>
                {recentSearches.map((term) => (
                  <RecentSearchItem
                    key={term}
                    term={term}
                    onClick={onFilterChange}
                  />
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
                  onValueChange={handleBarcodeTypeChange}
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
                  onValueChange={handleCategoryChange}
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
                  onValueChange={handleNutritionGradeChange}
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
                  onValueChange={handleDeviceTypeChange}
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
                    onChange={handleStartDateChange}
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="date"
                    className="flex-1"
                    value={filters.endDate ? filters.endDate.split('T')[0] : ''}
                    onChange={handleEndDateChange}
                  />
                </div>
              </div>
              <div className="sm:w-32">
                <Button className="w-full" onClick={handleApply}>
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
          {Object.entries({
            barcodeType: 'Type',
            category: 'Category',
            nutritionGrade: 'Grade',
            deviceType: 'Device',
          }).map(([key, label]) => {
            const val = filters[key as keyof PaginationParams];
            if (!val) {
              return null;
            }
            return (
              <FilterChip
                key={key}
                filterKey={key as keyof PaginationParams}
                label={label}
                value={String(val)}
                onRemove={onFilterChange}
              />
            );
          })}
          {filters.startDate && (
            <FilterChip
              filterKey="startDate"
              label="From"
              value={(filters.startDate ?? '').split('T')[0] || ''}
              onRemove={onFilterChange}
            />
          )}
          {filters.endDate && (
            <FilterChip
              filterKey="endDate"
              label="To"
              value={(filters.endDate ?? '').split('T')[0] || ''}
              onRemove={onFilterChange}
            />
          )}
        </div>
      )}
    </div>
  );
}
function RecentSearchItem({
  term,
  onClick,
}: {
  term: string;
  onClick: (k: 'search', v: string) => void;
}) {
  const handleClick = useCallback(
    () => onClick('search', term),
    [onClick, term]
  );
  return (
    <button
      type="button"
      className="hover:bg-accent flex w-full items-center rounded-sm px-2 py-1.5 text-sm"
      onClick={handleClick}
    >
      <Search className="text-muted-foreground mr-2 size-4" />
      {term}
    </button>
  );
}

function FilterChip({
  filterKey,
  label,
  value,
  onRemove,
}: {
  filterKey: keyof PaginationParams;
  label: string;
  value: string;
  onRemove: (k: keyof PaginationParams, v: undefined) => void;
}) {
  const handleRemove = useCallback(
    () => onRemove(filterKey, undefined),
    [onRemove, filterKey]
  );
  return (
    <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
      <span className="text-muted-foreground font-normal">{label}:</span>
      <span>{value}</span>
      <button
        type="button"
        onClick={handleRemove}
        className="hover:bg-muted ml-1 rounded-full p-0.5"
      >
        <X className="size-3" />
      </button>
    </Badge>
  );
}
