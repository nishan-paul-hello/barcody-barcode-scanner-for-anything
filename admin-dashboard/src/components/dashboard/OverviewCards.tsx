'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalyticsOverview } from '@/hooks/useAnalytics';
import {
  Activity,
  Barcode,
  Users,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { DateRange } from 'react-day-picker';

interface OverviewCardsProps {
  dateRange: DateRange | undefined;
}

export function OverviewCards({ dateRange }: OverviewCardsProps) {
  const { data, isLoading } = useAnalyticsOverview(dateRange);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

  const stats = [
    {
      title: 'Total Scans',
      value: data?.totalScans ?? 0,
      icon: Barcode,
      description: '+12% from last month', // Mocked
      trend: 'up',
    },
    {
      title: 'Total Users',
      value: data?.totalUsers ?? 0,
      icon: Users,
      description: '+5% from last month', // Mocked
      trend: 'up',
    },
    {
      title: 'Active Today',
      value: data?.activeToday ?? 0,
      icon: Activity,
      description: 'Users active in last 24h',
      trend: 'neutral',
    },
    {
      title: 'Success Rate',
      value: '98.5%', // Mocked
      icon: CheckCircle2,
      description: '+0.1% from yesterday', // Mocked
      trend: 'up',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              )}
              {stat.description}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
