'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Package,
  Info,
  Layers,
  Image as ImageIcon,
  ExternalLink,
  Barcode,
  FlaskConical,
  ChevronRight,
  Tag,
  Compass,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface GoUpcProduct {
  name: string;
  description?: string;
  imageUrl?: string;
  brand?: string;
  category?: string;
  categoryPath?: string[];
  specs?: [string, string][];
  ingredients?: {
    text?: string;
  };
  upc?: string;
  ean?: string;
}

export interface GoUpcData {
  product?: GoUpcProduct;
  code?: string;
  codeType?: string;
  barcodeUrl?: string;
  inferred?: boolean;
}

interface GoUpcPresenterProps {
  data: GoUpcData;
}

// ─── Placeholder when no image is available ────────────────────────────────────
const ImagePlaceholder = () => (
  <div className="relative flex size-full items-center justify-center overflow-hidden bg-slate-800/60">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="size-32 rounded-full bg-violet-500/15 blur-[70px]" />
    </div>
    <div className="relative flex flex-col items-center gap-3">
      <div className="rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur-xl">
        <ImageIcon className="size-10 text-white/20" />
      </div>
      <span className="text-[10px] font-bold tracking-[0.25em] text-white/20 uppercase">
        No Visual
      </span>
    </div>
  </div>
);

// ─── Single spec grid cell ────────────────────────────────────────────────────
const SpecCell = ({ label, value }: { label: string; value: string }) => (
  <div className="group flex flex-col gap-1.5 rounded-xl border border-white/[0.04] bg-white/[0.015] p-3.5 transition-all hover:border-violet-500/25 hover:bg-white/[0.035]">
    <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase transition-colors group-hover:text-violet-400/60">
      {label}
    </span>
    <span className="text-sm leading-tight font-bold text-slate-200">
      {value}
    </span>
  </div>
);

// ─── Category breadcrumb ──────────────────────────────────────────────────────
const CategoryPath = ({ path }: { path: string[] }) => (
  <div className="flex flex-wrap items-center gap-1.5">
    {path.map((segment, i) => (
      <span key={segment} className="flex items-center gap-1.5">
        {i > 0 && (
          <ChevronRight className="size-[2.5] shrink-0 text-white/15" />
        )}
        <span className="inline-flex items-center rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-white/35 transition-colors hover:border-white/10 hover:text-white/55">
          {segment}
        </span>
      </span>
    ))}
  </div>
);

// ─── Animation variants ───────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const card = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export function GoUpcPresenter({ data }: GoUpcPresenterProps) {
  const [imgBroken, setImgBroken] = useState(false);
  const [imgReady, setImgReady] = useState(false);

  const handleImageLoad = useCallback(() => setImgReady(true), []);
  const handleImageError = useCallback(() => setImgBroken(true), []);

  const product = data?.product;

  if (!product) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-slate-800/30 text-slate-500">
        <Package className="size-10 opacity-30" />
        <p className="text-sm font-medium">
          No product data returned by Go-UPC
        </p>
      </div>
    );
  }

  const {
    name,
    description,
    imageUrl,
    brand,
    category,
    categoryPath = [],
    specs = [],
    ingredients,
    upc,
    ean,
  } = product;

  const code: string = data?.code ?? '';
  const codeType: string = data?.codeType ?? '';
  const barcodeUrl: string = data?.barcodeUrl ?? '';
  const inferred: boolean = data?.inferred ?? false;

  const hasImage = !!imageUrl && !imgBroken;
  const ingredientText: string = ingredients?.text ?? '';

  // Keys rendered in dedicated cards — strip them from the specs list to avoid duplicates
  const DEDICATED_SPEC_KEYS = new Set([
    'ingredients',
    'directions',
    'ecommerce description',
  ]);
  const filteredSpecs: [string, string][] = specs.filter(
    ([label]: [string, string]) =>
      !DEDICATED_SPEC_KEYS.has(label.toLowerCase().trim())
  );

  const ecommerceDescriptionEntry = specs.find(
    ([label]: [string, string]) =>
      label.toLowerCase().trim() === 'ecommerce description'
  );
  const ecommerceDescription = ecommerceDescriptionEntry
    ? ecommerceDescriptionEntry[1]
    : '';

  const directionsEntry = specs.find(
    ([label]: [string, string]) => label.toLowerCase().trim() === 'directions'
  );
  const directions = directionsEntry ? directionsEntry[1] : '';

  // Helper to skip sections with placeholder text
  const isDataEmpty = (text?: string) => {
    if (!text || text.trim() === '') {
      return true;
    }
    const lower = text.toLowerCase().trim();
    return (
      lower.includes('no description found') ||
      lower.includes('no description available') ||
      lower.includes('no ingredients found') ||
      lower.includes('no ingredients available') ||
      lower === 'no description' ||
      lower === 'none'
    );
  };

  // Parse ingredients into a clean list for the UI
  const ingredientList = !isDataEmpty(ingredientText)
    ? ingredientText
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    : [];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* ── Hero Card ─────────────────────────────────────────────────────── */}
      <motion.div
        variants={card}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Product image */}
          <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40 md:w-56">
            {hasImage ? (
              <>
                {/* silent preloader */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt=""
                  aria-hidden
                  style={{ display: 'none' }}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
                <AnimatePresence>
                  {!imgReady && (
                    <motion.div
                      key="ph"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10"
                    >
                      <ImagePlaceholder />
                    </motion.div>
                  )}
                </AnimatePresence>
                {imgReady && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={imageUrl}
                      alt={name ?? 'Product image'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </motion.div>
                )}
              </>
            ) : (
              <ImagePlaceholder />
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-1 flex-col gap-4 py-1">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {brand && (
                <Badge className="border-violet-400/30 bg-violet-500/12 px-2.5 py-1 text-[10px] font-bold tracking-wider text-violet-300 uppercase">
                  {brand}
                </Badge>
              )}
              {category && (
                <Badge className="border-sky-400/25 bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-sky-300 uppercase">
                  {category}
                </Badge>
              )}
              {codeType && (
                <Badge className="border-slate-600/50 bg-slate-700/50 px-2.5 py-1 font-mono text-[10px] tracking-widest text-slate-400 uppercase">
                  {codeType}
                </Badge>
              )}
              {inferred && (
                <Badge className="border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-300">
                  Inferred Code
                </Badge>
              )}
            </div>

            {/* Name */}
            <h2 className="text-2xl leading-tight font-black tracking-tight text-white md:text-3xl">
              {name}
            </h2>

            {/* Category path */}
            {categoryPath.length > 0 && <CategoryPath path={categoryPath} />}

            {/* Divider */}
            <div className="h-px w-full bg-white/[0.06]" />

            {/* Barcode + external link */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {(upc || ean || code) && (
                /* Amber-tinted barcode pill */
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.08] px-3 py-1.5">
                  <Barcode className="size-[3.5] shrink-0 text-amber-400" />
                  <span className="font-mono text-xs tracking-wider text-amber-200/80">
                    {upc ?? ean ?? code}
                  </span>
                </div>
              )}
              {barcodeUrl && (
                <a
                  href={barcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-1.5 text-slate-500 transition-all hover:text-violet-400"
                >
                  <ExternalLink className="size-[3.5] shrink-0" />
                  <span className="text-xs font-medium tracking-wide">
                    View on Go-UPC
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Lower grid ────────────────────────────────────────────────────── */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* ── Left column: Description + Ingredients ── */}
        <motion.div variants={card} className="space-y-5">
          {/* Description card – SKY BLUE */}
          {!isDataEmpty(description) && (
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2.5">
                {/* sky-blue icon bubble */}
                <div className="rounded-lg bg-sky-500/15 p-1.5">
                  <Info className="size-[3.5] text-sky-400" />
                </div>
                <h3 className="text-xs font-black tracking-[0.15em] text-sky-300/80 uppercase">
                  Description
                </h3>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-4 ring-1 ring-white/5">
                <p className="text-sm leading-relaxed text-slate-300 selection:bg-sky-500/25">
                  {description}
                </p>
              </div>
            </div>
          )}

          {/* Ecommerce Description card – AMBER/SHOPPING */}
          {ecommerceDescription && !isDataEmpty(ecommerceDescription) && (
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="rounded-lg bg-amber-500/15 p-1.5">
                  <Tag className="size-[3.5] text-amber-400" />
                </div>
                <h3 className="text-xs font-black tracking-[0.15em] text-amber-300/80 uppercase">
                  Ecommerce Description
                </h3>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-4 ring-1 ring-white/5">
                <p className="text-sm leading-relaxed text-slate-300 selection:bg-amber-500/20">
                  {ecommerceDescription}
                </p>
              </div>
            </div>
          )}

          {/* Ingredients card – EMERALD GREEN */}
          {ingredientText && !isDataEmpty(ingredientText) && (
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2.5">
                {/* emerald icon bubble */}
                <div className="rounded-lg bg-emerald-500/15 p-1.5">
                  <FlaskConical className="size-[3.5] text-emerald-400" />
                </div>
                <h3 className="text-xs font-black tracking-[0.15em] text-emerald-300/80 uppercase">
                  Ingredients
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {ingredientList.map((ingredient) => (
                  <div
                    key={ingredient}
                    className="group flex items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-1.5 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/10"
                  >
                    <span className="text-xs font-semibold text-slate-300 transition-colors group-hover:text-emerald-100">
                      {ingredient}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Right column: Specifications ── */}
        <motion.div variants={card} className="space-y-5">
          {/* Directions card – INDIGO */}
          {directions && !isDataEmpty(directions) && (
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="rounded-lg bg-indigo-500/15 p-1.5">
                  <Compass className="size-[3.5] text-indigo-400" />
                </div>
                <h3 className="text-xs font-black tracking-[0.15em] text-indigo-300/80 uppercase">
                  Directions & Usage
                </h3>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-4 ring-1 ring-white/5">
                <p className="text-sm leading-relaxed text-slate-300 selection:bg-indigo-500/25">
                  {directions}
                </p>
              </div>
            </div>
          )}

          {filteredSpecs.length > 0 && (
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
              {/* Specifications header – VIOLET */}
              <div className="mb-4 flex items-center gap-2.5">
                <div className="rounded-lg bg-violet-500/15 p-1.5">
                  <Layers className="size-[3.5] text-violet-400" />
                </div>
                <h3 className="text-xs font-black tracking-[0.15em] text-violet-300/80 uppercase">
                  Specifications
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <AnimatePresence initial={false}>
                  {filteredSpecs.map(
                    ([label, value]: [string, string], i: number) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: i * 0.02 }}
                      >
                        <SpecCell label={label} value={value} />
                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
