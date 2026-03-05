'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuthStore();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !isAdmin) {
        if (
          typeof window !== 'undefined' &&
          sessionStorage.getItem('is_logout_redirect')
        ) {
          sessionStorage.removeItem('is_logout_redirect');
          router.replace('/');
          return;
        }

        const currentUrl =
          pathname +
          (searchParams.toString() ? `?${searchParams.toString()}` : '');
        const redirectPath = `/?login=true&redirect=${encodeURIComponent(currentUrl)}`;

        router.push(redirectPath);
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router, pathname, searchParams]);

  if (isLoading || !isAuthenticated || !isAdmin) {
    return null;
  }

  return children;
}
