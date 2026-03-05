'use client';

import { useState, useMemo } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useScans } from '@/hooks/useAnalytics';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ScanLine,
  CheckCircle2,
  XCircle,
  Smartphone,
  Monitor,
  X,
} from 'lucide-react';

const PAGE_SIZE = 25;

type ScanUser = { id: string; email: string };
type Scan = {
  id: string;
  userId: string;
  user?: ScanUser;
  barcodeData: string;
  barcodeType: string;
  scannedAt: string;
  deviceType: string;
  productName?: string | null;
  brand?: string | null;
  category?: string | null;
  nutritionGrade?: string | null;
};

type ScanListResponse = {
  items: Scan[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const BARCODE_COLOR: Record<string, string> = {
  QR: 'bg-violet-500/10 text-violet-400',
  EAN13: 'bg-blue-500/10 text-blue-400',
  EAN8: 'bg-blue-500/10 text-blue-400',
  UPCA: 'bg-cyan-500/10 text-cyan-400',
  UPCE: 'bg-cyan-500/10 text-cyan-400',
  CODE128: 'bg-amber-500/10 text-amber-400',
  CODE39: 'bg-amber-500/10 text-amber-400',
  DATA_MATRIX: 'bg-pink-500/10 text-pink-400',
  AZTEC: 'bg-emerald-500/10 text-emerald-400',
  UNKNOWN: 'bg-zinc-700/50 text-zinc-500',
};

const NUTRITION_COLOR: Record<string, string> = {
  a: 'bg-emerald-500/20 text-emerald-300',
  b: 'bg-green-500/20 text-green-400',
  c: 'bg-yellow-500/20 text-yellow-400',
  d: 'bg-orange-500/20 text-orange-400',
  e: 'bg-red-500/20 text-red-400',
};

export default function ScansPage() {
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');

  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      startDate: dateRange?.from?.toISOString(),
      endDate: dateRange?.to?.toISOString(),
      query: query || undefined,
    }),
    [page, dateRange, query]
  );

  const { data, isLoading, isFetching } = useScans(params);
  const scans = data as ScanListResponse | undefined;
  const items = useMemo(() => scans?.items ?? [], [scans?.items]);

  const total = scans?.total ?? 0;
  const totalPages = scans?.totalPages ?? 1;

  const identified = useMemo(
    () => items.filter((s) => s.barcodeType !== 'UNKNOWN').length,
    [items]
  );
  const successRate =
    items.length > 0 ? ((identified / items.length) * 100).toFixed(0) : '—';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchInput);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput('');
    setQuery('');
    setPage(1);
  };

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-cyan-400">
            Scans
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Browse and filter all barcode scans across every user.
          </p>
        </div>
        <DateRangeSelector
          dateRange={dateRange}
          onDateRangeChange={handleDateChange}
        />
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ScanLine className="h-4 w-4" />}
          label="Total Scans"
          value={isLoading ? null : total.toLocaleString()}
          sub="in date range"
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Identified"
          value={isLoading ? null : identified.toLocaleString()}
          sub={`${successRate}% success rate (this page)`}
          color="text-emerald-400"
        />
        <StatCard
          icon={<XCircle className="h-4 w-4" />}
          label="Unidentified"
          value={
            isLoading ? null : (items.length - identified).toLocaleString()
          }
          sub="unknown barcode type"
          color="text-red-400"
        />
        <StatCard
          icon={<Smartphone className="h-4 w-4" />}
          label="Page"
          value={isLoading ? null : `${page} / ${totalPages}`}
          sub={`${PAGE_SIZE} per page`}
        />
      </div>

      {/* Table card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Scan Log</CardTitle>
              <CardDescription>
                {total.toLocaleString()} scans in selected period
              </CardDescription>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                <input
                  id="scan-search"
                  type="text"
                  placeholder="Barcode data or email…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-9 w-60 rounded-md border border-zinc-800 bg-zinc-950 pr-3 pl-8 text-sm text-zinc-100 placeholder-zinc-600 ring-0 transition outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
                />
              </div>
              <button
                type="submit"
                className="h-9 rounded-md bg-zinc-800 px-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700 active:scale-95"
              >
                Filter
              </button>
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="flex h-9 items-center gap-1.5 rounded-md px-3 text-sm text-zinc-400 transition hover:text-zinc-200"
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              )}
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <>
              {isFetching && !isLoading && (
                <div className="mb-3 h-0.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-cyan-500" />
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      {[
                        'Barcode',
                        'Type',
                        'Product',
                        'User',
                        'Device',
                        'Scanned',
                      ].map((h) => (
                        <th
                          key={h}
                          className="py-3 pr-4 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase last:pr-0"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-12 text-center text-zinc-500"
                        >
                          No scans found
                          {query ? ` for "${query}"` : ''} in this period.
                        </td>
                      </tr>
                    ) : (
                      items.map((scan) => <ScanRow key={scan.id} scan={scan} />)
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4">
                  <p className="text-muted-foreground text-xs">
                    Page {page} of {totalPages} &mdash; {total.toLocaleString()}{' '}
                    scans
                  </p>
                  <div className="flex items-center gap-1">
                    <PagBtn
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      title="First"
                    >
                      <ChevronsLeft className="h-3.5 w-3.5" />
                    </PagBtn>
                    <PagBtn
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      title="Previous"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </PagBtn>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const start = Math.max(
                        1,
                        Math.min(page - 2, totalPages - 4)
                      );
                      const p = start + i;
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`h-7 min-w-7 rounded px-2 text-xs font-medium transition ${
                            p === page
                              ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/50'
                              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}

                    <PagBtn
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      title="Next"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </PagBtn>
                    <PagBtn
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                      title="Last"
                    >
                      <ChevronsRight className="h-3.5 w-3.5" />
                    </PagBtn>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ScanRow({ scan }: { scan: Scan }) {
  const identified = scan.barcodeType !== 'UNKNOWN';
  const typeClass =
    BARCODE_COLOR[scan.barcodeType] ?? 'bg-zinc-700/50 text-zinc-400';
  const nutClass = scan.nutritionGrade
    ? (NUTRITION_COLOR[scan.nutritionGrade.toLowerCase()] ?? '')
    : '';

  return (
    <tr className="group border-b border-zinc-800/50 transition-colors hover:bg-zinc-900/40">
      {/* Barcode data */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          {identified ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
          ) : (
            <XCircle className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
          )}
          <span className="max-w-[140px] truncate font-mono text-xs text-zinc-300">
            {scan.barcodeData}
          </span>
        </div>
      </td>

      {/* Barcode type badge */}
      <td className="py-3 pr-4">
        <Badge className={`border-0 text-xs ${typeClass}`}>
          {scan.barcodeType}
        </Badge>
      </td>

      {/* Product info */}
      <td className="py-3 pr-4">
        {scan.productName ? (
          <div>
            <div className="max-w-[180px] truncate text-xs text-zinc-200">
              {scan.productName}
            </div>
            {scan.brand && (
              <div className="text-xs text-zinc-500">{scan.brand}</div>
            )}
          </div>
        ) : (
          <span className="text-xs text-zinc-600 italic">—</span>
        )}
        {scan.nutritionGrade && (
          <Badge className={`mt-0.5 border-0 px-1.5 text-xs ${nutClass}`}>
            Nutri-{scan.nutritionGrade.toUpperCase()}
          </Badge>
        )}
      </td>

      {/* User */}
      <td className="py-3 pr-4">
        {scan.user?.email ? (
          <span className="max-w-[160px] truncate text-xs text-zinc-400">
            {scan.user.email}
          </span>
        ) : (
          <span className="font-mono text-xs text-zinc-600">
            {scan.userId.slice(0, 8)}…
          </span>
        )}
      </td>

      {/* Device */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-1.5 text-zinc-400">
          {scan.deviceType === 'mobile' ? (
            <Smartphone className="h-3 w-3" />
          ) : (
            <Monitor className="h-3 w-3" />
          )}
          <span className="text-xs capitalize">{scan.deviceType}</span>
        </div>
      </td>

      {/* Scanned at */}
      <td className="py-3 text-xs text-zinc-400">
        <div>{format(new Date(scan.scannedAt), 'MMM d, yyyy')}</div>
        <div className="text-zinc-600">
          {formatDistanceToNow(new Date(scan.scannedAt), { addSuffix: true })}
        </div>
      </td>
    </tr>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color = 'text-muted-foreground',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  sub?: string;
  color?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <span className={color}>{icon}</span>
      </CardHeader>
      <CardContent>
        {value === null ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <div className="text-xl font-bold">{value}</div>
        )}
        {sub && <p className="text-muted-foreground mt-0.5 text-xs">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function PagBtn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  title: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-6 border-b border-zinc-800 pb-3">
        {[140, 80, 160, 140, 70, 100].map((w, i) => (
          <Skeleton key={i} style={{ width: w }} className="h-3" />
        ))}
      </div>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 py-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
