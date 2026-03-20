'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/useUIStore';
import { api } from '@/lib/api/client';
import {
  Search,
  Database,
  Zap,
  ShoppingBag,
  FlaskConical,
  Globe,
  Key,
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Settings2,
  Copy,
  ClipboardPaste,
  X,
  Check,
} from 'lucide-react';
import { RawDataPresenter } from '@/components/lookup/RawDataPresenter';
import { UPCitemdbPresenter } from '@/components/lookup/UPCitemdbPresenter';
import { GoUpcPresenter } from '@/components/lookup/GoUpcPresenter';
import { OpenFoodFactsPresenter } from '@/components/lookup/OpenFoodFactsPresenter';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { UPCitemdbData } from '@/components/lookup/UPCitemdbPresenter';
import type { GoUpcData } from '@/components/lookup/GoUpcPresenter';
import type { OpenFoodFactsData } from '@/components/lookup/OpenFoodFactsPresenter';

// Simple internal interfaces to satisfy TS without complexity
interface ApiResultState {
  data: unknown;
  loading: boolean;
  error: string | null;
  responseTime: number | null;
}

interface ResultsMap {
  [key: string]: ApiResultState;
}

const APIS = [
  {
    id: 'upcitemdb',
    name: 'UPCitemdb',
    icon: ShoppingBag,
    color: 'text-orange-400',
  },
  { id: 'goUpc', name: 'Go-UPC', icon: Zap, color: 'text-purple-400' },
  { id: 'searchUpc', name: 'Search UPC', icon: Key, color: 'text-yellow-400' },
  {
    id: 'usda',
    name: 'USDA FoodData Central',
    icon: FlaskConical,
    color: 'text-green-400',
  },
  { id: 'off', name: 'Open Food Facts', icon: Globe, color: 'text-lime-400' },
  {
    id: 'obf',
    name: 'Open Beauty Facts',
    icon: Sparkles,
    color: 'text-rose-400',
  },
];

// Hex values for each Tailwind colour — used for inline border styles so the
// active tab border always matches its icon colour (avoids Tailwind JIT issues).
const COLOR_HEX: Record<string, string> = {
  'text-orange-400': '#fb923c',
  'text-purple-400': '#c084fc',
  'text-yellow-400': '#facc15',
  'text-green-400': '#4ade80',
  'text-lime-400': '#a3e635',
  'text-rose-400': '#fb7185',
};

export default function GlobalLookupPage() {
  const [barcode, setBarcode] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('upcitemdb');
  const setApiKeysModalOpen = useUIStore((state) => state.setApiKeysModalOpen);

  const [results, setResults] = useState<ResultsMap>(() => {
    const initial: ResultsMap = {};
    APIS.forEach((apiItem) => {
      initial[apiItem.id] = {
        data: null,
        loading: false,
        error: null,
        responseTime: null,
      };
    });
    return initial;
  });

  const handleBarcodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBarcode(e.target.value);
    },
    []
  );

  const fetchApi = useCallback(async (id: string, barcodeInput: string) => {
    const startTime = performance.now();
    setResults((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        loading: true,
        error: null,
      } as ApiResultState,
    }));

    try {
      // Use the backend proxy to avoid CORS issues
      const data = await api.products.getRawLookup(barcodeInput, id);

      const endTime = performance.now();
      setResults((prev) => ({
        ...prev,
        [id]: {
          data: data,
          loading: false,
          error: null,
          responseTime: Math.round(endTime - startTime),
        },
      }));
    } catch (err: unknown) {
      const endTime = performance.now();
      let message: string;
      if (err && typeof err === 'object' && 'isAxiosError' in err) {
        const ax = err as {
          response?: { data?: { message?: string | string[] } };
        };
        const msg = ax.response?.data?.message;

        message =
          (Array.isArray(msg) ? msg[0] : msg) ||
          (err as { message?: string }).message ||
          'Unknown error';
      } else {
        message = err instanceof Error ? err.message : String(err);
      }
      setResults((prev) => ({
        ...prev,
        [id]: {
          data: null,
          loading: false,
          error: message || 'Failed to fetch (Check console)',
          responseTime: Math.round(endTime - startTime),
        },
      }));
    }
  }, []);

  const handleLookup = useCallback(() => {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) {
      return;
    }
    APIS.forEach((apiItem) => {
      void fetchApi(apiItem.id, cleanBarcode);
    });
  }, [barcode, fetchApi]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setBarcode(text);
        toast.success('Pasted from clipboard');
      }
    } catch (err) {
      toast.error('Failed to paste: ' + err);
    }
  }, []);

  const handleCopy = useCallback(async () => {
    if (!barcode) {
      return;
    }
    try {
      await navigator.clipboard.writeText(barcode);
      toast.success('Copied to clipboard');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy: ' + err);
    }
  }, [barcode]);

  const handleClear = useCallback(() => {
    setBarcode('');
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleLookup();
      }
    },
    [handleLookup]
  );

  const handleOpenApiSettings = useCallback(() => {
    setApiKeysModalOpen(true);
  }, [setApiKeysModalOpen]);

  return (
    <main className="container mx-auto max-w-6xl px-4 pt-0 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="mb-4 text-4xl font-black tracking-tight text-white md:text-6xl">
          BARCODE <span className="text-cyan-400">LOOKUP</span>
        </h1>
        <p className="mx-auto max-w-3xl text-lg text-white/50">
          Compare barcode data across multiple global databases.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
      >
        <div className="relative w-full max-w-md">
          <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/30" />
          <Input
            value={barcode}
            onChange={handleBarcodeChange}
            placeholder="Enter Barcode"
            className="h-14 border-white/10 bg-white/5 pr-28 pl-12 text-lg text-white placeholder:text-white/20 focus:border-cyan-400 focus-visible:border-cyan-400 focus-visible:ring-0"
            onKeyDown={handleKeyDown}
          />
          <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
            <AnimatePresence mode="popLayout">
              {barcode && (
                <>
                  <motion.button
                    key={copied ? 'checkmark' : 'copy'}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={handleCopy}
                    className="cursor-pointer rounded-lg p-2 text-white/30 transition-colors hover:bg-white/5 hover:text-cyan-400"
                    title="Copy"
                  >
                    {copied ? (
                      <Check className="size-4 text-green-400" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={handleClear}
                    className="cursor-pointer rounded-lg p-2 text-white/30 transition-colors hover:bg-white/5 hover:text-red-400"
                    title="Clear"
                  >
                    <X className="size-4" />
                  </motion.button>
                </>
              )}
              {!barcode && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handlePaste}
                  className="cursor-pointer rounded-lg p-2 text-white/30 transition-colors hover:bg-white/5 hover:text-cyan-400"
                  title="Paste"
                >
                  <ClipboardPaste className="size-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
        <Button
          onClick={handleLookup}
          size="lg"
          className="h-14 w-full cursor-pointer bg-cyan-500 px-10 font-bold text-black shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400 active:scale-95 sm:w-auto"
        >
          Lookup
        </Button>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="mb-12">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-4 bg-transparent p-0 sm:grid-cols-3 lg:grid-cols-6">
            {APIS.map((apiItem) => {
              const res = results[apiItem.id] || {
                loading: false,
                data: null,
                error: null,
                responseTime: null,
              };
              return (
                <TabsTrigger
                  key={apiItem.id}
                  value={apiItem.id}
                  style={
                    activeTab === apiItem.id
                      ? { borderColor: COLOR_HEX[apiItem.color] }
                      : {}
                  }
                  className="group relative flex h-16 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-white/5 bg-white/5 p-2 text-white/40 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08] hover:text-white data-[state=active]:scale-[1.05] data-[state=active]:bg-white/5 data-[state=active]:text-white"
                >
                  <apiItem.icon
                    className={cn(
                      'size-6 transition-transform group-hover:scale-110',
                      apiItem.color
                    )}
                  />
                  <span className="text-center text-xs font-black tracking-tight">
                    {apiItem.name}
                  </span>

                  <div className="absolute top-3 right-3 flex gap-1.5">
                    {res.loading && (
                      <Loader2 className="size-4 animate-spin text-cyan-500/50" />
                    )}
                    {!!res.data && !res.error && (
                      <CheckCircle2 className="size-4 text-green-500/50" />
                    )}
                    {!!res.error && (
                      <XCircle className="size-4 text-red-500/50" />
                    )}
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          {APIS.map((apiItem) => {
            const res = results[apiItem.id] || {
              loading: false,
              data: null,
              error: null,
              responseTime: null,
            };
            return (
              <TabsContent
                key={apiItem.id}
                value={apiItem.id}
                className="focus-visible:outline-none"
              >
                <motion.div
                  key={apiItem.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl"
                >
                  <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
                        <apiItem.icon className={cn('size-6', apiItem.color)} />
                        {apiItem.name}
                      </h2>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {!!res.responseTime && (
                        <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 ring-1 ring-white/10">
                          <Clock className="size-3.5" />
                          {res.responseTime}ms
                        </div>
                      )}
                      {!!res.data && (
                        <Badge className="border-green-500/20 bg-green-500/10 px-3 py-1 font-bold text-green-400">
                          Success
                        </Badge>
                      )}
                      {!!res.error && (
                        <Badge className="border-red-500/20 bg-red-500/10 px-3 py-1 font-bold text-red-400">
                          Error
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    {res.loading ? (
                      <div className="flex h-60 flex-col items-center justify-center gap-4 text-white/20">
                        <Loader2 className="size-10 animate-spin text-cyan-500" />
                        <p className="animate-pulse">
                          Synthesizing response from {apiItem.name}...
                        </p>
                      </div>
                    ) : res.error ? (
                      <div className="flex h-60 flex-col items-center justify-center gap-4 rounded-3xl border border-red-500/10 bg-red-500/5 p-8 text-red-400/70">
                        <XCircle className="size-10" />
                        <p className="text-center font-bold">{res.error}</p>
                        {res.error.toLowerCase().includes('key') ||
                        res.error.toLowerCase().includes('configure') ? (
                          <div className="flex flex-col items-center gap-4">
                            <p className="max-w-md text-center text-xs text-white/40">
                              You need to add your personal API key for this
                              service in the settings.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer border-white/10 bg-white/5 hover:bg-white/10"
                              onClick={handleOpenApiSettings}
                            >
                              <Settings2 className="mr-2 size-3.5" />
                              Open API Settings
                            </Button>
                          </div>
                        ) : (
                          <p className="max-w-md text-center text-xs text-white/20">
                            This might be due to a service outage or an invalid
                            Barcode. Backend proxy is now used to avoid CORS
                            issues.
                          </p>
                        )}
                      </div>
                    ) : res.data ? (
                      <div className="leading-relaxed selection:bg-cyan-500/30">
                        {apiItem.id === 'upcitemdb' ? (
                          (() => {
                            const upcData = res.data as UPCitemdbData;
                            const upcItem = upcData?.items?.[0];
                            return (
                              <UPCitemdbPresenter
                                key={
                                  upcItem?.upc || upcItem?.ean || 'upcitemdb'
                                }
                                data={upcData}
                              />
                            );
                          })()
                        ) : apiItem.id === 'goUpc' ? (
                          <GoUpcPresenter
                            key={(res.data as GoUpcData)?.code ?? 'goupc'}
                            data={res.data as GoUpcData}
                          />
                        ) : apiItem.id === 'off' || apiItem.id === 'obf' ? (
                          <OpenFoodFactsPresenter
                            key={
                              (res.data as OpenFoodFactsData)?.product?.code ??
                              'off'
                            }
                            data={res.data as OpenFoodFactsData}
                          />
                        ) : (
                          <RawDataPresenter data={res.data} />
                        )}
                      </div>
                    ) : (
                      <div className="flex h-60 flex-col items-center justify-center gap-4 rounded-3xl border border-white/5 bg-white/[0.02] p-8 text-white/10">
                        <Database className="size-10 opacity-20" />
                        <p>
                          Enter a barcode above to trigger the lookup sequence
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </TabsContent>
            );
          })}
        </AnimatePresence>
      </Tabs>
    </main>
  );
}
