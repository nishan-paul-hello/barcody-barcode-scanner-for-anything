'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

export const LoginModal = () => {
  const { isLoginModalOpen, closeLoginModal, pendingRedirectPath } =
    useUIStore();
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth, user, setError, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && isLoginModalOpen) {
      closeLoginModal();
    }
  }, [isAuthenticated, isLoginModalOpen, closeLoginModal]);

  const [isSuggestedDismissed, setIsSuggestedDismissed] = useState(false);

  const MIN_SPINNER_MS = 500;

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    const spinnerStartedAt = Date.now();
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      const data = await authApi.loginWithGoogle(credentialResponse.credential);

      if (!data.isAdmin) {
        setError(
          'Access denied. You must be an administrator to access this area.'
        );
        return;
      }

      setAuth(data.user, data.accessToken, data.refreshToken, data.isAdmin);

      if (pendingRedirectPath) {
        router.push(pendingRedirectPath);
      } else if (window.location.search.includes('login=true')) {
        router.replace(window.location.pathname);
      }

      closeLoginModal();
    } catch (error: unknown) {
      console.error('Login Error:', error);
      setError('Login failed. Please try again.');
    } finally {
      const elapsed = Date.now() - spinnerStartedAt;
      const remaining = Math.max(0, MIN_SPINNER_MS - elapsed);
      if (remaining > 0) {
        await new Promise((r) => setTimeout(r, remaining));
      }
      setIsLoading(false);
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Google authentication failed.');
  };

  return (
    <Dialog open={isLoginModalOpen} onOpenChange={closeLoginModal}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[420px] border-none bg-[#1a1a1a] p-0 text-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] sm:rounded-[2.5rem]"
      >
        <div className="relative flex flex-col items-center px-10 pt-16 pb-12">
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeLoginModal();
            }}
            className="absolute top-8 right-8 z-[100] cursor-pointer p-2 text-white/40 transition-all hover:scale-110 hover:text-white active:scale-90"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <div className="mb-10 text-center">
            <DialogTitle className="mb-2 text-[2.25rem] leading-tight font-medium tracking-tight text-white focus:outline-none">
              Admin Login
            </DialogTitle>
            <p className="text-base font-light tracking-wide whitespace-nowrap text-white/50">
              {isSuggestedDismissed
                ? 'Sign in to manage the platform'
                : 'Management Panel and Analytics'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex w-full flex-col items-center justify-center py-12"
              >
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                  <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-white" />
                </div>
                <p className="mt-6 text-xs font-semibold tracking-[0.2em] text-white/30 uppercase">
                  Authenticating
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={isSuggestedDismissed ? 'simple' : 'suggested'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full"
              >
                {!isSuggestedDismissed && user ? (
                  <>
                    {/* Account Item */}
                    <div className="group relative flex h-[104px] w-full items-center overflow-hidden rounded-[2rem] border-[1.5px] border-white bg-white/5 transition-all hover:bg-white/10">
                      {/* Google Login Overlay (z-20) */}
                      <div className="absolute inset-0 z-20 flex scale-[8] cursor-pointer items-center justify-center opacity-[0.001] mix-blend-multiply">
                        <GoogleLogin
                          onSuccess={handleSuccess}
                          onError={handleError}
                          width="400"
                        />
                      </div>

                      {/* Visual Content (z-10) */}
                      <div className="pointer-events-none relative z-10 flex w-full items-center px-6 select-none">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#3b82f6] text-xl font-medium text-white shadow-lg">
                          {user?.name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('') || 'AD'}
                        </div>
                        <div className="ml-5 flex-1 overflow-hidden text-left">
                          <h3 className="text-base font-medium tracking-tight text-white">
                            {user?.name || 'Administrator'}
                          </h3>
                          <p className="truncate text-sm font-light text-white/40">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      {/* Intercepting Dismiss Button (z-[100]) */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsSuggestedDismissed(true);
                        }}
                        className="absolute right-6 z-[100] cursor-pointer p-3 text-white/30 transition-all hover:scale-110 hover:text-white active:scale-90"
                        aria-label="Dismiss"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="pointer-events-none flex items-center gap-6 py-10">
                      <div className="h-[1.5px] flex-1 bg-white/20 shadow-[0_0_8px_rgba(255,255,255,0.1)]" />
                      <span className="text-[11px] font-black tracking-[0.4em] text-white/40 uppercase">
                        OR
                      </span>
                      <div className="h-[1.5px] flex-1 bg-white/20 shadow-[0_0_8px_rgba(255,255,255,0.1)]" />
                    </div>

                    {/* Use a different account */}
                    <div className="group relative w-full cursor-pointer overflow-hidden rounded-full border border-white/20 bg-white/[0.05] transition-all hover:bg-white/[0.1] active:scale-[0.98]">
                      <div className="absolute inset-0 z-20 flex scale-[8] cursor-pointer items-center justify-center opacity-[0.001] mix-blend-multiply">
                        <GoogleLogin
                          onSuccess={handleSuccess}
                          onError={handleError}
                          width="400"
                        />
                      </div>
                      <div className="pointer-events-none relative z-10 flex h-16 w-full items-center justify-center gap-3 select-none">
                        <svg width="20" height="20" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        <span className="text-base font-medium tracking-tight text-white">
                          Use a different admin account
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Continue with Google (Simple View) */
                  <div className="group relative w-full cursor-pointer overflow-hidden rounded-full border border-white/20 bg-white/[0.05] transition-all hover:bg-white/[0.1] active:scale-[0.98]">
                    <div className="absolute inset-0 z-20 flex scale-[8] cursor-pointer items-center justify-center opacity-[0.001] mix-blend-multiply">
                      <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={handleError}
                        width="400"
                      />
                    </div>
                    <div className="pointer-events-none relative z-10 flex h-16 w-full items-center justify-center gap-3 select-none">
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span className="text-base font-medium tracking-tight text-white/90">
                        Continue with Google
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
