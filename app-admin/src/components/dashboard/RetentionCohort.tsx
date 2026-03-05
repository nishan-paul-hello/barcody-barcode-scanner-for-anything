'use client';

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

  const cohorts: CohortRow[] = data?.cohorts ?? [];

  // Determine the maximum number of retention weeks shown across all cohorts
  const maxWeeks = cohorts.reduce(
    (max, c) => Math.max(max, c.retention.length),
    0
  );

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
              {Array.from({ length: maxWeeks }).map((_, i) => (
                <TableHead key={i}>Week {i}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {cohorts.map((cohort) => (
              <TableRow key={cohort.weekStart}>
                <TableCell className="font-medium">
                  {format(new Date(cohort.weekStart), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>{cohort.newUsers}</TableCell>
                {Array.from({ length: maxWeeks }).map((_, i) => {
                  const pct = cohort.retention[i];
                  if (pct === undefined) {
                    return (
                      <TableCell
                        key={i}
                        className="text-muted-foreground text-xs"
                      >
                        —
                      </TableCell>
                    );
                  }
                  return (
                    <TableCell key={i} className={getRetentionColor(pct)}>
                      {pct}%
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
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
