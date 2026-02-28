'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
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

const ProductPlaceholder = () => (
  <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-white/[0.04]">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-32 w-32 rounded-full bg-cyan-500/10 blur-[60px]" />
    </div>
    <div className="relative flex flex-col items-center gap-4 text-white/10">
      <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl">
        <ImageIcon className="h-12 w-12 opacity-20" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-black tracking-[0.2em] uppercase opacity-30">
          No Visual Found
        </span>
        <div className="h-px w-8 bg-white/10" />
      </div>
    </div>
  </div>
);

export function UPCitemdbPresenter({ data }: UPCitemdbPresenterProps) {
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const [mainReady, setMainReady] = useState(false);
  const [confirmedThumbnails, setConfirmedThumbnails] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const item = data?.items?.[0];

  if (!item) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-3xl border border-white/5 bg-white/[0.02] text-white/20">
        <Package className="h-10 w-10 opacity-20" />
        <p>No item data found in UPCitemdb</p>
      </div>
    );
  }

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

  const markBroken = (url: string) => {
    setBrokenImages((prev) => {
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  const confirmThumbnail = (url: string) => {
    setConfirmedThumbnails((prev) =>
      prev.includes(url) ? prev : [...prev, url]
    );
  };

  // All unique, non-empty, non-broken image URLs from the API
  const allImages: string[] = Array.from(
    new Set(
      (images as string[]).filter(
        (url) =>
          typeof url === 'string' && url.trim() !== '' && !brokenImages.has(url)
      )
    )
  );

  const mainImage = allImages[0] ?? null;
  // Candidate URLs for thumbnails (excluding main)
  const thumbnailCandidates = allImages.slice(1, 12);
  // The image shown in the main box — default to mainImage, overridden by user click
  const displayImage = selectedImage ?? mainImage;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
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
      {/* Hero */}
      <motion.div
        variants={itemAnim}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Image Column */}
          <div className="flex w-full shrink-0 flex-col gap-3 md:w-64">
            {/* Main Image Box */}
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 md:w-64">
              {mainImage ? (
                <>
                  {/* Silent preloader for main image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mainImage}
                    alt=""
                    aria-hidden
                    style={{ display: 'none' }}
                    onLoad={() => setMainReady(true)}
                    onError={() => markBroken(mainImage)}
                  />

                  {/* Placeholder until main image confirmed */}
                  <AnimatePresence>
                    {!mainReady && (
                      <motion.div
                        key="main-ph"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10"
                      >
                        <ProductPlaceholder />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Confirmed main image — crossfades when selectedImage changes */}
                  <AnimatePresence mode="wait">
                    {mainReady && displayImage && (
                      <motion.div
                        key={displayImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="absolute inset-0"
                      >
                        <Image
                          src={displayImage}
                          alt={title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <ProductPlaceholder />
              )}
            </div>

            {/* Silent preloaders — fully outside the visible layout */}
            <div aria-hidden style={{ display: 'none' }}>
              {thumbnailCandidates.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`pre-${img}`}
                  src={img}
                  alt=""
                  onLoad={() => confirmThumbnail(img)}
                  onError={() => markBroken(img)}
                />
              ))}
            </div>

            {/* Visible thumbnail row — only if we have confirmed valid images */}
            {confirmedThumbnails.filter((img) => !brokenImages.has(img))
              .length > 0 && (
              <div className="scrollbar-none flex w-full gap-2 overflow-x-auto">
                {/* First tile: always show the mainImage so user can return to it */}
                {mainImage && mainReady && (
                  <button
                    key={mainImage}
                    onClick={() => setSelectedImage(mainImage)}
                    className={`h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg transition-all duration-200 focus:outline-none ${
                      (selectedImage ?? mainImage) === mainImage
                        ? 'outline outline-1 outline-white/30'
                        : 'opacity-50 hover:opacity-80'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mainImage}
                      alt={title}
                      className="h-full w-full object-cover"
                    />
                  </button>
                )}

                {/* Rest of confirmed thumbnails */}
                {confirmedThumbnails
                  .filter((img) => !brokenImages.has(img))
                  .map((img) => (
                    <button
                      key={img}
                      onClick={() => setSelectedImage(img)}
                      className={`h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg transition-all duration-200 focus:outline-none ${
                        selectedImage === img
                          ? 'outline outline-1 outline-white/30'
                          : 'opacity-50 hover:opacity-80'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={title}
                        className="h-full w-full object-cover"
                        onError={() => markBroken(img)}
                      />
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Info Column */}
          <div className="flex flex-1 flex-col justify-between py-2">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {brand && (
                  <Badge className="border-orange-500/20 bg-orange-500/10 font-bold tracking-wider text-orange-400 uppercase">
                    {brand}
                  </Badge>
                )}
                {category && (
                  <Badge className="border-cyan-500/20 bg-cyan-500/10 font-bold tracking-wider text-cyan-400 uppercase">
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
        {/* Description & Specs */}
        <motion.div variants={itemAnim} className="space-y-6">
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-black tracking-widest text-white/40 uppercase">
              <Info className="h-4 w-4 text-cyan-400" />
              Product Description
            </h3>
            <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-4 ring-1 ring-white/5">
              <p className="text-sm leading-relaxed text-white/80 selection:bg-cyan-500/30">
                {description ||
                  'No detailed description available for this product.'}
              </p>
            </div>
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

        {/* Offers */}
        <motion.div variants={itemAnim}>
          <div className="h-full rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
            <h3 className="mb-6 flex items-center gap-2 text-sm font-black tracking-widest text-white/40 uppercase">
              <ShoppingBag className="h-4 w-4 text-green-400" />
              Live Retailer Offers
            </h3>
            <div className="space-y-3">
              {offers && offers.length > 0 ? (
                offers.slice(0, 6).map(
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
