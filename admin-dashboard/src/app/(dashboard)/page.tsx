'use client';

import { useState } from 'react';
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector';
import { OverviewCards } from '@/components/dashboard/OverviewCards';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import { RetentionCohort } from '@/components/dashboard/RetentionCohort';
import type { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <DateRangeSelector
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>
      </div>

      <div className="space-y-4">
        <OverviewCards dateRange={dateRange} />

        <AnalyticsCharts dateRange={dateRange} />

        <div className="grid grid-cols-1">
          <RetentionCohort />
        </div>
      </div>
    </div>
  );
}
