'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useRetentionCohorts } from '@/hooks/useAnalytics';
import { format } from 'date-fns';

interface CohortRow {
  weekStart: string;
  newUsers: number;
  retention: number[];
}

export function RetentionCohort() {
  const { data, isLoading } = useRetentionCohorts();

  const cohorts: CohortRow[] = useMemo(() => data?.cohorts ?? [], [data]);

  // Determine the maximum number of retention weeks shown across all cohorts
  const maxWeeks = cohorts.reduce(
    (max, c) => Math.max(max, c.retention.length),
    0
  );

  const entries = useMemo(() => {
    return cohorts.map((c) => ({
      ...c,
      items: c.retention.map((pct, i) => ({
        pct,
        id: `week-${i}`,
      })),
      emptyWeeks: Array.from(
        { length: Math.max(0, maxWeeks - c.retention.length) },
        (_, i) => `empty-${i + c.retention.length}`
      ),
    }));
  }, [cohorts, maxWeeks]);

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <Skeleton className="h-6 w-[180px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (cohorts.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>User Retention Cohort</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No cohort data yet. Data will appear once users have scan activity
            across multiple weeks.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>User Retention Cohort</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cohort (week of)</TableHead>
              <TableHead>New Users</TableHead>
              {Array.from({ length: maxWeeks }, (_, i) => i).map((weekNum) => (
                <TableHead key={`week-header-${weekNum}`}>
                  Week {weekNum}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((cohort: (typeof entries)[number]) => (
              <TableRow key={cohort.weekStart}>
                <TableCell className="font-medium">
                  {format(new Date(cohort.weekStart), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>{cohort.newUsers}</TableCell>
                {cohort.items.map((item: { pct: number; id: string }) => (
                  <RetentionCell
                    key={`${cohort.weekStart}-${item.id}`}
                    pct={item.pct}
                  />
                ))}
                {cohort.emptyWeeks.map((emptyId: string) => (
                  <TableCell
                    key={`${cohort.weekStart}-${emptyId}`}
                    className="text-muted-foreground text-xs"
                  >
                    —
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function RetentionCell({ pct }: { pct: number }) {
  const color = getRetentionColor(pct);
  return <TableCell className={color}>{pct}%</TableCell>;
}

function getRetentionColor(percentage: number): string {
  if (percentage >= 80) {
    return 'bg-green-900 text-green-100';
  }
  if (percentage >= 50) {
    return 'bg-blue-900 text-blue-100';
  }
  if (percentage >= 20) {
    return 'bg-yellow-900 text-yellow-100';
  }
  return 'bg-red-900 text-red-100';
}
