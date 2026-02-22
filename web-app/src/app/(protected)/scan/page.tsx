'use client';

import { useState } from 'react';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import { BarcodeFileScanner } from '@/components/scanner/BarcodeFileScanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scan, Camera, FileUp, PackageSearch, AlertCircle } from 'lucide-react';
import { useProduct } from '@/hooks/use-product';
import { ProductDetail } from '@/components/products/ProductDetail';
import { ProductSkeleton } from '@/components/products/ProductSkeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanInfoDialog } from '@/components/scanner/ScanInfoDialog';
import { ScanMetadata } from '@/components/scanner/ScanMetadata';
import { mapZxingFormatToReadable } from '@/lib/utils/barcode';

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
  const [scanMetadata, setScanMetadata] = useState<{
    format: string;
    source: 'Camera' | 'Asset Upload';
    timestamp: string;
  } | null>(null);
  const [cameraTabActive, setCameraTabActive] = useState(true);
  const [hasError, setHasError] = useState(false);

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

      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[1fr_350px]">
        {/* Row 1: Main Scanning Interface - Aligned at bottom */}
        <div className="flex min-w-0 flex-col justify-end">
          <motion.div variants={itemVariants} className="relative">
            <Tabs
              value={cameraTabActive ? 'camera' : 'file'}
              onValueChange={(v) => setCameraTabActive(v === 'camera')}
              className="w-full"
            >
              <div className="relative mb-8 flex items-center justify-center">
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
                <div className="absolute top-1/2 right-0 -translate-y-1/2">
                  <ScanInfoDialog />
                </div>
              </div>

              <TabsContent value="camera" className="m-0 outline-none">
                <BarcodeScanner
                  active={cameraTabActive}
                  onScanSuccess={(result) => {
                    setLastResult(result.getText());
                    setHasError(false);
                    setScanMetadata({
                      format: mapZxingFormatToReadable(
                        result.getBarcodeFormat()
                      ),
                      source: 'Camera',
                      timestamp: new Date().toISOString(),
                    });
                  }}
                  onScanError={() => {
                    setHasError(true);
                    setLastResult(null);
                    setScanMetadata(null);
                  }}
                />
              </TabsContent>
              <TabsContent value="file" className="m-0 outline-none">
                <BarcodeFileScanner
                  onScanSuccess={(result) => {
                    setLastResult(result.getText());
                    setHasError(false);
                    setScanMetadata({
                      format: mapZxingFormatToReadable(
                        result.getBarcodeFormat()
                      ),
                      source: 'Asset Upload',
                      timestamp: new Date().toISOString(),
                    });
                  }}
                  onScanError={() => {
                    setHasError(true);
                    setLastResult(null);
                    setScanMetadata(null);
                  }}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        <div className="flex flex-col justify-end">
          <motion.aside variants={itemVariants} className="space-y-8">
            <ScanMetadata
              result={lastResult}
              format={scanMetadata?.format}
              source={scanMetadata?.source}
              timestamp={scanMetadata?.timestamp}
              isError={hasError}
            />
          </motion.aside>
        </div>

        {/* Row 2: Extraction Results */}
        <div className="min-w-0 space-y-12">
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
      </div>
    </motion.div>
  );
}
