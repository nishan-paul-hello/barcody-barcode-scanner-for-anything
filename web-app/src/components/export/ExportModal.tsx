'use client';

import { analytics } from '@/lib/analytics.service';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ExportFormat, BarcodeType, DeviceType } from '@/lib/api/types';
import { useExportData } from '@/hooks/use-export';
import { Download, Loader2, Filter, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFilters?: {
    search?: string;
    barcodeType?: BarcodeType;
    deviceType?: DeviceType;
    startDate?: string;
    endDate?: string;
    category?: string;
    nutritionGrade?: string;
  };
}

export function ExportModal({
  isOpen,
  onClose,
  defaultFilters,
}: ExportModalProps) {
  const [format, setFormat] = React.useState<ExportFormat>(ExportFormat.CSV);
  const [filters, setFilters] = React.useState({
    search: defaultFilters?.search || '',
    barcodeType: (defaultFilters?.barcodeType as string) || 'ALL',
    deviceType: (defaultFilters?.deviceType as string) || 'ALL',
    startDate: defaultFilters?.startDate?.split('T')[0] || '',
    endDate: defaultFilters?.endDate?.split('T')[0] || '',
    category: defaultFilters?.category || 'ALL',
    nutritionGrade: defaultFilters?.nutritionGrade || 'ALL',
  });

  const [progress, setProgress] = React.useState<number | null>(null);

  // Update local filters when defaultFilters change
  React.useEffect(() => {
    if (isOpen) {
      setFilters({
        search: defaultFilters?.search || '',
        barcodeType: (defaultFilters?.barcodeType as string) || 'ALL',
        deviceType: (defaultFilters?.deviceType as string) || 'ALL',
        startDate: defaultFilters?.startDate?.split('T')[0] || '',
        endDate: defaultFilters?.endDate?.split('T')[0] || '',
        category: defaultFilters?.category || 'ALL',
        nutritionGrade: defaultFilters?.nutritionGrade || 'ALL',
      });
      setProgress(null);
    }
  }, [isOpen, defaultFilters]);

  const exportMutation = useExportData();

  const handleExport = () => {
    // Validate dates
    if (filters.startDate && filters.endDate) {
      if (new Date(filters.startDate) > new Date(filters.endDate)) {
        toast.error('Start date must be before end date');
        return;
      }
    }

    setProgress(0);
    const exportParams = {
      format,
      filters: {
        search: filters.search || undefined,
        barcodeType:
          filters.barcodeType === 'ALL'
            ? undefined
            : (filters.barcodeType as BarcodeType),
        deviceType:
          filters.deviceType === 'ALL'
            ? undefined
            : (filters.deviceType as DeviceType),
        startDate: filters.startDate
          ? new Date(filters.startDate).toISOString()
          : undefined,
        endDate: filters.endDate
          ? new Date(filters.endDate).toISOString()
          : undefined,
        category: filters.category === 'ALL' ? undefined : filters.category,
        nutritionGrade:
          filters.nutritionGrade === 'ALL' ? undefined : filters.nutritionGrade,
      },
      onProgress: (p: number) => setProgress(p),
    };

    exportMutation.mutate(exportParams, {
      onSuccess: () => {
        analytics.trackExport(format, 0); // 0 as count is unknown until response or not returned
        onClose();
      },
      onError: () => {
        setProgress(null);
      },
    });
  };

  const handlePredefinedRange = (days: number | 'all') => {
    if (days === 'all') {
      setFilters((prev) => ({
        ...prev,
        startDate: '',
        endDate: '',
      }));
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const startDateStr = start.toISOString().split('T')[0] || '';
    const endDateStr = end.toISOString().split('T')[0] || '';

    setFilters((prev) => ({
      ...prev,
      startDate: startDateStr,
      endDate: endDateStr,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="text-primary h-5 w-5" />
            Export Scans
          </DialogTitle>
          <DialogDescription>
            Choose your preferred format and apply filters to export your data.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(ExportFormat).map(([key, value]) => (
                <Button
                  key={value}
                  type="button"
                  variant={format === value ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setFormat(value)}
                >
                  {key}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="h-4 w-4" />
              Filter Options
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                  Date Range
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[10px]"
                    onClick={() => handlePredefinedRange(7)}
                  >
                    7d
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[10px]"
                    onClick={() => handlePredefinedRange(30)}
                  >
                    30d
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[10px]"
                    onClick={() => handlePredefinedRange('all')}
                  >
                    All
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-muted-foreground pl-1 text-[10px]">
                    From
                  </span>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters({ ...filters, startDate: e.target.value })
                    }
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground pl-1 text-[10px]">
                    To
                  </span>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      setFilters({ ...filters, endDate: e.target.value })
                    }
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            {/* Other Filters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-muted-foreground pl-1 text-[10px] font-medium tracking-wider uppercase">
                  Barcode Type
                </label>
                <Select
                  value={filters.barcodeType}
                  onValueChange={(val) =>
                    setFilters({ ...filters, barcodeType: val })
                  }
                >
                  <SelectTrigger className="h-9">
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
              <div className="space-y-2">
                <label className="text-muted-foreground pl-1 text-[10px] font-medium tracking-wider uppercase">
                  Device Type
                </label>
                <Select
                  value={filters.deviceType}
                  onValueChange={(val) =>
                    setFilters({ ...filters, deviceType: val })
                  }
                >
                  <SelectTrigger className="h-9">
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

              <div className="space-y-2">
                <label className="text-muted-foreground pl-1 text-[10px] font-medium tracking-wider uppercase">
                  Category
                </label>
                <Select
                  value={filters.category}
                  onValueChange={(val) =>
                    setFilters({ ...filters, category: val })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    {[
                      'food',
                      'beverage',
                      'personal care',
                      'health',
                      'other',
                    ].map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-muted-foreground pl-1 text-[10px] font-medium tracking-wider uppercase">
                  Nutrition Grade
                </label>
                <Select
                  value={filters.nutritionGrade}
                  onValueChange={(val) =>
                    setFilters({ ...filters, nutritionGrade: val })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Grades</SelectItem>
                    {['A', 'B', 'C', 'D', 'E'].map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        Grade {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-muted-foreground pl-1 text-[10px] font-medium tracking-wider uppercase">
                Search Term
              </label>
              <Input
                placeholder="Find in barcode data..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="h-9"
              />
            </div>

            {!filters.startDate && !filters.endDate && (
              <div className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 p-2 text-[11px] text-amber-600 dark:text-amber-500">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  Exporting all history may take longer for large datasets.
                  Consider using a date range.
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={exportMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
          >
            {exportMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>

        {exportMutation.isPending && (
          <div className="bg-background/50 absolute inset-0 flex flex-col items-center justify-center rounded-lg backdrop-blur-[1px]">
            <div className="bg-card flex max-w-[80%] flex-col items-center gap-4 rounded-xl border p-6 text-center shadow-xl">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
              <div className="space-y-1">
                <p className="font-semibold">Generating your export</p>
                <p className="text-muted-foreground text-xs">
                  {progress !== null && progress > 0
                    ? `Downloading: ${progress}%`
                    : 'This may take a moment for large datasets.'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportMutation.reset()}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
