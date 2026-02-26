'use client';

import React, { useState } from 'react';
import { Search, KeyRound, ArrowRight } from 'lucide-react';
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
  const { data: apiKeys } = useApiKeys();
  const { setApiKeysModalOpen } = useUIStore();

  const hasApiConfigured = React.useMemo(() => {
    if (!apiKeys) return true;
    return !!(apiKeys.upcDatabaseApiKey || apiKeys.barcodeLookupApiKey);
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

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full"
      >
        <Card className="flex aspect-video w-full flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-white/5 bg-white/[0.02] p-8 transition-all duration-500 hover:border-cyan-500/30 hover:bg-cyan-500/[0.03] sm:aspect-square md:aspect-video">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex w-full max-w-sm flex-col items-center text-center"
          >
            <div className="mb-6 rounded-[2rem] bg-cyan-500/10 p-6 ring-1 ring-cyan-500/20">
              <Search className="h-10 w-10 text-cyan-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold tracking-tight text-white/90">
              Manual Entry
            </h3>
            <p className="mb-8 text-sm text-white/50">
              Type or paste a barcode number below to manually look it up in out
              database.
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-4 sm:flex-row"
            >
              <Input
                type="text"
                placeholder="Enter barcode number..."
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="h-12 border-white/10 bg-black/40 text-center font-mono placeholder:font-sans placeholder:text-white/30 focus-visible:ring-cyan-500/50 sm:text-left"
              />
              <Button
                type="submit"
                disabled={!barcode.trim()}
                className="h-12 min-w-[120px] rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50"
              >
                Lookup
              </Button>
            </form>
            {barcode.trim() && (
              <Button
                variant="ghost"
                onClick={handleClear}
                className="mt-4 text-xs text-white/40 hover:text-white"
              >
                Clear
              </Button>
            )}
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
              <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl transition-opacity group-hover:opacity-40" />

              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30">
                  <KeyRound className="h-6 w-6" />
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
                  <span className="font-bold">Set API Keys</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
