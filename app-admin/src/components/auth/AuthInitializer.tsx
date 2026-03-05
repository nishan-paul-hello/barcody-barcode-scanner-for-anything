'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * AuthInitializer — admin dashboard equivalent of the web-app's
 * `<AuthInitializer />`.
 *
 * Responsibilities
 * ─────────────────
 * 1. On mount, call `checkAuthStatus()` exactly once.
 *    This validates the JWT stored in localStorage against the REFRESH_THRESHOLD,
 *    proactively refreshes if near expiry, and — crucially — calls `logout()` if
 *    the refresh token has been revoked (e.g. Redis was wiped on server restart).
 *    Until this promise resolves, `isLoading` stays `true`, so `ProtectedRoute`
 *    blocks all content rendering.
 *
 * 2. Listen for storage events from other tabs.
 *    If a sibling tab logs out, the `auth-storage` key changes in localStorage
 *    and we immediately rehydrate the Zustand store so this tab reflects the
 *    logged-out state without requiring a page refresh.
 */
export function AuthInitializer() {
  const initialized = useRef(false);
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  // ── 1. One-time startup token validation ──────────────────────────────────
  useEffect(() => {
    if (!initialized.current) {
      void checkAuthStatus();
      initialized.current = true;
    }
  }, [checkAuthStatus]);

  // ── 2. Cross-tab synchronisation ──────────────────────────────────────────
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Only react to changes on the key managed by our Zustand persist store.
      if (event.key !== 'auth-storage') {
        return;
      }

      // If the new value no longer contains `"isAuthenticated":true`, the user
      // logged out in another tab.  Flag sessionStorage so ProtectedRoute can
      // do a quiet redirect to '/' instead of opening the login modal.
      if (!event.newValue?.includes('"isAuthenticated":true')) {
        sessionStorage.setItem('is_logout_redirect', 'true');
      }

      // Force the store to re-read from localStorage and sync in-memory state.
      void useAuthStore.persist.rehydrate();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return null;
}
