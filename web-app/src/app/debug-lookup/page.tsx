'use client';

import { useState } from 'react';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
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
  Code2,
} from 'lucide-react';

// API Configuration (Loaded via environment variables)
const API_KEYS = {
  USDA_FOOD_DATA: process.env.NEXT_PUBLIC_USDA_FOOD_DATA_API_KEY || '',
  BARCODE_LOOKUP: process.env.NEXT_PUBLIC_BARCODE_LOOKUP_API_KEY || '',
  GO_UPC: process.env.NEXT_PUBLIC_GO_UPC_API_KEY || '',
  SEARCH_UPC: process.env.NEXT_PUBLIC_SEARCH_UPC_API_KEY || '',
  UPC_DATABASE: process.env.NEXT_PUBLIC_UPC_DATABASE_API_KEY || '',
};

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
    id: 'upcitemdb',
    name: 'UPCitemdb',
    icon: ShoppingBag,
    color: 'text-orange-400',
  },
  {
    id: 'barcodeLookup',
    name: 'Barcode Lookup',
    icon: Search,
    color: 'text-cyan-400',
  },
  { id: 'goUpc', name: 'Go-UPC', icon: Zap, color: 'text-purple-400' },
  { id: 'searchUpc', name: 'SearchUPC', icon: Key, color: 'text-yellow-400' },
];

export default function DebugLookupPage() {
  const [barcode, setBarcode] = useState('');
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
      let url = '';
      const headers: Record<string, string> = {
        Accept: 'application/json',
      };

      switch (id) {
        case 'off':
          url = `https://world.openfoodfacts.org/api/v2/product/${barcodeInput}.json`;
          break;
        case 'obf':
          url = `https://world.openbeautyfacts.org/api/v2/product/${barcodeInput}.json`;
          break;
        case 'usda':
          url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${barcodeInput}&api_key=${API_KEYS.USDA_FOOD_DATA}`;
          break;
        case 'upcitemdb':
          url = `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcodeInput}`;
          headers['user_key'] = API_KEYS.UPC_DATABASE;
          break;
        case 'barcodeLookup':
          url = `https://api.barcodelookup.com/v3/products?barcode=${barcodeInput}&key=${API_KEYS.BARCODE_LOOKUP}`;
          break;
        case 'goUpc':
          url = `https://api.go-upc.com/v1/code/${barcodeInput}`;
          headers['Authorization'] = `Bearer ${API_KEYS.GO_UPC}`;
          break;
        case 'searchUpc':
          url = `https://api.searchupc.com/v1.1/?request_type=product&key=${API_KEYS.SEARCH_UPC}&upc=${barcodeInput}`;
          break;
      }

      const response = await fetch(url, { headers });
      const data = await response.json();

      const endTime = performance.now();
      setResults((prev) => ({
        ...prev,
        [id]: {
          data: data,
          loading: false,
          error: response.ok ? null : `API Error: ${response.status}`,
          responseTime: Math.round(endTime - startTime),
        },
      }));
    } catch (err: unknown) {
      const endTime = performance.now();
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setResults((prev) => ({
        ...prev,
        [id]: {
          data: null,
          loading: false,
          error: errorMessage || 'Failed to fetch (Check CORS in devtools)',
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
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30">
      <Header />

      <main className="container mx-auto max-w-6xl px-4 pt-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <Badge
            variant="outline"
            className="mb-4 border-cyan-500/30 bg-cyan-500/5 px-4 py-1.5 text-cyan-400"
          >
            Internal API Debugger
          </Badge>
          <h1 className="mb-4 text-4xl font-black tracking-tight text-white md:text-6xl">
            MULTI-API{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              LOOKUP
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/50">
            Simultaneously query all 7 integrated services to compare raw data
            responses for any barcode.
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
            Start Global Lookup
          </Button>
        </motion.div>

        <Tabs defaultValue="off" className="w-full">
          <div className="scrollbar-none mb-8 overflow-x-auto pb-2">
            <TabsList className="h-auto w-full justify-start gap-2 bg-transparent p-0">
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
                    className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 px-6 py-4 text-white/40 transition-all data-[state=active]:border-cyan-500/50 data-[state=active]:bg-cyan-500/10 data-[state=active]:text-white"
                  >
                    <api.icon className={`h-4 w-4 ${api.color}`} />
                    <span className="text-sm font-bold">{api.name}</span>
                    {res.loading && (
                      <Loader2 className="h-3 w-3 animate-spin text-white/40" />
                    )}
                    {res.data && !res.error && (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    )}
                    {res.error && <XCircle className="h-3 w-3 text-red-500" />}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            {APIS.map((api) => {
              const res = results[api.id] || {
                loading: false,
                data: null,
                error: null,
                responseTime: null,
              };
              return (
                <TabsContent
                  key={api.id}
                  value={api.id}
                  className="focus-visible:outline-none"
                >
                  <motion.div
                    key={api.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl"
                  >
                    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div>
                        <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
                          <api.icon className={`h-6 w-6 ${api.color}`} />
                          {api.name} Response
                        </h2>
                        <p className="mt-1 text-sm text-white/50">
                          Detailed data trace for barcode:{' '}
                          <span className="text-cyan-400">
                            {barcode || 'None'}
                          </span>
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

                    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/60 shadow-inner">
                      <div className="flex h-10 items-center justify-between border-b border-white/5 bg-white/5 px-4 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-white/40" />
                          <span className="text-[10px] font-bold tracking-widest text-white/20 uppercase">
                            Raw JSON Payload
                          </span>
                        </div>
                        <div className="flex gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-red-400/30" />
                          <div className="h-2 w-2 rounded-full bg-yellow-400/30" />
                          <div className="h-2 w-2 rounded-full bg-green-400/30" />
                        </div>
                      </div>
                      <div className="scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent max-h-[600px] overflow-auto p-6 font-mono text-sm">
                        {res.loading ? (
                          <div className="flex h-60 flex-col items-center justify-center gap-4 text-white/20">
                            <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
                            <p className="animate-pulse">
                              Synthesizing response from {api.name}...
                            </p>
                          </div>
                        ) : res.error ? (
                          <div className="flex h-60 flex-col items-center justify-center gap-4 text-red-400/70">
                            <XCircle className="h-10 w-10" />
                            <p className="text-center font-bold">{res.error}</p>
                            <p className="max-w-md text-center text-xs text-white/20">
                              This might be due to CORS security policies on the
                              API provider side when called directly from a
                              browser. Reference the browser console for
                              details.
                            </p>
                          </div>
                        ) : res.data ? (
                          <pre className="leading-relaxed text-cyan-50/70 selection:bg-cyan-500/30">
                            {JSON.stringify(res.data, null, 2)}
                          </pre>
                        ) : (
                          <div className="flex h-60 flex-col items-center justify-center gap-4 text-white/10">
                            <Database className="h-10 w-10 opacity-20" />
                            <p>
                              Enter a barcode above to trigger the lookup
                              sequence
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>
              );
            })}
          </AnimatePresence>
        </Tabs>
      </main>

      <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[150px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>
    </div>
  );
}
