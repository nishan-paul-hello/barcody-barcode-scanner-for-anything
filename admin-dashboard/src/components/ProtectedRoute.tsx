'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Skeleton } from '@/components/ui/skeleton';

import { useUIStore } from '@/stores/uiStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuthStore();
  const { openLoginModal } = useUIStore();

  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.push('/');
        openLoginModal(pathname);
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, openLoginModal, router, pathname]);

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex flex-col space-y-3 p-8">
        <Skeleton className="h-[125px] w-[250px] rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
