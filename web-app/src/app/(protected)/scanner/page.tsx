'use client';

import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import { BarcodeFileScanner } from '@/components/scanner/BarcodeFileScanner';
import { BarcodeManualLookup } from '@/components/scanner/BarcodeManualLookup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, FileUp, PackageSearch, Search } from 'lucide-react';
import { useProduct } from '@/hooks/use-product';
import { ProductDetail } from '@/components/products/ProductDetail';
import { ProductSkeleton } from '@/components/products/ProductSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanInfoDialog } from '@/components/scanner/ScanInfoDialog';
import { ScanMetadata } from '@/components/scanner/ScanMetadata';
import { mapZxingFormatToReadable } from '@/lib/utils/barcode';
import { useScanStore } from '@/store/useScanStore';

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
  const {
    results,
    activeTab,
    setLastResult,
    setScanMetadata,
    setHasError,
    setActiveTab,
  } = useScanStore();

  const { lastResult, scanMetadata, hasError } = results[activeTab];

  const { data: productData, isLoading } = useProduct(lastResult);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative container mx-auto max-w-6xl space-y-12 px-4 pt-0 pb-24 sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="mb-4 text-4xl font-black tracking-tight text-white md:text-6xl">
          PRECISION <span className="text-cyan-400">SCANNER</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-white/50">
          Professional-grade barcode recognition and data extraction.
        </p>
      </motion.div>

      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[1fr_350px]">
        {/* Row 1: Main Scanning Interface - Aligned at top */}
        <div className="flex min-w-0 flex-col justify-start">
          <motion.div variants={itemVariants} className="relative">
            <Tabs
              value={activeTab}
              onValueChange={(v) =>
                setActiveTab(v as 'camera' | 'file' | 'lookup')
              }
              className="w-full"
            >
              <div className="relative mb-8 flex items-center justify-center">
                <TabsList className="grid h-14 w-full max-w-[450px] grid-cols-3 rounded-full border border-white/5 bg-black/40 p-1.5 backdrop-blur-2xl">
                  <TabsTrigger
                    value="camera"
                    className="h-11 w-full cursor-pointer rounded-full px-0 text-xs font-bold tracking-widest text-white/40 uppercase transition-all hover:!bg-transparent hover:!text-white data-[state=active]:bg-white/5 data-[state=active]:!text-white data-[state=active]:ring-1 data-[state=active]:ring-white/10 hover:[&_svg]:text-white data-[state=active]:[&_svg]:text-cyan-400"
                  >
                    <Camera className="mr-2 h-3.5 w-3.5" />
                    Live
                  </TabsTrigger>
                  <TabsTrigger
                    value="file"
                    className="h-11 w-full cursor-pointer rounded-full px-0 text-xs font-bold tracking-widest text-white/40 uppercase transition-all hover:!bg-transparent hover:!text-white data-[state=active]:bg-white/5 data-[state=active]:!text-white data-[state=active]:ring-1 data-[state=active]:ring-white/10 hover:[&_svg]:text-white data-[state=active]:[&_svg]:text-cyan-400"
                  >
                    <FileUp className="mr-2 h-3.5 w-3.5" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger
                    value="lookup"
                    className="h-11 w-full cursor-pointer rounded-full px-0 text-xs font-bold tracking-widest text-white/40 uppercase transition-all hover:!bg-transparent hover:!text-white data-[state=active]:bg-white/5 data-[state=active]:!text-white data-[state=active]:ring-1 data-[state=active]:ring-white/10 hover:[&_svg]:text-white data-[state=active]:[&_svg]:text-cyan-400"
                  >
                    <Search className="mr-2 h-3.5 w-3.5" />
                    Lookup
                  </TabsTrigger>
                </TabsList>
                <div className="absolute top-1/2 right-0 -translate-y-1/2">
                  <ScanInfoDialog />
                </div>
              </div>

              <TabsContent value="camera" className="m-0 outline-none">
                <BarcodeScanner
                  active={activeTab === 'camera'}
                  onScanSuccess={(result, fileName) => {
                    setLastResult(result.getText());
                    setHasError(false);
                    setScanMetadata({
                      format: mapZxingFormatToReadable(
                        result.getBarcodeFormat()
                      ),
                      source: 'Camera',
                      timestamp: new Date().toISOString(),
                      fileName,
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
                  onScanSuccess={(result, fileName) => {
                    setLastResult(result.getText());
                    setHasError(false);
                    setScanMetadata({
                      format: mapZxingFormatToReadable(
                        result.getBarcodeFormat()
                      ),
                      source: 'Upload',
                      timestamp: new Date().toISOString(),
                      fileName,
                    });
                  }}
                  onScanError={() => {
                    setHasError(true);
                  }}
                  onClear={() => {
                    setLastResult(null);
                    setHasError(false);
                    setScanMetadata(null);
                  }}
                />
              </TabsContent>
              <TabsContent value="lookup" className="m-0 outline-none">
                <BarcodeManualLookup
                  onLookupSuccess={(barcode) => {
                    setLastResult(barcode);
                    setHasError(false);
                    setScanMetadata({
                      format: 'Manual Entry',
                      source: 'Manual entry',
                      timestamp: new Date().toISOString(),
                    });
                  }}
                  onClear={() => {
                    setLastResult(null);
                    setHasError(false);
                    setScanMetadata(null);
                  }}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        <div className="flex flex-col justify-start">
          <motion.aside variants={itemVariants} className="space-y-8">
            <ScanMetadata
              result={lastResult}
              format={scanMetadata?.format}
              timestamp={scanMetadata?.timestamp}
              isError={hasError}
              fileName={scanMetadata?.fileName}
            />
          </motion.aside>
        </div>

        {/* Row 2: Extraction Results */}
        <AnimatePresence>
          {lastResult && (isLoading || productData !== undefined) && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="min-w-0 space-y-12"
            >
              <div className="space-y-6">
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

                  {!isLoading && productData?.success && (
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

                  {!isLoading && productData && !productData.success && (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-amber-500/20 bg-amber-500/5 py-16 text-center"
                    >
                      <PackageSearch className="mb-4 h-12 w-12 text-amber-500/50" />
                      <p className="text-sm font-bold text-white/80">
                        No product data for this barcode
                      </p>
                      <p className="mt-2 max-w-sm text-xs text-white/50">
                        Our databases don&apos;t have details for{' '}
                        <span className="font-mono text-white/60">
                          {lastResult}
                        </span>
                        . Try another source or scan a different code.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
