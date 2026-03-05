'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

function AuthRedirectHandlerContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { openLoginModal } = useUIStore();
  const { isAuthenticated, isAdmin, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (searchParams.get('login') === 'true') {
      const redirect = searchParams.get('redirect');

      if (isAuthenticated && isAdmin) {
        if (redirect) {
          router.replace(redirect);
        } else {
          router.replace(pathname);
        }
      } else {
        openLoginModal(redirect || undefined);
      }
    }
  }, [
    searchParams,
    pathname,
    openLoginModal,
    isAuthenticated,
    isAdmin,
    isLoading,
    router,
  ]);

  return null;
}

export function AuthRedirectHandler() {
  return (
    <Suspense fallback={null}>
      <AuthRedirectHandlerContent />
    </Suspense>
  );
}
