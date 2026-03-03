'use client';

import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#0d0d0d] selection:bg-white/10 selection:text-white">
      {/* Background Ambient Orbs - Matching Admin Dashboard Shell */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-[100vw] w-[100vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.015)_0%,transparent_70%)]" />

        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[15%] -left-[10%] h-[60%] w-[60%] rounded-full bg-white/[0.03] blur-[140px]"
        />

        <motion.div
          animate={{
            x: [0, -60, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -right-[10%] -bottom-[15%] h-[50%] w-[50%] rounded-full bg-slate-500/[0.02] blur-[140px]"
        />

        <div className="pointer-events-none absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay brightness-125 contrast-125" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* Progress Components */}
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Premium Industrial Progress Bar */}
          <div className="relative h-[1px] w-64 overflow-hidden rounded-full bg-white/10">
            <motion.div
              animate={{
                left: ['-100%', '100%'],
              }}
              transition={{
                duration: 2.5,
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
    </div>
  );
}
