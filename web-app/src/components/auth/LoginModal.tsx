'use client';

import { useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LoginModal = () => {
  const { isLoginModalOpen, closeLoginModal } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuthStore();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      const { accessToken, refreshToken, user } = await api.auth.login({
        token: credentialResponse.credential,
      });

      login(user, accessToken, refreshToken);
      closeLoginModal();
    } catch (error: unknown) {
      console.error('Login Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    setIsLoading(false);
  };

  return (
    <Dialog open={isLoginModalOpen} onOpenChange={closeLoginModal}>
      <DialogContent className="max-w-[420px] border-none bg-[#1a1a1a] p-0 text-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] sm:rounded-[2.5rem]">
        <div className="relative flex flex-col items-center px-10 pt-16 pb-12">
          {/* Close Button */}
          <button
            onClick={closeLoginModal}
            className="absolute top-8 right-8 text-white/40 transition-all hover:scale-110 hover:text-white active:scale-90"
          >
            <X size={20} />
          </button>

          <div className="mb-10 text-center">
            <DialogTitle className="mb-2 text-[2.25rem] leading-tight font-medium tracking-tight text-white">
              Log back in
            </DialogTitle>
            <p className="text-base font-light tracking-wide text-white/50">
              Choose an account to continue.
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
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                {/* Account Item */}
                <div className="group relative flex w-full cursor-pointer items-center overflow-hidden rounded-[2rem] border-[1.5px] border-white bg-white/5 p-6 transition-all hover:bg-white/10">
                  <div className="absolute inset-0 z-20 flex scale-[5] items-center justify-center opacity-[0.01]">
                    <GoogleLogin
                      onSuccess={handleSuccess}
                      onError={handleError}
                      width="400"
                    />
                  </div>
                  <div className="pointer-events-none relative z-10 flex w-full items-center">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#9c27b0] text-xl font-medium text-white shadow-lg">
                      {user?.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('') || 'NP'}
                    </div>
                    <div className="ml-5 flex-1 overflow-hidden text-left">
                      <h3 className="text-base font-medium tracking-tight text-white">
                        {user?.name || 'Nishan Paul'}
                      </h3>
                      <p className="truncate text-sm font-light text-white/40">
                        {user?.email || 'nishanpaul12011996se@gmail.com'}
                      </p>
                    </div>
                    <div className="ml-2 p-1 text-white/30">
                      <X size={18} />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="pointer-events-none flex items-center gap-6 py-10">
                  <div className="h-[1px] flex-1 bg-white/[0.08]" />
                  <span className="text-[10px] font-bold tracking-[0.3em] text-white/20 uppercase">
                    OR
                  </span>
                  <div className="h-[1px] flex-1 bg-white/[0.08]" />
                </div>

                {/* Google Login Button disguised as "Log in to another account" */}
                <div className="group relative w-full cursor-pointer overflow-hidden rounded-full border border-white/10 bg-white/[0.03] transition-all hover:bg-white/[0.08] active:scale-[0.98]">
                  <div className="absolute inset-0 z-20 flex scale-[5] items-center justify-center opacity-[0.01]">
                    <GoogleLogin
                      onSuccess={handleSuccess}
                      onError={handleError}
                      width="400"
                    />
                  </div>
                  <div className="pointer-events-none relative z-10 flex h-16 w-full items-center justify-center">
                    <span className="text-base font-medium tracking-tight text-white/90">
                      Log in to another account
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
