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
    <div className="relative flex min-h-screen flex-col bg-[#0d0d0d] text-zinc-100 selection:bg-white/10 selection:text-white">
      {/* ChatGPT-inspired Minimal Background System */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Soft Ambient Core - prevents 'dead' black feel */}
        <div className="absolute top-1/2 left-1/2 h-[100vw] w-[100vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.015)_0%,transparent_70%)]" />

        {/* Very Subtle Neutral Glows - Top Left */}
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[15%] -left-[10%] h-[60%] w-[60%] rounded-full bg-white/[0.03] blur-[140px]"
        />

        {/* Very Subtle Neutral Glows - Bottom Right */}
        <motion.div
          animate={{
            x: [0, -60, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -right-[10%] -bottom-[15%] h-[50%] w-[50%] rounded-full bg-slate-500/[0.02] blur-[140px]"
        />

        {/* Premium Noise Overlay for Texture */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay brightness-125 contrast-125" />
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
