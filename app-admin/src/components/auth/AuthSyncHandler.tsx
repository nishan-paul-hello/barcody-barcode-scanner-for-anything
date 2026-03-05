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
        // If the new storage state indicates a logout occurred in another tab,
        // we flag it in this tab's session storage before rehydrating.
        // This tells ProtectedRoute to quietly redirect to '/' instead of opening the login modal.
        if (!event.newValue?.includes('"isAuthenticated":true')) {
          sessionStorage.setItem('is_logout_redirect', 'true');
        }

        // Re-sync the store with the new data from localStorage
        void useAuthStore.persist.rehydrate();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return null;
}
