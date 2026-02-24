'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import {
  useAnalyticsTrends,
  useBarcodeTypes,
  useDeviceBreakdown,
  useTopBarcodes,
  useHourlyActivity,
} from '@/hooks/useAnalytics';
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
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Barcode, Clock, TrendingUp, BarChart2 } from 'lucide-react';

const PALETTE = [
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
];

const HOUR_LABELS = [
  '12am',
  '1am',
  '2am',
  '3am',
  '4am',
  '5am',
  '6am',
  '7am',
  '8am',
  '9am',
  '10am',
  '11am',
  '12pm',
  '1pm',
  '2pm',
  '3pm',
  '4pm',
  '5pm',
  '6pm',
  '7pm',
  '8pm',
  '9pm',
  '10pm',
  '11pm',
];

const tooltipStyle = {
  backgroundColor: '#0f0f0f',
  borderColor: '#27272a',
  borderRadius: 8,
  color: '#f4f4f5',
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const { data: trendData, isLoading: loadingTrends } =
    useAnalyticsTrends(dateRange);
  const { data: barcodeData, isLoading: loadingBarcodes } = useBarcodeTypes();
  const { data: deviceData, isLoading: loadingDevices } = useDeviceBreakdown();
  const { data: topBarcodes, isLoading: loadingTop } =
    useTopBarcodes(dateRange);
  const { data: hourlyData, isLoading: loadingHourly } =
    useHourlyActivity(dateRange);

  const formattedTrends = useMemo(() => {
    if (!trendData?.data) return [];
    return trendData.data.map((item: { date: string; count: number }) => ({
      ...item,
      label: format(new Date(item.date), 'MMM d'),
    }));
  }, [trendData]);

  const formattedHourly = useMemo(() => {
    if (!hourlyData) return [];
    return (hourlyData as { hour: number; count: number }[]).map((item) => ({
      ...item,
      label: HOUR_LABELS[item.hour] ?? `${item.hour}h`,
    }));
  }, [hourlyData]);

  const totalInRange = useMemo(
    () =>
      formattedTrends.reduce(
        (sum: number, d: { count: number }) => sum + d.count,
        0
      ),
    [formattedTrends]
  );

  const peakDay = useMemo(() => {
    if (!formattedTrends.length) return null;
    return formattedTrends.reduce(
      (
        max: { label: string; count: number },
        d: { label: string; count: number }
      ) => (d.count > max.count ? d : max),
      formattedTrends[0] as { label: string; count: number }
    );
  }, [formattedTrends]);

  const avgPerDay = formattedTrends.length
    ? (totalInRange / formattedTrends.length).toFixed(1)
    : '—';

  const peakHour = useMemo(() => {
    if (!formattedHourly.length) return null;
    return formattedHourly.reduce(
      (
        max: { label: string; hour: number; count: number },
        d: { label: string; hour: number; count: number }
      ) => (d.count > max.count ? d : max),
      formattedHourly[0] as { label: string; hour: number; count: number }
    );
  }, [formattedHourly]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Deep-dive into scan activity, barcode types, device breakdown, and
            usage patterns.
          </p>
        </div>
        <DateRangeSelector
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      {/* Summary stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Barcode className="h-4 w-4" />}
          label="Scans in Range"
          value={loadingTrends ? null : totalInRange.toLocaleString()}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Avg Scans / Day"
          value={loadingTrends ? null : avgPerDay}
        />
        <StatCard
          icon={<BarChart2 className="h-4 w-4" />}
          label="Peak Day"
          value={
            loadingTrends
              ? null
              : peakDay
                ? `${peakDay.label} (${peakDay.count})`
                : '—'
          }
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Peak Hour (UTC)"
          value={
            loadingHourly
              ? null
              : peakHour
                ? `${peakHour.label} (${peakHour.count})`
                : '—'
          }
        />
      </div>

      {/* Scans Over Time – full width area chart */}
      <Card>
        <CardHeader>
          <CardTitle>Scans Over Time</CardTitle>
          <CardDescription>
            Daily scan volume across the selected period
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          {loadingTrends ? (
            <Skeleton className="h-[320px] w-full" />
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedTrends}>
                  <defs>
                    <linearGradient
                      id="scanGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="label"
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="url(#scanGradient)"
                    activeDot={{ r: 6, fill: '#06b6d4' }}
                    name="Scans"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hourly heatmap bar chart */}
      <Card>
        <CardHeader>
          <CardTitle>Hourly Activity Pattern</CardTitle>
          <CardDescription>
            Scan distribution by hour of day (UTC) — identifies peak usage
            windows
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          {loadingHourly ? (
            <Skeleton className="h-[260px] w-full" />
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedHourly} barCategoryGap="20%">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#27272a"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    interval={1}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={32}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: '#27272a55' }}
                  />
                  <Bar dataKey="count" name="Scans" radius={[4, 4, 0, 0]}>
                    {formattedHourly.map(
                      (entry: { count: number }, index: number) => {
                        const max = Math.max(
                          ...formattedHourly.map(
                            (d: { count: number }) => d.count
                          )
                        );
                        const intensity = max > 0 ? entry.count / max : 0;
                        const opacity = 0.25 + intensity * 0.75;
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={`rgba(6, 182, 212, ${opacity})`}
                          />
                        );
                      }
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Barcode types + Device breakdown side by side */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Barcode type donut */}
        <Card>
          <CardHeader>
            <CardTitle>Barcode Type Distribution</CardTitle>
            <CardDescription>
              Breakdown of all scanned barcode formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingBarcodes ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={barcodeData}
                      cx="50%"
                      cy="45%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="type"
                    >
                      {((barcodeData as unknown[]) ?? []).map(
                        (_: unknown, i: number) => (
                          <Cell
                            key={`bc-${i}`}
                            fill={PALETTE[i % PALETTE.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device breakdown bar */}
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>Scans segmented by device type</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {loadingDevices ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={deviceData}
                    layout="vertical"
                    barCategoryGap="30%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#27272a"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      stroke="#71717a"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="device"
                      stroke="#71717a"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ fill: '#27272a55' }}
                    />
                    <Bar dataKey="count" name="Scans" radius={[0, 4, 4, 0]}>
                      {((deviceData as unknown[]) ?? []).map(
                        (_: unknown, i: number) => (
                          <Cell
                            key={`dev-${i}`}
                            fill={PALETTE[i % PALETTE.length]}
                          />
                        )
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Barcodes table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Scanned Barcodes</CardTitle>
          <CardDescription>
            Most frequently scanned barcodes in the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTop ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !topBarcodes?.length ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No scan data for this period.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="py-2 pr-4 text-left font-medium text-zinc-400">
                      #
                    </th>
                    <th className="py-2 pr-4 text-left font-medium text-zinc-400">
                      Barcode
                    </th>
                    <th className="py-2 pr-4 text-left font-medium text-zinc-400">
                      Product
                    </th>
                    <th className="py-2 pr-4 text-left font-medium text-zinc-400">
                      Type
                    </th>
                    <th className="py-2 text-right font-medium text-zinc-400">
                      Scans
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    topBarcodes as {
                      barcodeData: string;
                      barcodeType: string;
                      productName: string | null;
                      count: number;
                    }[]
                  ).map((item, idx) => {
                    const maxCount = topBarcodes[0]?.count ?? 1;
                    const pct = Math.round((item.count / maxCount) * 100);
                    return (
                      <tr
                        key={`${item.barcodeData}-${idx}`}
                        className="group border-b border-zinc-800/50 transition-colors hover:bg-zinc-900/40"
                      >
                        <td className="py-3 pr-4 text-zinc-500">{idx + 1}</td>
                        <td className="py-3 pr-4 font-mono text-xs text-zinc-300">
                          {item.barcodeData.length > 24
                            ? `${item.barcodeData.slice(0, 24)}…`
                            : item.barcodeData}
                        </td>
                        <td className="py-3 pr-4 text-zinc-400">
                          {item.productName ?? (
                            <span className="text-zinc-600 italic">
                              Unknown
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline" className="text-xs">
                            {item.barcodeType}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-800">
                              <div
                                className="h-full rounded-full bg-cyan-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-10 text-right font-medium text-zinc-200">
                              {item.count.toLocaleString()}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        {value === null ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <div className="truncate text-xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}
