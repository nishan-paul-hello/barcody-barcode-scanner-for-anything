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

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Key must exactly match the 'name' given in useAuthStore persist configuration
      if (event.key === 'auth-storage') {
        if (
          !event.newValue ||
          !event.newValue.includes('"isAuthenticated":true')
        ) {
          sessionStorage.setItem('is_logout_redirect', 'true');
        }

        // Force the store to re-read from localStorage and sync state
        // This will update isAuthenticated across all open tabs
        useAuthStore.persist.rehydrate();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return null;
}
