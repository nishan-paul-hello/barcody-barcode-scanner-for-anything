'use client';

import { analytics } from '@/lib/analytics.service';
import { useState, useEffect } from 'react';
import { useScans, useDeleteScan, useBulkDeleteScans } from '@/hooks/use-scans';
import { ScanTable } from '@/components/history/ScanTable';
import { ScanFilters } from '@/components/history/ScanFilters';
import { ScanDetailsDialog } from '@/components/history/ScanDetailsDialog';
import { type ScanResponseDto, type PaginationParams } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Download,
} from 'lucide-react';
import { ExportModal } from '@/components/export/ExportModal';

export default function HistoryPage() {
  // State for filters and pagination
  const [filters, setFilters] = useState<PaginationParams>({
    page: 1,
    limit: 20,
    sortBy: 'scannedAt',
    order: 'DESC',
  });

  // Debounced search state
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal state
  const [viewScan, setViewScan] = useState<ScanResponseDto | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
      if (searchValue) {
        analytics.trackSearch(searchValue);
      }
      // Reset page when search changes
      setFilters((prev) => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Reset page when filters change (except page/search handled above)
  const handleFilterChange = (key: keyof PaginationParams, value: unknown) => {
    if (key === 'search') {
      setSearchValue(value as string);
      return;
    }
    analytics.trackFilter(key, String(value));
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchValue('');
    setFilters({
      page: 1,
      limit: 20,
      sortBy: 'scannedAt',
      order: 'DESC',
    });
  };

  const handleSortChange = (column: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      order: prev.sortBy === column && prev.order === 'DESC' ? 'ASC' : 'DESC',
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Data fetching
  const { data, isLoading, isError, refetch } = useScans({
    ...filters,
    search: debouncedSearch,
  });
  const deleteScanMutation = useDeleteScan();
  const bulkDeleteMutation = useBulkDeleteScans();

  // Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked && data?.items) {
      setSelectedIds(data.items.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this scan?')) {
      deleteScanMutation.mutate(id, {
        onSuccess: () => {
          analytics.trackScanDeleted(1);
        },
      });
    }
  };

  const handleBulkDelete = () => {
    const count = selectedIds.length;
    bulkDeleteMutation.mutate(selectedIds, {
      onSuccess: () => {
        analytics.trackScanDeleted(count);
        setSelectedIds([]);
        setShowBulkDeleteConfirm(false);
      },
    });
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Scan History</h1>
          <p className="text-muted-foreground">
            View and manage your scan history, filter by type, and export data.
          </p>
        </div>
        <Button onClick={() => setShowExportModal(true)} className="sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      <ScanFilters
        filters={{ ...filters, search: searchValue }}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-muted/50 animate-in fade-in slide-in-from-top-2 flex items-center gap-4 rounded-lg border p-2">
          <span className="ml-2 text-sm font-medium">
            {selectedIds.length} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowBulkDeleteConfirm(true)}
            disabled={bulkDeleteMutation.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
            Cancel Selection
          </Button>
        </div>
      )}

      {isError ? (
        <div className="bg-destructive/10 text-destructive rounded-lg border p-8 text-center">
          <p>Failed to load scans.</p>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="border-destructive/50 hover:bg-destructive/10 mt-4"
          >
            Retry
          </Button>
        </div>
      ) : (
        <ScanTable
          scans={data?.items || []}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onDelete={handleDelete}
          onView={(scan) => setViewScan(scan)}
          sortBy={filters.sortBy || 'scannedAt'}
          sortOrder={filters.order || 'DESC'}
          onSortChange={handleSortChange}
        />
      )}

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Page {data.meta.page} of {data.meta.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange((filters.page || 1) - 1)}
              disabled={data.meta.page <= 1}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange((filters.page || 1) + 1)}
              disabled={data.meta.page >= data.meta.totalPages}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ScanDetailsDialog
        scan={viewScan}
        isOpen={!!viewScan}
        onClose={() => setViewScan(null)}
      />

      <Dialog
        open={showBulkDeleteConfirm}
        onOpenChange={setShowBulkDeleteConfirm}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedIds.length} scans?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. These scans will be permanently
              deleted from your history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkDeleteConfirm(false)}
              disabled={bulkDeleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        defaultFilters={{
          ...filters,
          search: searchValue,
        }}
      />
    </div>
  );
}
