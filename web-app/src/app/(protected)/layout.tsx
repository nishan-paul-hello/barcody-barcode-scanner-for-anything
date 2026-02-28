'use client';

import { Suspense } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Header } from '@/components/common/Header';
import { motion } from 'framer-motion';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <ProtectedRoute>
        <div className="relative flex min-h-screen flex-col bg-[#050505] text-white selection:bg-cyan-500/30">
          <Header />
          <main className="relative z-10 flex-1">{children}</main>

          {/* Animated Background Orbs */}
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <motion.div
              animate={{
                x: [0, 100, 0],
                y: [0, 50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-cyan-500/10 blur-[120px]"
            />
            <motion.div
              animate={{
                x: [0, -80, 0],
                y: [0, 100, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute top-[20%] -right-[10%] h-[40%] w-[40%] rounded-full bg-blue-600/10 blur-[120px]"
            />
            <div className="pointer-events-none absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
          </div>
        </div>
      </ProtectedRoute>
    </Suspense>
  );
}
