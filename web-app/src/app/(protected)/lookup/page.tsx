'use client';

import { useState } from 'react';
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
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Settings2,
} from 'lucide-react';
import { RawDataPresenter } from '@/components/lookup/RawDataPresenter';

// Simple internal interfaces to satisfy TS without complexity
interface ApiResultState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  loading: boolean;
  error: string | null;
  responseTime: number | null;
}

interface ResultsMap {
  [key: string]: ApiResultState;
}

const APIS = [
  { id: 'off', name: 'Open Food Facts', icon: Globe, color: 'text-green-400' },
  {
    id: 'obf',
    name: 'Open Beauty Facts',
    icon: FlaskConical,
    color: 'text-pink-400',
  },
  { id: 'usda', name: 'USDA FoodData', icon: Database, color: 'text-blue-400' },
  {
    id: 'upcdatabase',
    name: 'UPC Database',
    icon: Database,
    color: 'text-teal-400',
  },
  {
    id: 'upcitemdb',
    name: 'UPCitemdb',
    icon: ShoppingBag,
    color: 'text-orange-400',
  },
  { id: 'goUpc', name: 'Go-UPC', icon: Zap, color: 'text-purple-400' },
  { id: 'searchUpc', name: 'SearchUPC', icon: Key, color: 'text-yellow-400' },
];

export default function GlobalLookupPage() {
  const [barcode, setBarcode] = useState('');
  const setApiKeysModalOpen = useUIStore((state) => state.setApiKeysModalOpen);

  const [results, setResults] = useState<ResultsMap>(() => {
    const initial: ResultsMap = {};
    APIS.forEach((api) => {
      initial[api.id] = {
        data: null,
        loading: false,
        error: null,
        responseTime: null,
      };
    });
    return initial;
  });

  const fetchApi = async (id: string, barcodeInput: string) => {
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
  };

  const handleLookup = () => {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) return;
    APIS.forEach((api) => fetchApi(api.id, cleanBarcode));
  };

  return (
    <>
      <main className="container mx-auto max-w-6xl px-4 pt-0 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 text-4xl font-black tracking-tight text-white md:text-6xl">
            BARCODE{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              LOOKUP
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/50">
            Compare data from across the web. This tool queries all integrated
            commercial and open-data services simultaneously.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12 flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/5 bg-white/5 p-8 shadow-2xl shadow-cyan-500/5 backdrop-blur-xl sm:flex-row"
        >
          <div className="relative w-full max-w-md">
            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-white/30" />
            <Input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Enter Barcode (UPC/EAN)..."
              className="h-14 border-white/10 bg-white/5 pl-12 text-lg text-white placeholder:text-white/20 focus:border-cyan-500/50 focus:ring-0"
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            />
          </div>
          <Button
            onClick={handleLookup}
            size="lg"
            className="h-14 w-full cursor-pointer bg-cyan-500 px-10 font-bold text-black shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400 active:scale-95 sm:w-auto"
          >
            Lookup
          </Button>
        </motion.div>

        <Tabs defaultValue="off" className="w-full">
          <div className="mb-12">
            <TabsList className="grid h-auto w-full grid-cols-1 gap-4 bg-transparent p-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {APIS.map((api) => {
                const res = results[api.id] || {
                  loading: false,
                  data: null,
                  error: null,
                  responseTime: null,
                };
                return (
                  <TabsTrigger
                    key={api.id}
                    value={api.id}
                    className="group relative flex h-32 flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-6 text-white/40 transition-all hover:bg-white/[0.07] data-[state=active]:border-cyan-500/50 data-[state=active]:bg-cyan-500/10 data-[state=active]:text-white"
                  >
                    <api.icon
                      className={`h-6 w-6 transition-transform group-hover:scale-110 ${api.color}`}
                    />
                    <span className="text-center text-xs font-black tracking-widest uppercase">
                      {api.name}
                    </span>

                    <div className="absolute top-3 right-3 flex gap-1.5">
                      {res.loading && (
                        <Loader2 className="h-4 w-4 animate-spin text-cyan-500/50" />
                      )}
                      {res.data && !res.error && (
                        <CheckCircle2 className="h-4 w-4 text-green-500/50" />
                      )}
                      {res.error && (
                        <XCircle className="h-4 w-4 text-red-500/50" />
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
                          <apiItem.icon
                            className={`h-6 w-6 ${apiItem.color}`}
                          />
                          {apiItem.name} Response
                        </h2>
                        <p className="mt-1 text-sm text-white/50">
                          Detailed data trace for barcode:{' '}
                          <span className="text-cyan-400">
                            {barcode || 'None'}
                          </span>
                          . On the Scanner, results use a cascade (OFF → UPC
                          DB); here each API is called directly.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {res.responseTime && (
                          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 ring-1 ring-white/10">
                            <Clock className="h-3.5 w-3.5" />
                            {res.responseTime}ms
                          </div>
                        )}
                        {res.data && (
                          <Badge className="border-green-500/20 bg-green-500/10 px-3 py-1 font-bold text-green-400">
                            Success
                          </Badge>
                        )}
                        {res.error && (
                          <Badge className="border-red-500/20 bg-red-500/10 px-3 py-1 font-bold text-red-400">
                            Error
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      {res.loading ? (
                        <div className="flex h-60 flex-col items-center justify-center gap-4 text-white/20">
                          <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
                          <p className="animate-pulse">
                            Synthesizing response from {apiItem.name}...
                          </p>
                        </div>
                      ) : res.error ? (
                        <div className="flex h-60 flex-col items-center justify-center gap-4 rounded-3xl border border-red-500/10 bg-red-500/5 p-8 text-red-400/70">
                          <XCircle className="h-10 w-10" />
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
                                onClick={() => setApiKeysModalOpen(true)}
                              >
                                <Settings2 className="mr-2 h-3.5 w-3.5" />
                                Open API Settings
                              </Button>
                            </div>
                          ) : (
                            <p className="max-w-md text-center text-xs text-white/20">
                              This might be due to a service outage or an
                              invalid Barcode. Backend proxy is now used to
                              avoid CORS issues.
                            </p>
                          )}
                        </div>
                      ) : res.data ? (
                        <div className="leading-relaxed selection:bg-cyan-500/30">
                          <RawDataPresenter data={res.data} />
                        </div>
                      ) : (
                        <div className="flex h-60 flex-col items-center justify-center gap-4 rounded-3xl border border-white/5 bg-white/[0.02] p-8 text-white/10">
                          <Database className="h-10 w-10 opacity-20" />
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
    </>
  );
}
