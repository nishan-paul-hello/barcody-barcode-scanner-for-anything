'use client';

import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Tag,
  Info,
  Layers,
  Image as ImageIcon,
  ExternalLink,
  DollarSign,
  Package,
  ArrowUpRight,
  Barcode,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UPCitemdbPresenterProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export function UPCitemdbPresenter({ data }: UPCitemdbPresenterProps) {
  if (!data?.items || data.items.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-3xl border border-white/5 bg-white/[0.02] text-white/20">
        <Package className="h-10 w-10 opacity-20" />
        <p>No item data found in UPCitemdb</p>
      </div>
    );
  }

  const item = data.items[0];
  const {
    title,
    brand,
    description,
    category,
    upc,
    ean,
    model,
    color,
    size,
    dimension,
    weight,
    asin,
    mpn,
    currency,
    lowest_recorded_price,
    highest_recorded_price,
    images = [],
    offers = [],
  } = item;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* 1. Hero Section: Image & Main Info */}
      <motion.div
        variants={itemAnim}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Image Gallery / Main Image */}
          <div className="flex shrink-0 flex-col gap-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 md:w-64">
              {images && images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[0]}
                  alt={title}
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-white/10" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="scrollbar-none flex gap-2 overflow-x-auto pb-2">
                {images.slice(1, 5).map((img: string, idx: number) => (
                  <div
                    key={idx}
                    className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/5 bg-black/20"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`${title} ${idx}`}
                      className="h-full w-full object-contain p-1"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-between py-2">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {brand && (
                  <Badge className="border-orange-500/20 bg-orange-500/10 font-bold tracking-wider text-orange-400 uppercase">
                    {brand}
                  </Badge>
                )}
                {category && (
                  <Badge
                    variant="outline"
                    className="border-white/10 font-medium text-white/40"
                  >
                    {category.split(' > ').pop()}
                  </Badge>
                )}
              </div>

              <h2 className="text-2xl leading-tight font-black text-white md:text-4xl">
                {title}
              </h2>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-white/60">
                  <Barcode className="h-4 w-4 text-cyan-400" />
                  <span className="font-mono text-sm tracking-widest">
                    {upc || ean}
                  </span>
                </div>
                {model && (
                  <div className="flex items-center gap-2 text-white/60">
                    <Tag className="h-4 w-4 text-orange-400" />
                    <span className="text-sm font-medium">Model: {model}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Stats */}
            {(lowest_recorded_price || highest_recorded_price) && (
              <div className="mt-8 flex flex-wrap gap-4 rounded-2xl bg-white/[0.02] p-4 ring-1 ring-white/5">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black tracking-widest text-white/20 uppercase">
                    Market Low
                  </span>
                  <span className="text-xl font-bold text-green-400">
                    {currency || '$'}
                    {lowest_recorded_price?.toFixed(2)}
                  </span>
                </div>
                <div className="mx-2 hidden h-10 w-px self-center bg-white/5 sm:block" />
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black tracking-widest text-white/20 uppercase">
                    Market High
                  </span>
                  <span className="text-xl font-bold text-white/80">
                    {currency || '$'}
                    {highest_recorded_price?.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 2. Description & Specs */}
        <motion.div variants={itemAnim} className="space-y-6">
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-black tracking-widest text-white/40 uppercase">
              <Info className="h-4 w-4 text-cyan-400" />
              Product Description
            </h3>
            <p className="text-sm leading-relaxed text-white/70 selection:bg-cyan-500/30">
              {description ||
                'No detailed description available for this product.'}
            </p>
          </div>

          {(color || size || weight || dimension || asin || mpn) && (
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-black tracking-widest text-white/40 uppercase">
                <Layers className="h-4 w-4 text-orange-400" />
                Specifications
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {color && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold tracking-wider text-white/20 uppercase">
                      Color
                    </span>
                    <p className="text-sm text-white/80">{color}</p>
                  </div>
                )}
                {size && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold tracking-wider text-white/20 uppercase">
                      Size
                    </span>
                    <p className="text-sm text-white/80">{size}</p>
                  </div>
                )}
                {dimension && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold tracking-wider text-white/20 uppercase">
                      Dimensions
                    </span>
                    <p className="text-sm text-white/80">{dimension}</p>
                  </div>
                )}
                {weight && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold tracking-wider text-white/20 uppercase">
                      Weight
                    </span>
                    <p className="text-sm text-white/80">{weight}</p>
                  </div>
                )}
                {asin && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold tracking-wider text-white/20 uppercase">
                      ASIN
                    </span>
                    <p className="font-mono text-sm tracking-tight text-white/80">
                      {asin}
                    </p>
                  </div>
                )}
                {mpn && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold tracking-wider text-white/20 uppercase">
                      MPN
                    </span>
                    <p className="font-mono text-sm tracking-tight text-white/80">
                      {mpn}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* 3. Offers / Retailers */}
        <motion.div variants={itemAnim}>
          <div className="h-full rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
            <h3 className="mb-6 flex items-center gap-2 text-sm font-black tracking-widest text-white/40 uppercase">
              <ShoppingBag className="h-4 w-4 text-green-400" />
              Live Retailer Offers
            </h3>

            <div className="space-y-3">
              {offers && offers.length > 0 ? (
                offers
                  .slice(0, 6)
                  .map(
                    (
                      offer: {
                        link: string;
                        merchant: string;
                        condition?: string;
                        currency?: string;
                        price: number | string;
                      },
                      idx: number
                    ) => (
                      <a
                        key={idx}
                        href={offer.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:border-cyan-500/30 hover:bg-white/10"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/20 group-hover:text-cyan-400">
                            <DollarSign className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white/90">
                              {offer.merchant}
                            </p>
                            <p className="text-xs text-white/40">
                              {offer.condition || 'New'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-black text-white">
                              {offer.currency || currency || '$'}
                              {offer.price}
                            </p>
                            <p className="text-[10px] tracking-tighter text-white/20 uppercase">
                              View Store
                            </p>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-white/10 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-400" />
                        </div>
                      </a>
                    )
                  )
              ) : (
                <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-white/10">
                  <ExternalLink className="h-8 w-8 opacity-20" />
                  <p className="text-sm">No live offers currently recorded</p>
                </div>
              )}
            </div>

            {offers.length > 6 && (
              <p className="mt-4 text-center text-[10px] font-bold tracking-widest text-white/20 uppercase">
                + {offers.length - 6} More Retailers Available
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
