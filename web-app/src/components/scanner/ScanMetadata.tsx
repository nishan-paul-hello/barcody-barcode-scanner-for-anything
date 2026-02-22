'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Activity, Cpu, Barcode, Scan, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScanMetadataProps {
  result: string | null;
  format?: string;
  source?: 'Camera' | 'Asset Upload';
  timestamp?: string;
}

export const ScanMetadata: React.FC<ScanMetadataProps> = ({
  result,
  format = 'Unknown',
  source = 'Camera',
  timestamp,
}) => {
  const displayTimestamp = timestamp
    ? new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--:--';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <Card className="relative flex flex-col gap-0 overflow-hidden rounded-[2.5rem] border-white/5 bg-black/40 py-0 shadow-2xl backdrop-blur-3xl">
        {/* Animated Background Pulse */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-cyan-500/5 blur-[80px]" />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-purple-500/5 blur-[80px]" />
        </div>

        <CardHeader className="relative z-10 border-b border-white/5 bg-white/[0.02] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Activity className="h-5 w-5 text-cyan-400" />
                {result && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(34,211,238,0.9)]"
                  />
                )}
              </div>
              <CardTitle className="text-[11px] font-black tracking-[0.2em] text-white/90 uppercase">
                Barcode Details
              </CardTitle>
            </div>
            {result && (
              <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 ring-1 ring-emerald-500/20">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase">
                  Active
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-6 p-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="data"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Raw Signature Block */}
                <div className="group relative space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] font-black tracking-widest text-white/20 uppercase">
                      Barcode Content
                    </span>
                    <Barcode className="h-3 w-3 text-white/10" />
                  </div>
                  <div className="relative rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all group-hover:bg-white/[0.05]">
                    <p className="font-mono text-[13px] leading-relaxed break-all text-white/80">
                      {result}
                    </p>
                    <div className="absolute right-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Zap className="h-3 w-3 text-cyan-400/40" />
                    </div>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2 rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                    <div className="flex items-center gap-2">
                      <Scan className="h-3 w-3 text-cyan-400/60" />
                      <span className="text-[9px] font-black tracking-widest text-white/20 uppercase">
                        Code Type
                      </span>
                    </div>
                    <p className="truncate text-xs font-bold text-white/70 uppercase">
                      {format}
                    </p>
                  </div>
                  <div className="space-y-2 rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-purple-400/60" />
                      <span className="text-[9px] font-black tracking-widest text-white/20 uppercase">
                        Detected At
                      </span>
                    </div>
                    <p className="font-mono text-[11px] font-bold text-white/70">
                      {displayTimestamp}
                    </p>
                  </div>
                </div>

                {/* Source Info */}
                <div className="flex items-center justify-between rounded-2xl bg-white/[0.02] p-3 px-4 ring-1 ring-white/5">
                  <div className="flex items-center gap-3">
                    <Cpu className="h-3.5 w-3.5 text-white/20" />
                    <span className="text-[10px] font-bold tracking-wider text-white/40 uppercase">
                      Input Source
                    </span>
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">
                    {source}
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 animate-ping rounded-full bg-white/5" />
                  <Scan className="relative h-10 w-10 text-white/10" />
                </div>
                <p className="text-[11px] font-black tracking-[0.3em] text-white/20 uppercase">
                  Waiting for Barcode
                </p>
                <div className="mt-4 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      className="h-1 w-1 rounded-full bg-cyan-500/40"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};
