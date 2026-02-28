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
  Zap,
  X,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  KeyRound,
  FlaskConical,
  Search,
  Key,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ApiKeysModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ApiKeyInputProps {
  label: string;
  value: string;
  setter: React.Dispatch<React.SetStateAction<string>>;
  fieldId: string;
  icon: LucideIcon;
  color: string;
  placeholder: string;
  desc: string;
  link?: string;
  onCopy: (text: string, fieldId: string) => void;
  copiedField: string | null;
  onClear: (setter: React.Dispatch<React.SetStateAction<string>>) => void;
}

const ApiKeyInput = ({
  label,
  value,
  setter,
  fieldId,
  icon: Icon,
  color,
  placeholder,
  desc,
  link,
  onCopy,
  copiedField,
  onClear,
}: ApiKeyInputProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="group space-y-3"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', color)} />
        <label
          className={cn(
            'text-xs font-bold tracking-widest text-white/60 uppercase transition-colors group-focus-within:text-white',
            color.replace('text-', 'group-focus-within:text-')
          )}
        >
          {label}
        </label>
      </div>
      {link && (
        <Link
          href={link}
          target="_blank"
          className="flex items-center gap-1 text-[10px] font-bold text-white/30 transition-colors hover:text-white"
        >
          GET KEY <ExternalLink className="h-2.5 w-2.5" />
        </Link>
      )}
    </div>
    <div className="group/input relative">
      <Input
        type="password"
        placeholder={placeholder}
        className="transition-get h-12 border-white/5 bg-white/5 pr-24 pl-4 font-mono text-xs focus:bg-white/[0.08] focus-visible:border-2 focus-visible:border-white/20 focus-visible:ring-0"
        value={value}
        onChange={(e) => setter(e.target.value)}
      />
      <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1 opacity-0 transition-opacity group-hover/input:opacity-100">
        <button
          onClick={() => onCopy(value, fieldId)}
          className="cursor-pointer rounded-lg p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          title="Copy to clipboard"
        >
          {copiedField === fieldId ? (
            <Check className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          onClick={() => onClear(setter)}
          className="cursor-pointer rounded-lg p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-red-400"
          title="Clear field"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
    <p className="px-1 text-[11px] leading-relaxed text-white/30">{desc}</p>
  </motion.div>
);

export function ApiKeysModal({ open, onOpenChange }: ApiKeysModalProps) {
  const { data, isLoading } = useApiKeys();
  const updateMutation = useUpdateApiKeys();

  const [upcKey, setUpcKey] = React.useState('');
  const [barcodeKey, setBarcodeKey] = React.useState('');
  const [usdaKey, setUsdaKey] = React.useState('');
  const [goUpcKey, setGoUpcKey] = React.useState('');
  const [searchUpcKey, setSearchUpcKey] = React.useState('');
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && data && !isLoading) {
      setUpcKey(data.upcDatabaseApiKey || '');
      setBarcodeKey(data.barcodeLookupApiKey || '');
      setUsdaKey(data.usdaFoodDataApiKey || '');
      setGoUpcKey(data.goUpcApiKey || '');
      setSearchUpcKey(data.searchUpcApiKey || '');
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

  const hasChanges =
    upcKey !== (data?.upcDatabaseApiKey || '') ||
    barcodeKey !== (data?.barcodeLookupApiKey || '') ||
    usdaKey !== (data?.usdaFoodDataApiKey || '') ||
    goUpcKey !== (data?.goUpcApiKey || '') ||
    searchUpcKey !== (data?.searchUpcApiKey || '');

  const handleSave = () => {
    if (!hasChanges) return;
    updateMutation.mutate(
      {
        upcDatabaseApiKey: upcKey || undefined,
        barcodeLookupApiKey: barcodeKey || undefined,
        usdaFoodDataApiKey: usdaKey || undefined,
        goUpcApiKey: goUpcKey || undefined,
        searchUpcApiKey: searchUpcKey || undefined,
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
        className="max-w-2xl overflow-hidden border-white/5 bg-[#0a0a0a] p-0 shadow-2xl sm:rounded-[32px]"
      >
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-violet-500/10 blur-[80px]" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-fuchsia-600/10 blur-[80px]" />

        <div className="relative p-8 px-10">
          <DialogHeader className="mb-8 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <KeyRound className="h-10 w-10 text-violet-400" />
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight text-white">
                    Power User API Keys
                  </DialogTitle>
                  <DialogDescription className="text-sm font-medium text-white/40">
                    Connect more data sources for deep product insights.
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

          <div className="scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent grid max-h-[60vh] gap-8 overflow-y-auto pr-4 lg:grid-cols-2">
            <ApiKeyInput
              label="UPC Database"
              value={upcKey}
              setter={setUpcKey}
              fieldId="upc"
              icon={Database}
              color="text-cyan-400"
              placeholder="Paste UPC Item DB API key"
              desc="The main provider for global product info and brands."
              link="https://www.upcitemdb.com/api/explorer"
              onCopy={handleCopy}
              copiedField={copiedField}
              onClear={handleClear}
            />

            <ApiKeyInput
              label="Barcode Lookup"
              value={barcodeKey}
              setter={setBarcodeKey}
              fieldId="barcode"
              icon={Search}
              color="text-blue-400"
              placeholder="Paste Barcode Lookup API key"
              desc="Reliable backup source for barcodes not in standard databases."
              link="https://www.barcodelookup.com/api"
              onCopy={handleCopy}
              copiedField={copiedField}
              onClear={handleClear}
            />

            <ApiKeyInput
              label="USDA FoodData"
              value={usdaKey}
              setter={setUsdaKey}
              fieldId="usda"
              icon={FlaskConical}
              color="text-green-400"
              placeholder="Paste USDA API key"
              desc="Official government database for nutritional facts (USA)."
              link="https://fdc.nal.usda.gov/api-key-signup.html"
              onCopy={handleCopy}
              copiedField={copiedField}
              onClear={handleClear}
            />

            <ApiKeyInput
              label="Go-UPC"
              value={goUpcKey}
              setter={setGoUpcKey}
              fieldId="goupc"
              icon={Zap}
              color="text-purple-400"
              placeholder="Paste Go-UPC API key"
              desc="Premium commercial database for high-accuracy product info."
              link="https://go-upc.com/api"
              onCopy={handleCopy}
              copiedField={copiedField}
              onClear={handleClear}
            />

            <ApiKeyInput
              label="SearchUPC"
              value={searchUpcKey}
              setter={setSearchUpcKey}
              fieldId="searchupc"
              icon={Key}
              color="text-yellow-400"
              placeholder="Paste SearchUPC API key"
              desc="Vast database for general consumer product identification."
              link="https://www.searchupc.com/api-upc-database.aspx"
              onCopy={handleCopy}
              copiedField={copiedField}
              onClear={handleClear}
            />
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
              'group relative min-w-[140px] overflow-hidden rounded-xl border-2 px-6 font-bold transition-all duration-500',
              hasChanges
                ? 'cursor-pointer border-cyan-500/30 bg-transparent text-cyan-400 hover:border-cyan-500 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] active:scale-95'
                : 'cursor-not-allowed border-white/5 bg-white/5 text-white/20 shadow-none'
            )}
          >
            {hasChanges && !updateMutation.isPending && (
              <>
                <div className="absolute top-0 left-0 h-1.5 w-1.5 border-t-2 border-l-2 border-cyan-400 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute right-0 bottom-0 h-1.5 w-1.5 border-r-2 border-b-2 border-cyan-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </>
            )}

            {updateMutation.isPending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <Zap className="h-4 w-4" />
              </motion.div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap
                  className={cn(
                    'h-4 w-4 transition-transform duration-300',
                    hasChanges && 'group-hover:scale-125 group-hover:rotate-12'
                  )}
                />
                Apply All Keys
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
