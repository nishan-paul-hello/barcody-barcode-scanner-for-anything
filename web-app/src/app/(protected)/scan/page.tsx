'use client';

import { useState } from 'react';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import { BarcodeFileScanner } from '@/components/scanner/BarcodeFileScanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Scan,
  Camera,
  FileUp,
  PackageSearch,
  AlertCircle,
  History,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { useProduct } from '@/hooks/use-product';
import { ProductDetail } from '@/components/products/ProductDetail';
import { ProductSkeleton } from '@/components/products/ProductSkeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ScanPage() {
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [cameraTabActive, setCameraTabActive] = useState(true);
  const { data: productData, isLoading, error } = useProduct(lastResult);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative container mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6 lg:px-8"
    >
      {/* Background decoration */}
      {/* Background decoration - Removed */}

      <div className="grid gap-12 lg:grid-cols-[1fr_350px]">
        <div className="min-w-0 space-y-12">
          <motion.div variants={itemVariants} className="relative">
            <Tabs
              value={cameraTabActive ? 'camera' : 'file'}
              onValueChange={(v) => setCameraTabActive(v === 'camera')}
              className="w-full"
            >
              <div className="mb-8 flex justify-center">
                <TabsList className="h-14 rounded-full border border-white/5 bg-black/40 p-1.5 backdrop-blur-2xl">
                  <TabsTrigger
                    value="camera"
                    className="h-11 cursor-pointer rounded-full px-8 text-xs font-bold tracking-widest text-white/40 uppercase transition-all hover:!bg-transparent hover:!text-white data-[state=active]:bg-white/5 data-[state=active]:!text-white data-[state=active]:ring-1 data-[state=active]:ring-white/10 hover:[&_svg]:text-white data-[state=active]:[&_svg]:text-cyan-400"
                  >
                    <Camera className="mr-2 h-3.5 w-3.5" />
                    Live Capture
                  </TabsTrigger>
                  <TabsTrigger
                    value="file"
                    className="h-11 cursor-pointer rounded-full px-8 text-xs font-bold tracking-widest text-white/40 uppercase transition-all hover:!bg-transparent hover:!text-white data-[state=active]:bg-white/5 data-[state=active]:!text-white data-[state=active]:ring-1 data-[state=active]:ring-white/10 hover:[&_svg]:text-white data-[state=active]:[&_svg]:text-cyan-400"
                  >
                    <FileUp className="mr-2 h-3.5 w-3.5" />
                    Asset Upload
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="camera" className="m-0 outline-none">
                <BarcodeScanner
                  active={cameraTabActive}
                  onScanSuccess={(result) => setLastResult(result.getText())}
                />
              </TabsContent>
              <TabsContent value="file" className="m-0 outline-none">
                <BarcodeFileScanner
                  onScanSuccess={(result) => setLastResult(result.getText())}
                />
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Product Result Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-cyan-500/10 p-2.5 ring-1 ring-cyan-500/20">
                  <PackageSearch className="h-5 w-5 text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">
                  Extraction Results
                </h2>
              </div>
              {lastResult && (
                <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1">
                  <Cpu className="h-3 w-3 text-white/30" />
                  <span className="text-[10px] font-bold text-white/30 uppercase">
                    Processed
                  </span>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ProductSkeleton />
                </motion.div>
              )}

              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Alert
                    variant="destructive"
                    className="rounded-3xl border-red-500/20 bg-red-500/5 p-6 text-red-400"
                  >
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="text-lg font-bold">
                      Entity Not Found
                    </AlertTitle>
                    <AlertDescription className="mt-2 text-red-400/70">
                      Our intelligence network could not match this signature.
                      Signature: <span className="font-mono">{lastResult}</span>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {productData?.success && (
                <motion.div
                  key="data"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <ProductDetail
                    product={productData.data}
                    cacheStatus={productData.cacheStatus}
                  />
                </motion.div>
              )}

              {!lastResult && !isLoading && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-white/5 bg-white/[0.01] py-20 text-center transition-all hover:bg-white/[0.02]"
                >
                  <div className="mb-8 rounded-full bg-white/5 p-8 transition-transform duration-500 group-hover:scale-110">
                    <Scan className="h-12 w-12 text-white/10 group-hover:text-cyan-500/50" />
                  </div>
                  <h3 className="text-2xl font-bold text-white/60">
                    Awaiting Signal
                  </h3>
                  <p className="mt-4 max-w-[280px] text-sm leading-relaxed text-white/30">
                    Once a code is detected, product data will be automatically
                    hydrated here.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <aside className="space-y-8">
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden rounded-[2rem] border-white/5 bg-black/40 backdrop-blur-3xl">
              <CardHeader className="border-b border-white/5 bg-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-cyan-500/10 p-2">
                    <History className="h-4 w-4 text-cyan-400" />
                  </div>
                  <CardTitle className="text-sm font-bold tracking-wider uppercase">
                    Telemetry
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {lastResult ? (
                  <div className="group relative rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 transition-all hover:bg-cyan-500/10">
                    <div className="mb-2 text-[10px] font-bold tracking-widest text-cyan-400/60 uppercase">
                      Raw Signature
                    </div>
                    <p className="font-mono text-xs leading-relaxed break-all text-cyan-400">
                      {lastResult}
                    </p>
                    <div className="absolute top-4 right-4 h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/5 py-10 text-center">
                    <Scan className="mb-4 h-8 w-8 text-white/10" />
                    <p className="text-[11px] font-bold tracking-widest text-white/20 uppercase">
                      No Data Recorded
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="rounded-[2rem] border-white/5 bg-black/40 backdrop-blur-3xl">
              <CardHeader className="pb-3 text-center">
                <div className="mx-auto mb-4 rounded-full bg-cyan-500/10 p-3 ring-1 ring-cyan-500/20">
                  <ShieldCheck className="h-5 w-5 text-cyan-400" />
                </div>
                <CardTitle className="text-lg font-bold ring-red-500">
                  Protocol Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {[
                    'Optimize ambient luminescence',
                    'Stabilize input device focus',
                    'Maintain critical focal distance',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-500/40" />
                      <span className="text-xs leading-relaxed text-white/40">
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden rounded-[2rem] border-white/5 bg-black/40 backdrop-blur-3xl">
              <div className="h-1.5 bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0" />
              <CardHeader className="pb-4">
                <CardTitle className="text-center text-[10px] font-black tracking-[0.3em] text-white/60 uppercase">
                  Encoded Protocols
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {[
                  'QR Code',
                  'EAN-13',
                  'UPC-A',
                  'Code 128',
                  'DataMatrix',
                  'PDF417',
                  'ITF-14',
                  'EAN-8',
                ].map((f) => (
                  <div
                    key={f}
                    className="group flex items-center space-x-2 rounded-xl bg-white/5 px-3 py-2 transition-all hover:bg-white/10 hover:ring-1 hover:ring-white/10"
                  >
                    <div className="h-1 w-1 rounded-full bg-cyan-500/30 group-hover:bg-cyan-500" />
                    <span className="text-[10px] font-bold text-white/30 group-hover:text-white/60">
                      {f}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </aside>
      </div>
    </motion.div>
  );
}
