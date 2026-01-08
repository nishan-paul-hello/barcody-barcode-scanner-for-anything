'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthInitializer() {
  const initialized = useRef(false);
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  useEffect(() => {
    if (!initialized.current) {
      checkAuthStatus();
      initialized.current = true;
    }
  }, [checkAuthStatus]);

  return null;
}
