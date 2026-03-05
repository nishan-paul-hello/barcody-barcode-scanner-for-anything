import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { LoadingScreen as ModernLoadingScreen } from './loading-screen';

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <Loader2 className={`text-primary h-8 w-8 animate-spin ${className}`} />
  );
}

export function LoadingScreen() {
  return <ModernLoadingScreen />;
}

export function PageSkeleton() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {['sr1', 'sr2', 'sr3', 'sr4', 'sr5'].map((id) => (
          <Skeleton key={id} className="h-32 w-full" />
        ))}
      </div>
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
