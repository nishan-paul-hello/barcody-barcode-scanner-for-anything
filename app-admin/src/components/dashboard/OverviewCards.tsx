'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalyticsOverview } from '@/hooks/useAnalytics';
import {
  Activity,
  Barcode,
  Users,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { DateRange } from 'react-day-picker';

interface OverviewCardsProps {
  dateRange: DateRange | undefined;
}

function formatGrowth(value: number | null | undefined): {
  label: string;
  direction: 'up' | 'down' | 'neutral';
} {
  if (value === null || value === undefined) {
    return { label: 'No prior data', direction: 'neutral' };
  }
  const sign = value > 0 ? '+' : '';
  const label = `${sign}${value}% vs prev 30 days`;
  const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'neutral';
  return { label, direction };
}

export function OverviewCards({ dateRange: _dateRange }: OverviewCardsProps) {
  const { data, isLoading } = useAnalyticsOverview();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-[60px]" />
              <Skeleton className="h-4 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const scanGrowth = formatGrowth(data?.scanGrowthPercent);
  const userGrowth = formatGrowth(data?.userGrowthPercent);

  const stats = [
    {
      title: 'Total Scans',
      value: (data?.totalScans ?? 0).toLocaleString(),
      icon: Barcode,
      description: scanGrowth.label,
      trend: scanGrowth.direction,
    },
    {
      title: 'Total Users',
      value: (data?.totalUsers ?? 0).toLocaleString(),
      icon: Users,
      description: userGrowth.label,
      trend: userGrowth.direction,
    },
    {
      title: 'Active Today',
      value: (data?.activeToday ?? 0).toLocaleString(),
      icon: Activity,
      description: 'Scans since midnight',
      trend: 'neutral' as const,
    },
    {
      title: 'Success Rate',
      value: data?.successRate !== undefined ? `${data.successRate}%` : '—',
      icon: CheckCircle2,
      description: 'Identified barcodes / total scans',
      trend: 'neutral' as const,
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-muted-foreground flex items-center text-xs">
              {stat.trend === 'up' && (
                <TrendingUp className="mr-1 size-3 text-green-500" />
              )}
              {stat.trend === 'down' && (
                <TrendingDown className="mr-1 size-3 text-red-400" />
              )}
              {stat.trend === 'neutral' && (
                <Minus className="mr-1 size-3 text-zinc-500" />
              )}
              {stat.description}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
