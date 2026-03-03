'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

interface DecodedToken {
  exp: number;
  sub: string;
  email: string;
}

// Refresh 2 minutes before the access token expires — mirrors the web-app constant.
const REFRESH_THRESHOLD = 2 * 60 * 1000;

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  /** Starts as `true` so ProtectedRoute blocks rendering until the first token
   *  validation completes.  Mirrors the web-app useAuthStore behaviour. */
  isLoading: boolean;
  error: string | null;

  setAuth: (
    user: User,
    accessToken: string,
    refreshToken: string,
    isAdmin: boolean
  ) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  /** Tries to get a fresh access token using the stored refresh token.
   *  Returns the new access token on success, or `null` on failure.
   *  Calls logout() automatically on 401/403 so callers just check for null. */
  refreshAccessToken: () => Promise<string | null>;
  /** Called once on app mount.  Validates the stored access token, proactively
   *  refreshes it if it is near expiry, and logs the user out if it is
   *  irrecoverably invalid.  Sets isLoading to false when done. */
  checkAuthStatus: () => Promise<void>;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isAdmin: false,
      // Must be `true` so ProtectedRoute gates content until checkAuthStatus()
      // resolves. Without this the component would render with stale
      // localStorage data before we have a chance to validate the tokens.
      isLoading: true,
      error: null,

      setAuth: (user, accessToken, refreshToken, isAdmin) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isAdmin,
          isLoading: false,
          error: null,
        }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
          error: null,
        });
        // Belt-and-suspenders: also wipe localStorage directly so that the
        // Zustand persist rehydration cannot resurrect stale tokens.
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return null;

        try {
          // Use a raw axios instance — NOT the apiClient — to avoid triggering
          // the response interceptor and creating an infinite retry loop.
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const data = response.data;
          // data shape: AuthResponseDto { accessToken, refreshToken, user, isAdmin }

          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: data.user,
            isAdmin: data.isAdmin,
            isAuthenticated: true,
          });

          return data.accessToken as string;
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            const status = error.response.status;
            if (status === 401 || status === 403) {
              // Expected: refresh token expired or revoked (e.g. Redis was
              // wiped on restart).  Silently clear the session.
              get().logout();
              return null;
            }
          }
          // Unexpected error (network, 5xx).  Still logout to keep the app in a
          // consistent state rather than leaving a half-authenticated ghost.
          console.error('Unexpected error during token refresh:', error);
          get().logout();
          return null;
        }
      },

      checkAuthStatus: async () => {
        set({ isLoading: true });
        const { accessToken, refreshToken, refreshAccessToken, logout } = get();

        // No tokens at all — nothing to validate.
        if (!accessToken || !refreshToken) {
          set({ isAuthenticated: false, isLoading: false });
          return;
        }

        try {
          const decoded: DecodedToken = jwtDecode(accessToken);
          const currentTime = Date.now();
          const timeLeft = decoded.exp * 1000 - currentTime;

          if (timeLeft < REFRESH_THRESHOLD) {
            // Token is expired or about to expire — try to exchange it now.
            // refreshAccessToken() handles state updates and logout internally.
            await refreshAccessToken();
          } else {
            // Token is still comfortably valid; trust it.
            set({ isAuthenticated: true });
          }
        } catch {
          // jwtDecode threw — the stored token string is malformed.
          logout();
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // `isLoading` is intentionally excluded from persistence.  We always
      // want it to start as `true` (from the in-memory default above) so that
      // the app blocks protected content until checkAuthStatus() runs, even
      // after a hard reload from a warm localStorage.
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
