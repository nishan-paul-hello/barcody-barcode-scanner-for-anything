'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Activity, Cpu, Barcode, Scan, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScanMetadataProps {
  result: string | null;
  format?: string;
  source?: 'Camera' | 'Upload' | 'Manual entry';
  timestamp?: string;
  isError?: boolean;
}

export const ScanMetadata: React.FC<ScanMetadataProps> = ({
  result,
  format = 'Unknown',
  source = 'Camera',
  timestamp,
  isError = false,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
    }
  };
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
      <Card className="relative flex h-[480px] flex-col gap-0 overflow-hidden rounded-[2.5rem] border-white/5 bg-black/40 py-0 shadow-2xl backdrop-blur-3xl">
        <CardHeader className="relative z-10 border-b border-white/5 bg-white/[0.02] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-cyan-400" />
              <CardTitle className="text-[11px] font-black tracking-[0.2em] text-white/90 uppercase">
                Barcode Details
              </CardTitle>
            </div>
            {isError && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1"
              >
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                <span className="text-[9px] font-black tracking-widest text-red-500 uppercase">
                  Failed
                </span>
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative z-10 flex min-h-0 flex-1 flex-col space-y-6 p-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="data"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex min-h-0 flex-1 flex-col space-y-6"
              >
                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2 rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                    <div className="flex items-center gap-2">
                      <Scan className="h-3 w-3 text-cyan-400/60" />
                      <span className="text-[9px] font-black tracking-widest text-white/40 uppercase">
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
                      <span className="text-[9px] font-black tracking-widest text-white/40 uppercase">
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
                    <Cpu className="h-3.5 w-3.5 text-yellow-400/60" />
                    <span className="text-[10px] font-bold tracking-wider text-white/40 uppercase">
                      Input Source
                    </span>
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-white uppercase">
                    {source}
                  </span>
                </div>

                {/* Barcode Content Block */}
                <div className="group relative flex min-h-0 flex-1 flex-col">
                  <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] transition-all group-hover:bg-white/[0.05]">
                    {/* Header segment inside the box */}
                    <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Barcode className="h-3 w-3 text-emerald-400/60" />
                        <span className="text-[9px] font-black tracking-widest text-white/40 uppercase">
                          Barcode Content
                        </span>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="cursor-pointer rounded-md p-1 opacity-60 transition-all hover:bg-cyan-500/10 hover:text-cyan-400 hover:opacity-100"
                      >
                        {copied ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>

                    {/* Content Area with Contained Scrollbar */}
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:!bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent">
                      <p className="font-mono text-[12px] leading-relaxed break-all text-white/70">
                        {result}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-1 flex-col items-center justify-center text-center"
              >
                <div className="relative mb-6 flex items-center justify-center">
                  {/* Main Icon Container (Circular) - Size matched to Camera status icons (80px) */}
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
                    <Scan className="h-10 w-10 text-white/30" />
                  </div>
                </div>
                <p className="text-[11px] font-black tracking-[0.3em] text-white/20 uppercase">
                  Waiting for Barcode
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};
