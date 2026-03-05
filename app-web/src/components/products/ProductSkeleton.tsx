'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Hero: image + title block */}
      <Card className="overflow-hidden rounded-[2.5rem] border-white/5 bg-black/40">
        <div className="flex flex-col md:flex-row">
          <Skeleton className="aspect-square w-full rounded-none bg-white/5 md:w-80" />
          <div className="flex flex-1 flex-col justify-center space-y-4 p-8 md:p-10">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-16 rounded-full bg-white/5" />
              <Skeleton className="h-5 w-24 rounded-full bg-white/5" />
            </div>
            <Skeleton className="h-8 w-3/4 bg-white/5" />
            <Skeleton className="h-5 w-1/2 bg-white/5" />
            <div className="flex gap-5 pt-4">
              <Skeleton className="h-4 w-28 bg-white/5" />
              <Skeleton className="h-4 w-24 bg-white/5" />
            </div>
          </div>
        </div>
      </Card>

      {/* Optional content blocks (generic) */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="rounded-[2.5rem] border-white/5 bg-black/40">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full bg-white/5" />
              <Skeleton className="h-5 w-32 bg-white/5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full bg-white/5" />
            <Skeleton className="h-4 w-4/5 bg-white/5" />
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-14 w-full rounded-2xl bg-white/5"
                />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[2.5rem] border-white/5 bg-black/40">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full bg-white/5" />
              <Skeleton className="h-5 w-36 bg-white/5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full rounded-2xl bg-white/5" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  className="h-20 w-full rounded-2xl bg-white/5"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
