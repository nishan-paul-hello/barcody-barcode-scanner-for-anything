'use client';

import { useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export const LoginModal = () => {
  const { isLoginModalOpen, closeLoginModal } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

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
      <DialogContent className="max-w-md overflow-hidden border-white/5 bg-[#0a0a0a]/95 p-0 backdrop-blur-2xl sm:rounded-[2.5rem]">
        <div className="relative p-8 pt-12">
          {/* Animated Background Decoration */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-[80px]" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/10 blur-[80px]" />
          </div>

          <DialogHeader className="mb-8 items-center text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="relative mb-6 h-20 w-20"
            >
              <div className="absolute inset-0 animate-pulse rounded-2xl bg-cyan-500/20 blur-xl" />
              <div className="relative flex h-full w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <Image
                  src="/brand-logo.svg"
                  alt="Barcody Logo"
                  width={80}
                  height={80}
                  className="h-full w-full object-contain"
                />
              </div>
            </motion.div>

            <DialogTitle className="text-center text-3xl font-black tracking-tight text-white md:text-4xl">
              Welcome Back
            </DialogTitle>
            <DialogDescription className="mt-2 text-center text-lg text-white/50">
              Sign in to Barcody to sync your <br /> scanner data across
              devices.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center space-y-6">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center justify-center space-y-4 py-8"
                >
                  <div className="relative h-12 w-12">
                    <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
                    <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-cyan-400/20" />
                  </div>
                  <p className="text-sm font-bold tracking-widest text-cyan-400/80 uppercase">
                    Establishing Secure Session
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="login-btn"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full space-y-4"
                >
                  <div className="flex w-full justify-center rounded-2xl border border-white/5 bg-white/5 p-1 backdrop-blur-sm">
                    <GoogleLogin
                      onSuccess={handleSuccess}
                      onError={handleError}
                      theme="filled_black"
                      shape="pill"
                      size="large"
                      width="100%"
                      text="continue_with"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
