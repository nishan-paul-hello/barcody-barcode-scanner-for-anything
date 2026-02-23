'use client';

import { useState } from 'react';
import { useProduct } from '@/hooks/use-product';
import { ProductDetail } from '@/components/products/ProductDetail';
import { ProductSkeleton } from '@/components/products/ProductSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PackageSearch, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LookupPage() {
  const [barcode, setBarcode] = useState('');
  const [submittedBarcode, setSubmittedBarcode] = useState<string | null>(null);

  const { data: productData, isLoading } = useProduct(submittedBarcode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = barcode.trim();
    if (!trimmed) return;
    setSubmittedBarcode(trimmed);
  };

  const showResults =
    submittedBarcode && (isLoading || productData !== undefined);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative container mx-auto max-w-4xl space-y-12 px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Lookup
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Enter a barcode to fetch product details (e.g. UPC, EAN).
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label htmlFor="lookup-barcode" className="sr-only">
              Barcode number
            </label>
            <Input
              id="lookup-barcode"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 012345678905"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="h-12 rounded-2xl border-white/10 bg-white/5 font-mono text-white placeholder:text-white/30 focus-visible:ring-cyan-500/50 sm:text-base"
            />
          </div>
          <Button
            type="submit"
            disabled={!barcode.trim()}
            className="h-12 shrink-0 rounded-2xl bg-cyan-500 px-8 font-bold text-white hover:bg-cyan-600 disabled:opacity-50"
          >
            <Search className="mr-2 h-4 w-4" />
            Look up
          </Button>
        </form>
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-cyan-500/10 p-2.5 ring-1 ring-cyan-500/20">
                <PackageSearch className="h-5 w-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Extraction Results
              </h2>
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
                      {submittedBarcode}
                    </span>
                    . Try another barcode.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
