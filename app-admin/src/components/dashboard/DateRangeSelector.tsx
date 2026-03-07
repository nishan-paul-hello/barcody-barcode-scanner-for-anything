'use client';

import * as React from 'react';
import { subDays, format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface checkDateRangeSelectorProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function DateRangeSelector({
  dateRange,
  onDateRangeChange,
}: checkDateRangeSelectorProps) {
  const [selectedPreset, setSelectedPreset] = React.useState<string>('30');

  const handlePresetChange = React.useCallback(
    (value: string) => {
      setSelectedPreset(value);
      const today = new Date();
      const days = parseInt(value, 10);

      if (!isNaN(days)) {
        onDateRangeChange({
          from: subDays(today, days),
          to: today,
        });
      }
    },
    [onDateRangeChange]
  );

  React.useEffect(() => {
    if (!dateRange && selectedPreset) {
      handlePresetChange(selectedPreset);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center gap-2">
      <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">Last 7 days</SelectItem>
          <SelectItem value="30">Last 30 days</SelectItem>
          <SelectItem value="90">Last 90 days</SelectItem>
        </SelectContent>
      </Select>
      {dateRange?.from && dateRange?.to && (
        <span className="text-muted-foreground ml-2 text-sm">
          {format(dateRange.from, 'MMM d')} -{' '}
          {format(dateRange.to, 'MMM d, yyyy')}
        </span>
      )}
    </div>
  );
}
