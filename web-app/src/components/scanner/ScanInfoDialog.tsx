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
import {
  Info,
  FileType,
  Cpu,
  Zap,
  X,
  Binary,
  Database,
  Box,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showTooltip, setShowTooltip] = React.useState(false);
  const protocolGroups = [
    {
      title: 'Linear Symbols (1D)',
      items: [
        'Codabar',
        'Code 128',
        'Code 39',
        'Code 93',
        'EAN-13',
        'EAN-8',
        'ISBN-13',
        'ITF',
        'UPC-A',
      ],
    },
    {
      title: 'Matrix Symbols (2D)',
      items: ['Aztec', 'DataMatrix', 'PDF417', 'QR Code'],
    },
  ];

  const uploadTypes = [
    { label: 'JPEG', color: 'bg-emerald-500/10 text-emerald-400' },
    { label: 'PNG', color: 'bg-blue-500/10 text-blue-400' },
    { label: 'WEBP', color: 'bg-indigo-500/10 text-indigo-400' },
    { label: 'HEIC', color: 'bg-amber-500/10 text-amber-400' },
    { label: 'AVIF', color: 'bg-cyan-500/10 text-cyan-400' },
    { label: 'BMP', color: 'bg-slate-500/10 text-slate-400' },
  ];

  return (
    <Dialog>
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 px-3 py-1.5"
            >
              <div className="relative rounded-lg border border-white/10 bg-black/80 px-3 py-1.5 text-[10px] font-bold tracking-wider whitespace-nowrap text-white/50 uppercase shadow-2xl backdrop-blur-xl">
                View Specifications
                <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-white/10 bg-black/80" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="group relative h-10 w-10 cursor-pointer rounded-full border border-white/5 bg-white/5 transition-all duration-300 hover:border-cyan-500/50 hover:bg-cyan-500/10"
          >
            <Info className="h-4 w-4 text-white/40 transition-colors group-hover:text-cyan-400" />
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent
        className="max-w-xl overflow-hidden rounded-[2.5rem] border-white/10 bg-black/90 p-0 text-white shadow-2xl backdrop-blur-3xl sm:max-w-2xl"
        showCloseButton={false}
      >
        <div className="relative p-8">
          <DialogClose className="absolute top-6 right-6 z-50 cursor-pointer rounded-full bg-white/5 p-2 text-white/40 transition-all hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </DialogClose>

          <DialogHeader className="relative mb-8">
            <div className="mb-4 flex items-center gap-4">
              <Cpu className="h-8 w-8 text-cyan-400" />
              <div>
                <DialogTitle className="text-3xl font-black tracking-tight text-white">
                  System Specification
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-8 md:grid-cols-2"
          >
            {/* Left Column */}
            <div className="space-y-8">
              <motion.section variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-2 text-white/90">
                  <Box className="h-4 w-4 text-cyan-400" />
                  <h4 className="text-xs font-black tracking-widest text-white/60 uppercase">
                    Input Sources
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uploadTypes.map((type) => (
                    <div
                      key={type.label}
                      className={`flex items-center gap-2 rounded-full border border-white/5 px-3 py-1.5 transition-all hover:border-white/10 hover:bg-white/[0.05] ${type.color}`}
                    >
                      <FileType className="h-3 w-3" />
                      <span className="text-[11px] font-black tracking-wider whitespace-nowrap">
                        {type.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.section>

              <motion.section variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-2 text-white/90">
                  <Database className="h-4 w-4 text-cyan-400" />
                  <h4 className="text-xs font-black tracking-widest text-white/60 uppercase">
                    Data Constraints
                  </h4>
                </div>
                <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-6 shadow-inner">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Zap className="h-12 w-12 text-white" />
                  </div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-widest text-white/20 uppercase">
                      Capacity Limit
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black tracking-tighter text-white/90">
                      20
                    </span>
                    <span className="text-xs font-bold tracking-wider text-white/30 uppercase">
                      Megabytes / Asset
                    </span>
                  </div>
                </div>
              </motion.section>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <motion.section variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-2 text-white/90">
                  <Binary className="h-4 w-4 text-cyan-400" />
                  <h4 className="text-xs font-black tracking-widest text-white/60 uppercase">
                    Decoding Matrix
                  </h4>
                </div>

                <div className="space-y-4">
                  {protocolGroups.map((group) => (
                    <div
                      key={group.title}
                      className="relative rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-6 shadow-inner"
                    >
                      <h5 className="mb-4 text-[10px] font-black tracking-widest text-white/20 uppercase">
                        {group.title}
                      </h5>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {group.items.map((protocol) => (
                          <div
                            key={protocol}
                            className="group flex items-center gap-2.5"
                          >
                            <div className="h-1 w-1 rounded-full bg-white/20 ring-2 ring-transparent transition-all group-hover:bg-cyan-500 group-hover:ring-cyan-500/20" />
                            <span className="text-[11px] font-bold text-white/60 transition-colors group-hover:text-white">
                              {protocol}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
