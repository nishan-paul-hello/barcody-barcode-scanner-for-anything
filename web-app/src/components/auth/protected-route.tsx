'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingScreen } from '@/components/common/loading';
import { ErrorBoundary } from '@/components/common/error-boundary';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuthStore();

  useEffect(() => {
    // Re-check auth status on mount/navigation if not already authenticated
    if (!isAuthenticated && !isLoading) {
      checkAuthStatus();
    }
  }, [isAuthenticated, isLoading, checkAuthStatus]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Capture current URL including query params
      const currentUrl =
        pathname +
        (searchParams.toString() ? `?${searchParams.toString()}` : '');
      const redirectPath = `/login?redirect=${encodeURIComponent(currentUrl)}`;

      router.push(redirectPath);
    }
  }, [isLoading, isAuthenticated, pathname, searchParams, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // Return null while redirecting to avoid flashing protected content
    return null;
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
}
