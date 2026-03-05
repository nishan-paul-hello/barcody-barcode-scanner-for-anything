'use client';

import React, { useState } from 'react';
import {
  KeyRound,
  Scan,
  Search,
  Copy,
  X,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useApiKeys } from '@/hooks/use-api-keys';
import { useUIStore } from '@/store/useUIStore';

interface BarcodeManualLookupProps {
  onLookupSuccess?: (barcode: string) => void;
  onClear?: () => void;
}

export const BarcodeManualLookup: React.FC<BarcodeManualLookupProps> = ({
  onLookupSuccess,
  onClear,
}) => {
  const [barcode, setBarcode] = useState('');
  const [copied, setCopied] = useState(false);
  const { data: apiKeys } = useApiKeys();
  const { setApiKeysModalOpen } = useUIStore();

  const hasApiConfigured = React.useMemo(() => {
    if (!apiKeys) {
      return true;
    }
    return !!apiKeys.upcDatabaseApiKey;
  }, [apiKeys]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      onLookupSuccess?.(barcode.trim());
    }
  };

  const handleClear = () => {
    setBarcode('');
    onClear?.();
  };

  const handleCopy = () => {
    if (!barcode) {
      return;
    }
    void navigator.clipboard.writeText(barcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Card className="group relative aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/5 bg-black/40 p-8 shadow-2xl backdrop-blur-3xl transition-all duration-700 hover:border-cyan-500/10 sm:aspect-square md:aspect-video">
          {/* Animated Background Motifs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 size-64 rounded-full bg-cyan-500/5 blur-[100px] transition-opacity group-hover:opacity-100" />
            <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-purple-500/5 blur-[100px] transition-opacity group-hover:opacity-100" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent)] opacity-[0.02]">
              <div className="size-full bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 flex w-full max-w-md flex-col items-center text-center"
          >
            {/* Header Icon Section */}
            <div className="mb-6">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
                <Search className="size-8 transition-transform duration-500 group-hover:scale-110" />
              </div>
            </div>

            <h3 className="mb-2 text-2xl font-black tracking-tight text-white uppercase">
              Manual <span className="text-cyan-400">Lookup</span>
            </h3>
            <p className="mb-10 max-w-[280px] text-sm leading-relaxed font-medium text-white/40">
              Enter a barcode number manually to fetch product details from
              database.
            </p>

            <form onSubmit={handleSubmit} className="relative w-full">
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="ENTER BARCODE"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="h-14 border-white/5 bg-white/5 pr-24 pl-12 font-mono text-lg font-bold tracking-[0.2em] text-cyan-400 transition-all placeholder:font-sans placeholder:text-xs placeholder:tracking-widest placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-cyan-500/30"
                  />
                  <div className="absolute top-1/2 left-4 -translate-y-1/2 text-white/20">
                    <Scan className="size-4" />
                  </div>

                  {/* Inline Actions */}
                  <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
                    <AnimatePresence>
                      {barcode && (
                        <>
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            type="button"
                            onClick={handleCopy}
                            className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-white/20 transition-colors hover:bg-white/5 hover:text-cyan-400"
                            title="Copy barcode"
                          >
                            {copied ? (
                              <Check className="size-4 text-green-500" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                          </motion.button>
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            type="button"
                            onClick={handleClear}
                            className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-white/20 transition-colors hover:bg-white/5 hover:text-red-400"
                            title="Clear input"
                          >
                            <X className="size-4" />
                          </motion.button>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!barcode.trim()}
                  className="h-14 min-w-[140px] cursor-pointer rounded-xl bg-cyan-500 px-6 text-black shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all hover:scale-[1.02] hover:bg-cyan-400 disabled:opacity-30 disabled:grayscale"
                >
                  <span className="font-black tracking-tighter uppercase">
                    Search
                  </span>
                </Button>
              </div>
            </form>
          </motion.div>
        </Card>

        {/* API Warning Component */}
        <AnimatePresence>
          {!hasApiConfigured && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="group relative mt-6 overflow-hidden rounded-[2.5rem] border border-amber-500/20 bg-amber-500/5 p-6 backdrop-blur-xl transition-all hover:border-amber-500/40 hover:bg-amber-500/10"
            >
              <div className="absolute -top-8 -right-8 size-32 rounded-full bg-amber-500/10 blur-3xl transition-opacity group-hover:opacity-40" />

              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30">
                  <KeyRound className="size-6" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[15px] font-bold tracking-tight text-white/90">
                      Lookup API Configuration Required
                    </h4>
                    <span className="flex h-5 items-center rounded-full bg-amber-500/10 px-2 text-[10px] font-black tracking-widest text-amber-500 uppercase ring-1 ring-amber-500/20">
                      Important
                    </span>
                  </div>
                  <p className="max-w-md text-sm leading-relaxed text-white/50">
                    Detailed product extraction requires personal API keys. Set
                    them up once to unlock full scanner potential.
                  </p>
                </div>

                <Button
                  onClick={() => setApiKeysModalOpen(true)}
                  className="h-11 cursor-pointer items-center gap-2 rounded-xl bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all hover:scale-[1.02] hover:bg-amber-400 active:scale-95 sm:ml-auto"
                >
                  <span className="border-black font-bold">Set API Keys</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
