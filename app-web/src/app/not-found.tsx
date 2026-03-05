'use client';

import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    document.title = 'Barcody - Not Found';
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#050505] text-white selection:bg-cyan-500/30">
      {/* Background Ambient Orbs - Matching Landing Page */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[10%] -left-[10%] size-1/2 rounded-full bg-cyan-500/10 blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[20%] -right-[10%] size-[40%] rounded-full bg-blue-600/10 blur-[120px]"
        />
        <div className="pointer-events-none absolute top-1/2 left-1/2 size-full -translate-x-1/2 -translate-y-1/2 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="max-w-2xl space-y-4"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            PAGE <span className="text-cyan-400">NOT FOUND</span>
          </h2>
          <p className="bg-gradient-to-b from-white/60 to-white/20 bg-clip-text text-lg leading-relaxed font-medium tracking-tight text-transparent">
            The page you are looking for doesn&apos;t exist or has been moved to
            a new location.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-12 flex flex-col gap-4 sm:flex-row"
        >
          <button
            type="button"
            onClick={() => router.push('/')}
            className="group flex cursor-pointer items-center gap-2 rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-black transition-all hover:bg-cyan-400 active:scale-95"
          >
            <Home className="size-5 transition-transform group-hover:-translate-y-0.5" />
            Home
          </button>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="group flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-bold text-white transition-all hover:bg-white/10 active:scale-95"
          >
            Go Back
          </button>
        </motion.div>
      </div>

      {/* Noise Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
    </div>
  );
}
