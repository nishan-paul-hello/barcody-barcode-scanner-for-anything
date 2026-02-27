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
import { cn } from '@/lib/utils';
import {
  Database,
  Globe,
  Zap,
  X,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  KeyRound,
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
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && data && !isLoading) {
      setUpcKey(data.upcDatabaseApiKey || '');
      setBarcodeKey(data.barcodeLookupApiKey || '');
    }
  }, [open, data, isLoading]);

  const handleCopy = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleClear = (
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter('');
  };

  const initialUpc = data?.upcDatabaseApiKey || '';
  const initialBarcode = data?.barcodeLookupApiKey || '';
  const hasChanges = upcKey !== initialUpc || barcodeKey !== initialBarcode;

  const handleSave = () => {
    if (!hasChanges) return;
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
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-violet-500/10 blur-[80px]" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-fuchsia-600/10 blur-[80px]" />

        <div className="relative p-8 px-10">
          <DialogHeader className="mb-8 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <KeyRound className="h-10 w-10 text-violet-400" />
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight text-white">
                    Personal API Keys
                  </DialogTitle>
                  <DialogDescription className="text-sm font-medium text-white/40">
                    Boost scanning accuracy by connecting data sources.
                  </DialogDescription>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="group flex h-8 w-8 cursor-pointer items-center justify-center transition-all hover:scale-110 active:scale-90"
              >
                <X className="h-6 w-6 text-white/20 transition-colors group-hover:text-white" />
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
              <div className="group/input relative">
                <Input
                  type="password"
                  placeholder="Paste your UPC Item DB API key..."
                  className="h-12 border-white/5 bg-white/5 pr-24 pl-4 font-mono text-xs transition-all focus:bg-white/[0.08] focus-visible:border-2 focus-visible:border-cyan-500/40 focus-visible:ring-0"
                  value={upcKey}
                  onChange={(e) => setUpcKey(e.target.value)}
                />
                <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1 opacity-0 transition-opacity group-hover/input:opacity-100">
                  <button
                    onClick={() => handleCopy(upcKey, 'upc')}
                    className="cursor-pointer rounded-lg p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-cyan-400"
                    title="Copy to clipboard"
                  >
                    {copiedField === 'upc' ? (
                      <Check className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleClear(setUpcKey)}
                    className="cursor-pointer rounded-lg p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-red-400"
                    title="Clear field"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="px-1 text-[11px] leading-relaxed text-white/30">
                The main provider for global product info, ingredients, and
                brands.
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
              <div className="group/input relative">
                <Input
                  type="password"
                  placeholder="Paste your Barcode Lookup API key..."
                  className="h-12 border-white/5 bg-white/5 pr-24 pl-4 font-mono text-xs transition-all focus:bg-white/[0.08] focus-visible:border-2 focus-visible:border-blue-500/40 focus-visible:ring-0"
                  value={barcodeKey}
                  onChange={(e) => setBarcodeKey(e.target.value)}
                />
                <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1 opacity-0 transition-opacity group-hover/input:opacity-100">
                  <button
                    onClick={() => handleCopy(barcodeKey, 'barcode')}
                    className="cursor-pointer rounded-lg p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-blue-400"
                    title="Copy to clipboard"
                  >
                    {copiedField === 'barcode' ? (
                      <Check className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleClear(setBarcodeKey)}
                    className="cursor-pointer rounded-lg p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-red-400"
                    title="Clear field"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="px-1 text-[11px] leading-relaxed text-white/30">
                A reliable backup source for barcodes not found in standard
                databases.
              </p>
            </motion.div>
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
            disabled={updateMutation.isPending || !hasChanges}
            className={cn(
              'min-w-[120px] rounded-xl font-bold transition-all',
              hasChanges
                ? 'cursor-pointer bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:scale-[1.02] hover:bg-cyan-400 active:scale-95'
                : 'cursor-not-allowed bg-white/5 text-white/20 shadow-none'
            )}
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
