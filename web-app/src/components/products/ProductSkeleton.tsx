'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Product Hero Skeleton */}
      <Card className="overflow-hidden border-white/5 bg-white/[0.02]">
        <div className="flex flex-col md:flex-row">
          <Skeleton className="h-64 w-full rounded-none bg-white/5 md:w-64" />
          <div className="flex-1 space-y-4 p-6">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 bg-white/5" />
                <Skeleton className="h-5 w-32 bg-white/5" />
              </div>
              <Skeleton className="h-8 w-3/4 bg-white/5" />
              <Skeleton className="h-6 w-1/2 bg-white/5" />
            </div>
            <div className="flex gap-4 pt-2">
              <Skeleton className="h-4 w-24 bg-white/5" />
              <Skeleton className="h-4 w-32 bg-white/5" />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Nutrition Skeleton */}
        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader>
            <Skeleton className="h-6 w-40 bg-white/5" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 bg-white/5" />
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-8 w-8 rounded-md bg-white/5"
                    />
                  ))}
                </div>
              </div>
              <Skeleton className="h-10 w-16 bg-white/5" />
            </div>
            <div className="space-y-4 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-20 bg-white/5" />
                    <Skeleton className="h-3 w-8 bg-white/5" />
                  </div>
                  <Skeleton className="h-1.5 w-full bg-white/5" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-16 w-full rounded-xl bg-white/5"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Allergen Skeleton */}
        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader>
            <Skeleton className="h-6 w-40 bg-white/5" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-4 w-full bg-white/5" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  className="h-12 w-full rounded-xl bg-white/5"
                />
              ))}
            </div>
            <div className="space-y-2 pt-4">
              <Skeleton className="h-3 w-24 bg-white/5" />
              <Skeleton className="h-12 w-full bg-white/5" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
