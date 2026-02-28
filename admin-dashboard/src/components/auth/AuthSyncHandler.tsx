'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * Handles cross-tab authentication synchronization.
 * Listens for storage events and rehydrates the auth store.
 */
export function AuthSyncHandler() {
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Key must exactly match the 'name' given in useAuthStore persist configuration
      if (event.key === 'auth-storage') {
        // Re-sync the store with the new data from localStorage
        useAuthStore.persist.rehydrate();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return null;
}
