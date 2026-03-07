'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useScans, useDeleteScan, useBulkDeleteScans } from '@/hooks/use-scans';
import { ScanTable } from '@/components/history/ScanTable';
import { ScanFilters } from '@/components/history/ScanFilters';
import { ScanDetailsDialog } from '@/components/history/ScanDetailsDialog';
import type {
  BarcodeType,
  DeviceType,
  ScanResponseDto,
  PaginationParams,
  ScanStatsResponse,
} from '@/lib/api/types';
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
import { motion } from 'framer-motion';
import { analytics } from '@/lib/analytics.service';
import { api } from '@/lib/api/client';

export default function HistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // State for filters and pagination
  const [filters, setFilters] = useState<PaginationParams>(() => {
    const params: PaginationParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: searchParams.get('sortBy') || 'scannedAt',
      order: (searchParams.get('order') as 'ASC' | 'DESC') || 'DESC',
      barcodeType:
        (searchParams.get('barcodeType') as BarcodeType) || undefined,
      deviceType: (searchParams.get('deviceType') as DeviceType) || undefined,
      category: searchParams.get('category') || undefined,
      nutritionGrade: searchParams.get('nutritionGrade') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };
    return params;
  });

  // Debounced search state
  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') || ''
  );
  const [debouncedSearch, setDebouncedSearch] = useState(
    searchParams.get('search') || ''
  );

  // Recent searches
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        try {
          return JSON.parse(saved) as string[];
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  const addRecentSearch = useCallback((term: string) => {
    if (!term || term.trim() === '') {
      return;
    }
    setRecentSearches((prev) => {
      const newSearches = [term, ...prev.filter((s) => s !== term)].slice(0, 5);
      if (typeof window !== 'undefined') {
        localStorage.setItem('recentSearches', JSON.stringify(newSearches));
      }
      return newSearches;
    });
  }, []);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal state
  const [viewScan, setViewScan] = useState<ScanResponseDto | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Stats State
  const [stats, setStats] = useState<ScanStatsResponse>({
    totalScans: 0,
    activeProducts: 0,
    recentActivity: null,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Sync URL with filters and search
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        key !== 'search'
      ) {
        params.set(key, String(value));
      }
    });
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [filters, debouncedSearch, pathname, router]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
      if (searchValue) {
        analytics.trackSearch(searchValue);
        addRecentSearch(searchValue);
      }
      // Reset page when search changes
      setFilters((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, addRecentSearch]);

  // Fetch stats on load
  useEffect(() => {
    api.scans
      .getStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to fetch stats:', err))
      .finally(() => setStatsLoading(false));
  }, []);

  const formatActivity = (scan: ScanResponseDto | null) => {
    if (!scan) {
      return 'No recent activity';
    }

    const date = new Date(scan.scannedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    let timeAgo = '';
    if (diffMins < 1) {
      timeAgo = 'Just now';
    } else if (diffMins < 60) {
      timeAgo = `${diffMins} mins ago`;
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} hours ago`;
    } else {
      timeAgo = `${diffDays} days ago`;
    }

    return `Scanned "${scan.product?.name || scan.barcodeData}" ${timeAgo}`;
  };

  // Reset page when filters change
  const handleFilterChange = useCallback(
    (key: keyof PaginationParams, value: unknown) => {
      if (key === 'search') {
        setSearchValue(value as string);
        return;
      }
      analytics.trackFilter(key, String(value));
      setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    },
    []
  );

  const handleClearFilters = useCallback(() => {
    setSearchValue('');
    setFilters({
      page: 1,
      limit: 20,
      sortBy: 'scannedAt',
      order: 'DESC',
    });
  }, []);

  const handleSortChange = useCallback((column: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      order: prev.sortBy === column && prev.order === 'DESC' ? 'ASC' : 'DESC',
    }));
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }, []);

  // Data fetching
  const { data, isLoading, isError, refetch } = useScans({
    ...filters,
    search: debouncedSearch,
  });
  const deleteScanMutation = useDeleteScan();
  const bulkDeleteMutation = useBulkDeleteScans();

  // Handlers
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked && data?.items) {
        setSelectedIds(data.items.map((s) => s.id));
      } else {
        setSelectedIds([]);
      }
    },
    [data]
  );

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (window.confirm('Are you sure you want to delete this scan?')) {
        deleteScanMutation.mutate(id, {
          onSuccess: () => {
            analytics.trackScanDeleted(1);
          },
        });
      }
    },
    [deleteScanMutation]
  );

  const handleBulkDelete = useCallback(() => {
    const count = selectedIds.length;
    bulkDeleteMutation.mutate(selectedIds, {
      onSuccess: () => {
        analytics.trackScanDeleted(count);
        setSelectedIds([]);
        setShowBulkDeleteConfirm(false);
      },
    });
  }, [bulkDeleteMutation, selectedIds]);

  const handleCompare = useCallback(() => {
    if (data?.items) {
      const selectedBarcodes = data.items
        .filter((s) => selectedIds.includes(s.id))
        .map((s) => s.barcodeData);

      const uniqueBarcodes = Array.from(new Set(selectedBarcodes));

      if (uniqueBarcodes.length < 2) {
        alert('Please select at least 2 different products to compare.');
        return;
      }

      if (uniqueBarcodes.length > 5) {
        alert('You can compare up to 5 products at once.');
        return;
      }

      router.push(`/compare?barcodes=${uniqueBarcodes.join(',')}`);
    }
  }, [data, selectedIds, router]);

  const handleOpenExportModal = useCallback(() => setShowExportModal(true), []);
  const handleCloseExportModal = useCallback(
    () => setShowExportModal(false),
    []
  );
  const handleOpenBulkDeleteConfirm = useCallback(
    () => setShowBulkDeleteConfirm(true),
    []
  );
  const handleCancelSelection = useCallback(() => setSelectedIds([]), []);
  const handleCloseViewScan = useCallback(() => setViewScan(null), []);
  const handleSetViewScan = useCallback(
    (scan: ScanResponseDto) => setViewScan(scan),
    []
  );
  const handleCloseBulkDeleteConfirm = useCallback(
    () => setShowBulkDeleteConfirm(false),
    []
  );
  const handlePrevPage = useCallback(
    () => handlePageChange((filters.page || 1) - 1),
    [filters.page, handlePageChange]
  );
  const handleNextPage = useCallback(
    () => handlePageChange((filters.page || 1) + 1),
    [filters.page, handlePageChange]
  );
  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <div className="container mx-auto max-w-7xl space-y-6 pt-0 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="mb-4 text-4xl font-black tracking-tight text-white md:text-6xl">
          SCAN <span className="text-cyan-400">HISTORY</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-white/50">
          View and manage your scan history, filter by type, and export data.
        </p>
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleOpenExportModal}
            className="group cursor-pointer rounded-full bg-white/5 px-8 font-bold text-white transition-all hover:bg-white/10"
          >
            <Download className="mr-2 size-4 transition-transform group-hover:-translate-y-1" />
            Export Data
          </Button>
        </div>
      </motion.div>

      {/* Dashboard Stats */}
      {statsLoading ? (
        <div className="mt-4 flex justify-center rounded-3xl border border-white/5 bg-white/5 py-12 backdrop-blur-xl">
          <Loader2 className="size-6 animate-spin text-cyan-500/50" />
        </div>
      ) : (
        <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl transition-all hover:bg-white/[0.08]">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <h2 className="relative z-10 mb-2 text-sm font-bold tracking-widest text-white/40 uppercase">
              Total Scans
            </h2>
            <p className="relative z-10 text-4xl font-black text-white">
              {stats.totalScans}
            </p>
          </div>
          <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl transition-all hover:bg-white/[0.08]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <h2 className="relative z-10 mb-2 text-sm font-bold tracking-widest text-white/40 uppercase">
              Active Products
            </h2>
            <p className="relative z-10 text-4xl font-black text-white">
              {stats.activeProducts}
            </p>
          </div>
          <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl transition-all hover:bg-white/[0.08]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <h2 className="relative z-10 mb-2 text-sm font-bold tracking-widest text-white/40 uppercase">
              Recent Activity
            </h2>
            <p className="relative z-10 text-sm font-medium text-white/60">
              {formatActivity(stats.recentActivity)}
            </p>
          </div>
        </div>
      )}

      <ScanFilters
        filters={{ ...filters, search: searchValue }}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        recentSearches={recentSearches}
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
            onClick={handleOpenBulkDeleteConfirm}
            disabled={bulkDeleteMutation.isPending}
          >
            <Trash2 className="mr-2 size-4" />
            Delete Selected
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleCompare}
            disabled={selectedIds.length < 2 || selectedIds.length > 5}
          >
            Compare Selected
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={handleCancelSelection}>
            Cancel Selection
          </Button>
        </div>
      )}

      {isError ? (
        <div className="bg-destructive/10 text-destructive rounded-lg border p-8 text-center">
          <p>Failed to load scans.</p>
          <Button
            variant="outline"
            onClick={handleRetry}
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
          onView={handleSetViewScan}
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
              onClick={handlePrevPage}
              disabled={data.meta.page <= 1}
            >
              <ChevronLeft className="mr-1 size-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={data.meta.page >= data.meta.totalPages}
            >
              Next <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      )}

      <ScanDetailsDialog
        scan={viewScan}
        isOpen={!!viewScan}
        onClose={handleCloseViewScan}
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
              onClick={handleCloseBulkDeleteConfirm}
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
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ExportModal
        isOpen={showExportModal}
        onClose={handleCloseExportModal}
        defaultFilters={{
          ...filters,
          search: searchValue,
        }}
      />
    </div>
  );
}
