'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#050505] text-white">
      {/* Background Ambient Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-cyan-500/5 blur-[100px]"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Large Decorative 404 */}
        <div className="relative mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[12rem] leading-none font-black tracking-tighter text-white/5 select-none md:text-[16rem]"
          >
            404
          </motion.h1>

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-2xl" />
              <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
                <Search className="h-12 w-12 text-cyan-400" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="max-w-md space-y-4"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            SIGNAL <span className="text-cyan-400">LOST</span>
          </h2>
          <p className="leading-relaxed text-white/40">
            The barcode you&apos;re scanning leads to a dead end. Our systems
            couldn&apos;t find any data at this coordinate.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-12 flex flex-col gap-4 sm:flex-row"
        >
          <Link href="/">
            <button className="group flex items-center gap-2 rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-black shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400 active:scale-95">
              <Home className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
              Return Home
            </button>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-bold text-white transition-all hover:bg-white/10 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            Go Back
          </button>
        </motion.div>
      </div>

      {/* Decorative Matrix-like elements */}
      <div className="absolute top-1/4 left-1/4 h-24 w-px bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />
      <div className="absolute right-1/4 bottom-1/4 h-32 w-px bg-gradient-to-b from-transparent via-blue-500/20 to-transparent" />
      <div className="absolute top-1/3 right-1/2 h-px w-16 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />

      {/* Noise Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
    </div>
  );
}
