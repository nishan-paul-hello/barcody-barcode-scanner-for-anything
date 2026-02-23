'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUIStore } from '@/store/useUIStore';

function AuthRedirectHandlerContent() {
  const searchParams = useSearchParams();
  const { openLoginModal } = useUIStore();

  useEffect(() => {
    if (searchParams.get('login') === 'true') {
      openLoginModal();
    }
  }, [searchParams, openLoginModal]);

  return null;
}

export function AuthRedirectHandler() {
  return (
    <Suspense fallback={null}>
      <AuthRedirectHandlerContent />
    </Suspense>
  );
}
