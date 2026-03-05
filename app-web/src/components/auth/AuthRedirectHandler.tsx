'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';

function AuthRedirectHandlerContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { openLoginModal } = useUIStore();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (searchParams.get('login') === 'true') {
      const redirect = searchParams.get('redirect');

      if (isAuthenticated) {
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
