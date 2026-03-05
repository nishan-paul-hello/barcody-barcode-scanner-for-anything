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
import { Info, X, Layers, ScanLine, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FORMAT_GROUPS_1D,
  FORMAT_GROUPS_2D,
} from '@/lib/constants/barcode-formats';

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 160, damping: 18 },
  },
} as const;

// ── Tiny section label ───────────────────────────────────────────────────────
function Label({
  icon: Icon,
  iconCls = 'text-cyan-400/70',
  children,
}: {
  icon: React.ElementType;
  iconCls?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={`h-3 w-3 ${iconCls}`} />
      <span className="text-[10px] font-black tracking-widest text-white/30 uppercase">
        {children}
      </span>
    </div>
  );
}

// ── Single format pill ────────────────────────────────────────────────────────
function FormatPill({ name }: { name: string }) {
  return (
    <motion.div
      variants={fadeUp}
      className="group rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 transition-all hover:border-cyan-500/30 hover:bg-cyan-500/[0.06]"
    >
      <span className="text-[11px] font-semibold text-white/50 transition-colors group-hover:text-white/90">
        {name}
      </span>
    </motion.div>
  );
}

export const ScanInfoDialog: React.FC = () => {
  const [showTooltip, setShowTooltip] = React.useState(false);

  const fileTypes = [
    { label: 'JPEG', cls: 'text-emerald-400' },
    { label: 'PNG', cls: 'text-blue-400' },
    { label: 'WEBP', cls: 'text-indigo-400' },
    { label: 'HEIC', cls: 'text-amber-400' },
    { label: 'AVIF', cls: 'text-cyan-400' },
    { label: 'BMP', cls: 'text-slate-400' },
  ];

  // ISBN-13 is content-derived from EAN-13, not a separate ZXing hint
  const formats1D = [...FORMAT_GROUPS_1D, 'ISBN-13'];
  const formats2D = FORMAT_GROUPS_2D;

  return (
    <Dialog>
      {/* ── Trigger + tooltip ─────────────────────────────────────────────── */}
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2"
            >
              <div className="relative rounded-lg border border-white/10 bg-black/80 px-3 py-1.5 text-[10px] font-black tracking-wider whitespace-nowrap text-white/50 uppercase shadow-2xl backdrop-blur-xl">
                Specifications
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

      {/* ── Dialog ─────────────────────────────────────────────────────────── */}
      <DialogContent
        className="max-w-md overflow-hidden rounded-[2rem] border border-white/[0.07] bg-[#080808] p-0 text-white shadow-2xl backdrop-blur-3xl sm:max-w-lg"
        showCloseButton={false}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative px-7 pt-7 pb-6">
          {/* Close */}
          <DialogClose className="absolute top-5 right-5 z-50 cursor-pointer rounded-full p-1.5 text-white/30 transition-all hover:bg-white/8 hover:text-white/80">
            <X className="h-4 w-4" />
          </DialogClose>

          {/* Header */}
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3">
              <div className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/5">
                <Info className="h-4 w-4 text-white/40" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black tracking-tight text-white">
                  System Specification
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* ── File size + accepted types on one row ─────────────────── */}
            <motion.div variants={fadeUp} className="flex items-start gap-6">
              {/* Capacity pill */}
              <div className="shrink-0">
                <Label icon={HardDrive} iconCls="text-amber-400/80">
                  Limit
                </Label>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-black tracking-tighter text-white">
                    20
                  </span>
                  <span className="text-[10px] font-bold text-white/30 uppercase">
                    MB
                  </span>
                  <span className="text-[10px] text-white/20">per asset</span>
                </div>
              </div>

              {/* Vertical divider */}
              <div className="mt-0.5 w-px self-stretch bg-white/5" />

              {/* Accepted formats */}
              <div className="min-w-0 flex-1">
                <Label icon={Layers} iconCls="text-emerald-400/80">
                  Accepted
                </Label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {fileTypes.map(({ label, cls }) => (
                    <span
                      key={label}
                      className={`text-[10px] font-black tracking-wider ${cls}`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Divider */}
            <div className="h-px bg-white/[0.05]" />

            {/* ── Supported Formats ─────────────────────────────────────── */}
            <motion.div variants={fadeUp} className="space-y-4">
              <Label icon={ScanLine} iconCls="text-violet-400/80">
                Supported Formats
              </Label>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {/* 1D */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black tracking-widest text-white/20 uppercase">
                    Linear · 1D
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {formats1D.map((f) => (
                      <FormatPill key={f} name={f} />
                    ))}
                  </div>
                </div>

                {/* 2D */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black tracking-widest text-white/20 uppercase">
                    Matrix · 2D
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {formats2D.map((f) => (
                      <FormatPill key={f} name={f} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
