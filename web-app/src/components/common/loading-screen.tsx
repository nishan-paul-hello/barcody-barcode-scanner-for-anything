'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#050505] selection:bg-cyan-500/30">
      {/* Background Ambient Orbs - Matching Landing Page */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
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

      {/* Main Content */}
      <div className="relative flex flex-col items-center gap-12">
        {/* Logo Container with Glow */}
        <div className="group relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10"
          >
            <Image
              src="/brand-logo.svg"
              alt="Barcody Logo"
              width={180}
              height={180}
              className="relative z-10"
              priority
            />
          </motion.div>
        </div>

        {/* Progress Components */}
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Premium Progress Bar */}
          <div className="relative h-[1px] w-64 overflow-hidden rounded-full bg-white/10">
            <motion.div
              animate={{
                left: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-0 bottom-0 h-full w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            />
          </div>

          <div className="mt-2 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="h-1.5 w-1.5 rounded-full bg-cyan-400/50"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Noise Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
    </div>
  );
}
