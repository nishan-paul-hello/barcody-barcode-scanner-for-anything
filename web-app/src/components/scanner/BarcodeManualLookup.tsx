'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface BarcodeManualLookupProps {
  onLookupSuccess?: (barcode: string) => void;
  onClear?: () => void;
}

export const BarcodeManualLookup: React.FC<BarcodeManualLookupProps> = ({
  onLookupSuccess,
  onClear,
}) => {
  const [barcode, setBarcode] = useState('');

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
      </motion.div>
    </div>
  );
};
