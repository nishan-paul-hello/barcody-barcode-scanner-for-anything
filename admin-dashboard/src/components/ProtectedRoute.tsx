'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

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
        if (
          typeof window !== 'undefined' &&
          sessionStorage.getItem('is_logout_redirect')
        ) {
          sessionStorage.removeItem('is_logout_redirect');
          router.replace('/');
          return;
        }
        router.push('/');
        openLoginModal(pathname);
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, openLoginModal, router, pathname]);

  if (isLoading || !isAuthenticated || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
