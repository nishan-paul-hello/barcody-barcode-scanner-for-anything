'use client';

import { Header } from '@/components/dashboard/header';
import { Footer } from '@/components/dashboard/footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

/**
 * Thin client wrapper for the dashboard shell.
 * Keeps 'use client' out of the layout.tsx so the layout itself is an RSC.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <div className="relative flex min-h-screen flex-col bg-[#040405] text-white selection:bg-[#00ffe7]/30 selection:text-[#00ffe7]">
      {/* Premium Background System - Consistent across all pages */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Soft Ambient Core - prevents 'too dark' feeling in empty zones */}
        <div className="absolute top-1/2 left-1/2 h-[120vw] w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.02)_0%,transparent_70%)]" />

        {/* Animated Background Orbs - Distributed for uniform brightness */}
        <motion.div
          animate={{
            x: [0, 150, 0],
            y: [0, 100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[10%] -left-[10%] h-[70%] w-[70%] rounded-full bg-cyan-500/15 blur-[160px]"
        />
        <motion.div
          animate={{
            x: [0, -120, 0],
            y: [0, 150, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[15%] -right-[15%] h-[60%] w-[60%] rounded-full bg-emerald-500/12 blur-[160px]"
        />
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -80, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute right-[10%] -bottom-[15%] h-[55%] w-[55%] rounded-full bg-blue-500/10 blur-[160px]"
        />

        {/* Noise overlay */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.2] brightness-125 contrast-125" />

        {/* Strategic Vignette - subtle anchoring */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col">
        <Header />
        <div className="flex flex-1 flex-col">
          <main
            className={
              isHomePage
                ? 'flex-1 pt-12'
                : 'container mx-auto flex-1 px-4 pt-12 pb-8 sm:px-6 lg:px-8'
            }
          >
            {isHomePage ? (
              children
            ) : (
              <ProtectedRoute>{children}</ProtectedRoute>
            )}
          </main>
          {isHomePage && <Footer />}
        </div>
      </div>
    </div>
  );
}
