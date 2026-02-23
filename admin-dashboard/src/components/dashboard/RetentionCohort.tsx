'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { startOfWeek, subWeeks, format } from 'date-fns';

interface CohortData {
  date: string;
  users: number;
  retention: number[];
}

export function RetentionCohort() {
  // Mock data generation for demonstration
  const [cohorts, setCohorts] = useState<CohortData[]>([]);

  useEffect(() => {
    const data = Array.from({ length: 5 }).map((_, i) => {
      const date = subWeeks(startOfWeek(new Date()), i);
      const userCount = Math.floor(Math.random() * 50) + 20;
      const retentionData = [
        100,
        ...Array.from({ length: 5 }).map((_, j) => {
          // Decrease retention over time
          return Math.max(
            0,
            Math.floor(100 - (j + 1) * (10 + Math.random() * 10))
          );
        }),
      ].slice(0, 6 - i); // Show varied lengths

      return {
        date: format(date, 'MMM d'),
        users: userCount,
        retention: retentionData,
      };
    });
    // Simulate async data fetch
    const timer = setTimeout(() => {
      setCohorts(data);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>User Retention Cohort</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cohort</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Week 0</TableHead>
              <TableHead>Week 1</TableHead>
              <TableHead>Week 2</TableHead>
              <TableHead>Week 3</TableHead>
              <TableHead>Week 4</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cohorts.map((cohort) => (
              <TableRow key={cohort.date}>
                <TableCell className="font-medium">{cohort.date}</TableCell>
                <TableCell>{cohort.users}</TableCell>
                {cohort.retention.map((pct, i) => (
                  <TableCell key={i} className={getRetentionColor(pct)}>
                    {pct}%
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

function getRetentionColor(percentage: number) {
  if (percentage >= 80) return 'bg-green-900 text-green-100';
  if (percentage >= 50) return 'bg-blue-900 text-blue-100';
  if (percentage >= 20) return 'bg-yellow-900 text-yellow-100';
  return 'bg-red-900 text-red-100';
}
