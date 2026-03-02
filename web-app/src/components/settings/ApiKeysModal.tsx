'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useApiKeys, useUpdateApiKeys } from '@/hooks/use-api-keys';
import { cn } from '@/lib/utils';
import {
  ExternalLink,
  Copy,
  Check,
  KeyRound,
  FlaskConical,
  Database,
  Zap,
  X,
  Loader2,
  Trash2,
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
  link,
  onCopy,
  copiedField,
  onClear,
}: ApiKeyInputProps) => {
  const isSet = value.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-white/10 hover:bg-white/[0.04]"
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-all group-hover:scale-110',
              color.replace('text-', 'bg-').replace('-400', '/10'),
              color.replace('text-', 'ring-').replace('-400', '/20')
            )}
          >
            <Icon className={cn('h-5 w-5', color)} />
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold tracking-tight whitespace-nowrap text-white">
                {label}
              </h3>
              {isSet ? (
                <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide whitespace-nowrap text-green-400 uppercase ring-1 ring-green-500/20">
                  Configured
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold tracking-wide whitespace-nowrap text-white/20 uppercase ring-1 ring-white/10">
                  Not Set
                </span>
              )}
            </div>
            {link && (
              <Link
                href={link}
                target="_blank"
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-[10px] font-bold tracking-wide whitespace-nowrap text-white/40 transition-all hover:bg-white/10 hover:text-white"
              >
                GET KEY <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="group/input relative">
        <Input
          type="password"
          placeholder={placeholder}
          className="h-10 rounded-lg border-white/5 bg-white/5 px-3 font-mono text-xs transition-all focus:border-white/10 focus:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-white/10"
          value={value}
          onChange={(e) => setter(e.target.value)}
        />
        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
          <button
            onClick={() => onCopy(value, fieldId)}
            className={cn(
              'flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl transition-all',
              isSet
                ? 'text-white/40 hover:bg-white/10 hover:text-white'
                : 'pointer-events-none opacity-0'
            )}
            title="Copy entry"
          >
            {copiedField === fieldId ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => onClear(setter)}
            className={cn(
              'flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl transition-all',
              isSet
                ? 'text-white/40 hover:bg-white/10 hover:text-red-400'
                : 'pointer-events-none opacity-0'
            )}
            title="Clear field"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export function ApiKeysModal({ open, onOpenChange }: ApiKeysModalProps) {
  const { data, isLoading } = useApiKeys();
  const updateMutation = useUpdateApiKeys();

  const [upcKey, setUpcKey] = React.useState('');
  const [usdaKey, setUsdaKey] = React.useState('');
  const [goUpcKey, setGoUpcKey] = React.useState('');
  const [searchUpcKey, setSearchUpcKey] = React.useState('');
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && data && !isLoading) {
      setUpcKey(data.upcDatabaseApiKey || '');
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
    usdaKey !== (data?.usdaFoodDataApiKey || '') ||
    goUpcKey !== (data?.goUpcApiKey || '') ||
    searchUpcKey !== (data?.searchUpcApiKey || '');

  const handleSave = () => {
    if (!hasChanges) return;
    updateMutation.mutate(
      {
        upcDatabaseApiKey: upcKey || undefined,
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
        className="overflow-hidden border-white/5 bg-[#0a0a0a] p-0 shadow-[0_0_100px_rgba(0,0,0,0.5)] sm:max-w-2xl sm:rounded-3xl"
      >
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-600/10 blur-[120px]" />

        <div className="relative flex h-[85vh] flex-col sm:h-auto sm:max-h-[85vh]">
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4 sm:p-7 sm:pb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-600/20 ring-1 ring-white/10 transition-all hover:scale-110">
                <KeyRound className="h-5 w-5 text-violet-400" />
              </div>
              <div className="flex flex-col gap-0.5">
                <DialogTitle className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Connect Pro Sources
                </DialogTitle>
                <DialogDescription className="text-sm font-medium text-white/40">
                  Unlock limitless scanning data with your own API keys.
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 transition-all hover:bg-white/10"
            >
              <X className="h-5 w-5 text-white/40 transition-colors group-hover:text-white" />
            </button>
          </div>

          {/* Content Area */}
          <div className="scrollbar-none sm:scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex-1 overflow-y-auto px-8 sm:px-10">
            <div className="grid gap-4 py-4 pb-10">
              <ApiKeyInput
                label="UPC Database"
                value={upcKey}
                setter={setUpcKey}
                fieldId="upc"
                icon={Database}
                color="text-teal-400"
                placeholder="Enter upcdatabase.org Key"
                link="https://upcdatabase.org/check-upc-api"
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
                placeholder="Enter Go-UPC Pro Key"
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
                placeholder="Enter SearchUPC Key"
                link="https://www.searchupc.com/api-upc-database.aspx"
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
                placeholder="Enter USDA Central Key"
                link="https://fdc.nal.usda.gov/api-key-signup.html"
                onCopy={handleCopy}
                copiedField={copiedField}
                onClear={handleClear}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/5 bg-white/[0.02] px-8 py-4 sm:px-10">
            <button
              onClick={() => onOpenChange(false)}
              className="text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase transition-all hover:text-white"
            >
              Dismiss
            </button>

            <button
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending}
              className={cn(
                'group flex h-9 items-center gap-2 rounded-lg px-5 text-[10px] font-bold tracking-widest uppercase transition-all',
                hasChanges
                  ? 'bg-white text-black hover:scale-105 active:scale-95'
                  : 'bg-white/5 text-white/20'
              )}
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap
                  className={cn(
                    'h-3.5 w-3.5 transition-transform duration-300',
                    hasChanges && 'group-hover:scale-125 group-hover:rotate-12'
                  )}
                />
              )}
              Save
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
