'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Info, FileType, Cpu, Zap, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
} as const;

export const ScanInfoDialog: React.FC = () => {
  const protocols = [
    { name: 'QR Code', type: '2D' },
    { name: 'EAN-13', type: '1D' },
    { name: 'EAN-8', type: '1D' },
    { name: 'UPC-A', type: '1D' },
    { name: 'UPC-E', type: '1D' },
    { name: 'Code 128', type: '1D' },
    { name: 'Code 39', type: '1D' },
    { name: 'DataMatrix', type: '2D' },
    { name: 'PDF417', type: '2D' },
    { name: 'ITF', type: '1D' },
  ];

  const uploadTypes = [
    { label: 'JPEG', ext: '.jpg', color: 'bg-emerald-500/10 text-emerald-400' },
    { label: 'PNG', ext: '.png', color: 'bg-blue-500/10 text-blue-400' },
    { label: 'WEBP', ext: '.webp', color: 'bg-purple-500/10 text-purple-400' },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="group relative h-10 w-10 rounded-full border border-white/5 bg-white/5 transition-all duration-300 hover:border-cyan-500/50 hover:bg-cyan-500/10"
        >
          <Info className="h-4 w-4 text-white/40 transition-colors group-hover:text-cyan-400" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500"></span>
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-xl overflow-hidden rounded-[2.5rem] border-white/10 bg-black/90 p-0 text-white shadow-2xl backdrop-blur-3xl sm:max-w-2xl"
        showCloseButton={false}
      >
        <div className="relative p-8">
          {/* Decorative background effects */}
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-[60px]" />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-purple-500/10 blur-[60px]" />

          <DialogClose className="absolute top-6 right-6 z-50 rounded-full bg-white/5 p-2 text-white/40 transition-all hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </DialogClose>

          <DialogHeader className="relative mb-10">
            <div className="mb-4 flex items-center gap-4">
              <div className="rounded-2xl bg-cyan-500/10 p-3.5 ring-1 ring-cyan-500/20">
                <Cpu className="h-7 w-7 text-cyan-400" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-black tracking-tight text-white">
                  System Specs
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                    Core Intelligence Active
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-10 md:grid-cols-2"
          >
            {/* Left Column */}
            <div className="space-y-10">
              <motion.section variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-2 text-white/90">
                  <div className="h-1 w-4 rounded-full bg-cyan-500" />
                  <h4 className="text-xs font-black tracking-widest text-white/60 uppercase">
                    Input Sources
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {uploadTypes.map((type) => (
                    <div
                      key={type.label}
                      className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-3.5 transition-all hover:border-white/10 hover:bg-white/[0.06]"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-xl p-2.5 transition-transform group-hover:scale-110 ${type.color}`}
                        >
                          <FileType className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-white/80">
                          {type.label}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-white/20">
                        {type.ext}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.section>

              <motion.section variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-2 text-white/90">
                  <div className="h-1 w-4 rounded-full bg-cyan-500" />
                  <h4 className="text-xs font-black tracking-widest text-white/60 uppercase">
                    Data Constraints
                  </h4>
                </div>
                <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-6">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Zap className="h-12 w-12 text-cyan-400" />
                  </div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-widest text-cyan-400/60 uppercase">
                      Maximum Payload
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black tracking-tighter text-white">
                      10
                    </span>
                    <span className="text-sm font-bold text-cyan-400/60">
                      MB / File
                    </span>
                  </div>
                </div>
              </motion.section>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <motion.section variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-2 text-white/90">
                  <div className="h-1 w-4 rounded-full bg-cyan-500" />
                  <h4 className="text-xs font-black tracking-widest text-white/60 uppercase">
                    Decoding Matrix
                  </h4>
                </div>
                <div className="relative rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-6 shadow-inner">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {protocols.map((protocol) => (
                      <div
                        key={protocol.name}
                        className="group flex items-center gap-3"
                      >
                        <div
                          className={`h-1.5 w-1.5 rounded-full ring-4 ring-transparent transition-all group-hover:ring-cyan-500/20 ${protocol.type === '2D' ? 'bg-cyan-500' : 'bg-white/20'}`}
                        />
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold text-white/70 transition-colors group-hover:text-white">
                            {protocol.name}
                          </span>
                          <span className="text-[9px] font-black tracking-widest text-white/20 uppercase">
                            {protocol.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>

              <motion.div
                variants={itemVariants}
                className="flex items-center gap-3 rounded-2xl bg-emerald-500/5 p-4 ring-1 ring-emerald-500/20"
              >
                <div className="rounded-full bg-emerald-500/20 p-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black tracking-wide text-emerald-400 uppercase">
                    Secure Scanning
                  </span>
                  <span className="text-[10px] text-emerald-400/50">
                    End-to-end extraction validation
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-8">
            <p className="text-[10px] font-medium text-white/20">
              Barcody Scan Engine v2.4.0 • Updated 2024
            </p>
            <DialogClose asChild>
              <Button className="h-11 rounded-full bg-white px-8 text-[11px] font-black tracking-widest text-black uppercase transition-all hover:bg-cyan-400 hover:text-black active:scale-95">
                Acknowledge
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
