import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthStore, User } from '@/types/auth'; // @ alias assumes path mapping in tsconfig
import type { AuthResponseDto } from '@/lib/api/types';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface DecodedToken {
  exp: number;
  sub: string;
  email: string;
}

const REFRESH_THRESHOLD = 2 * 60 * 1000; // 2 minutes

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true, // Init as loading until rehydration/check

      login: (user: User, accessToken: string, refreshToken: string) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
        // Schedule refresh logic could go here, but checkAuthStatus handles it on load.
        // For runtime, we might want a timeout.
        // For now, rely on axios interceptor 401 and manual check.
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
        // Clear storage happens via persist, but we also manually reset state.
        // Also optional: call logout API.
        try {
          // Fire and forget logout to backend if needed, but usually frontend just clears token
          // If we have a token, we could try to let backend know
          const token = get().accessToken;
          if (token) {
            // We use a clean axios instance to avoid interceptor loops if token is bad
            axios
              .post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
                {},
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              )
              .catch(() => {
                /* user doesn't care if this fails */
              });
          }
        } catch {
          // ignore
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          return null;
        }

        try {
          // Use raw axios to avoid interceptor loop
          const response = await axios.post<AuthResponseDto>(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {
              refreshToken,
            }
          );

          const data = response.data;
          // data is AuthResponseDto { accessToken, refreshToken, user }

          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken, // Update if rotated
            user: data.user, // Update user in case profile changed
            isAuthenticated: true,
          });

          return data.accessToken;
        } catch (error) {
          // Check if it's an expected auth error (401/403) vs network error
          if (axios.isAxiosError(error) && error.response) {
            const status = error.response.status;
            if (status === 401 || status === 403) {
              // Expected: refresh token expired or invalid - silently logout
              // This is normal behavior when a user's session has expired
              get().logout();
              return null;
            }
          }
          // Unexpected error (network, 5xx, etc.) - log it
          console.error('Unexpected error during token refresh:', error);
          get().logout();
          return null;
        }
      },

      checkAuthStatus: async () => {
        set({ isLoading: true });
        const { accessToken, refreshToken, refreshAccessToken, logout } = get();

        if (!accessToken || !refreshToken) {
          set({ isAuthenticated: false, isLoading: false });
          return;
        }

        try {
          const decoded: DecodedToken = jwtDecode(accessToken);
          const currentTime = Date.now();
          const timeLeft = decoded.exp * 1000 - currentTime;

          if (timeLeft < REFRESH_THRESHOLD) {
            // Token expired or about to expire - try to refresh
            const newToken = await refreshAccessToken();
            if (!newToken) {
              // Refresh failed - user will be logged out by refreshAccessToken
              // No need to do anything here, state is already updated
            }
          } else {
            // Token still valid
            set({ isAuthenticated: true });
          }
        } catch {
          // Invalid token format or decode error - clear session
          logout();
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }), // Persist these fields only
    }
  )
);
