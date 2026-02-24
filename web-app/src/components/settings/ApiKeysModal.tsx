'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApiKeys, useUpdateApiKeys } from '@/hooks/use-api-keys';
import {
  Database,
  Globe,
  Info,
  Zap,
  X,
  ScanBarcode,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ApiKeysModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiKeysModal({ open, onOpenChange }: ApiKeysModalProps) {
  const { data, isLoading } = useApiKeys();
  const updateMutation = useUpdateApiKeys();

  const [upcKey, setUpcKey] = React.useState('');
  const [barcodeKey, setBarcodeKey] = React.useState('');

  React.useEffect(() => {
    if (open && data && !isLoading) {
      setUpcKey(data.upcDatabaseApiKey || '');
      setBarcodeKey(data.barcodeLookupApiKey || '');
    }
  }, [open, data, isLoading]);

  const handleSave = () => {
    updateMutation.mutate(
      {
        upcDatabaseApiKey: upcKey || undefined,
        barcodeLookupApiKey: barcodeKey || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg overflow-hidden border-white/5 bg-[#0a0a0a] p-0 shadow-2xl sm:rounded-[32px]"
      >
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-[80px]" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-600/10 blur-[80px]" />

        <div className="relative p-8 px-10">
          <DialogHeader className="mb-8 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 ring-1 ring-white/10">
                  <ScanBarcode className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight text-white">
                    Personal API Keys
                  </DialogTitle>
                  <DialogDescription className="text-sm font-medium text-white/40">
                    Power your scanner with custom data sources
                  </DialogDescription>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-white/5 transition-all hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5 text-white/20 transition-colors group-hover:text-red-400" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* UPC Database Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-cyan-400" />
                  <label className="text-xs font-bold tracking-widest text-white/60 uppercase transition-colors group-focus-within:text-cyan-400">
                    UPC Database Key
                  </label>
                </div>
                <Link
                  href="https://www.upcitemdb.com/api/explorer"
                  target="_blank"
                  className="flex items-center gap-1 text-[10px] font-bold text-white/30 transition-colors hover:text-cyan-400"
                >
                  GET KEY <ExternalLink className="h-2.5 w-2.5" />
                </Link>
              </div>
              <div className="relative">
                <Input
                  placeholder="Paste your UPC Item DB API key..."
                  className="h-12 border-white/5 bg-white/5 px-4 font-mono text-sm transition-all focus:bg-white/[0.08] focus:ring-1 focus:ring-cyan-500/50"
                  value={upcKey}
                  onChange={(e) => setUpcKey(e.target.value)}
                />
              </div>
              <p className="px-1 text-[11px] leading-relaxed text-white/30">
                Primary source for high-quality product data, ingredients, and
                brands. Recommended for US/International products.
              </p>
            </motion.div>

            {/* Barcode Lookup Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-400" />
                  <label className="text-xs font-bold tracking-widest text-white/60 uppercase transition-colors group-focus-within:text-blue-400">
                    Barcode Lookup Key
                  </label>
                </div>
                <Link
                  href="https://www.barcodelookup.com/api"
                  target="_blank"
                  className="flex items-center gap-1 text-[10px] font-bold text-white/30 transition-colors hover:text-blue-400"
                >
                  GET KEY <ExternalLink className="h-2.5 w-2.5" />
                </Link>
              </div>
              <div className="relative">
                <Input
                  placeholder="Paste your Barcode Lookup API key..."
                  className="h-12 border-white/5 bg-white/5 px-4 font-mono text-sm transition-all focus:bg-white/[0.08] focus:ring-1 focus:ring-blue-500/50"
                  value={barcodeKey}
                  onChange={(e) => setBarcodeKey(e.target.value)}
                />
              </div>
              <p className="px-1 text-[11px] leading-relaxed text-white/30">
                Secondary fallback for hard-to-find barcodes. Helpful when
                standard databases don&apos;t return results.
              </p>
            </motion.div>

            {/* Security Note */}
            <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/5">
              <div className="mt-0.5 rounded-full bg-cyan-400/10 p-1.5 ring-1 ring-cyan-400/20">
                <Info className="h-3 w-3 text-cyan-400" />
              </div>
              <p className="text-[11px] leading-relaxed font-medium text-white/50">
                Your keys are encrypted and stored privately on your account.
                They are never shared or used by other users.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 border-t border-white/5 bg-white/[0.02] p-6 px-10 sm:justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={updateMutation.isPending}
            className="cursor-pointer rounded-xl font-bold text-white/40 hover:bg-white/5 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="min-w-[120px] cursor-pointer rounded-xl bg-cyan-500 font-bold text-black shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all hover:scale-[1.02] hover:bg-cyan-400 active:scale-95"
          >
            {updateMutation.isPending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <Zap className="h-4 w-4" />
              </motion.div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Apply Keys
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
