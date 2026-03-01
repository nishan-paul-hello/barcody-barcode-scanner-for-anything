'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Package,
  Info,
  Layers,
  Image as ImageIcon,
  ExternalLink,
  Barcode,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  ArrowUpRight,
  ListTree,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GoUpcPresenterProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

// ─── Placeholder when no image is available ────────────────────────────────────
const ImagePlaceholder = () => (
  <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-slate-800/60">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-32 w-32 rounded-full bg-violet-500/15 blur-[70px]" />
    </div>
    <div className="relative flex flex-col items-center gap-3">
      <div className="rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur-xl">
        <ImageIcon className="h-10 w-10 text-white/20" />
      </div>
      <span className="text-[10px] font-bold tracking-[0.25em] text-white/20 uppercase">
        No Visual
      </span>
    </div>
  </div>
);

// ─── Spec row: label left, value right ────────────────────────────────────────
const SpecRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 rounded-lg border-b border-white/[0.05] px-1 py-3 transition-colors last:border-0 hover:bg-white/[0.025]">
    <span className="min-w-[110px] shrink-0 pt-0.5 text-[11px] font-semibold tracking-widest text-slate-500 uppercase">
      {label}
    </span>
    <span className="max-w-[calc(100%-130px)] text-right text-sm leading-snug font-medium break-words text-slate-200">
      {value}
    </span>
  </div>
);

// ─── Category breadcrumb ──────────────────────────────────────────────────────
const CategoryPath = ({ path }: { path: string[] }) => (
  <div className="flex flex-wrap items-center gap-1 text-xs">
    {path.map((segment, i) => (
      <span key={i} className="flex items-center gap-1">
        {i > 0 && <ChevronRight className="h-3 w-3 text-slate-600" />}
        <span
          className={
            i === path.length - 1
              ? 'font-semibold text-violet-300'
              : 'text-slate-500'
          }
        >
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
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [showFullIngredients, setShowFullIngredients] = useState(false);

  const product = data?.product;

  if (!product) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-slate-800/30 text-slate-500">
        <Package className="h-10 w-10 opacity-30" />
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

  const SPEC_LIMIT = 8;
  const visibleSpecs: [string, string][] = showAllSpecs
    ? specs
    : specs.slice(0, SPEC_LIMIT);
  const hiddenCount = specs.length - SPEC_LIMIT;

  const INGR_LIMIT = 320;
  const ingredientsTruncated =
    ingredientText.length > INGR_LIMIT && !showFullIngredients;
  const displayedIngredients = ingredientsTruncated
    ? ingredientText.slice(0, INGR_LIMIT) + '…'
    : ingredientText;

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
                  onLoad={() => setImgReady(true)}
                  onError={() => setImgBroken(true)}
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
                  <Barcode className="h-3.5 w-3.5 shrink-0 text-amber-400" />
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
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs font-medium tracking-wide">
                    View on Go-UPC
                  </span>
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
            <div className="mb-4 flex items-center gap-2.5">
              {/* sky-blue icon bubble */}
              <div className="rounded-lg bg-sky-500/15 p-1.5">
                <Info className="h-3.5 w-3.5 text-sky-400" />
              </div>
              <h3 className="text-xs font-black tracking-[0.15em] text-sky-300/80 uppercase">
                Description
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-300 selection:bg-sky-500/25">
              {description || (
                <span className="text-slate-500 italic">
                  No description available for this product.
                </span>
              )}
            </p>
          </div>

          {/* Ingredients card – EMERALD GREEN */}
          {ingredientText && (
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2.5">
                {/* emerald icon bubble */}
                <div className="rounded-lg bg-emerald-500/15 p-1.5">
                  <FlaskConical className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <h3 className="text-xs font-black tracking-[0.15em] text-emerald-300/80 uppercase">
                  Ingredients
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-300 selection:bg-emerald-500/20">
                {displayedIngredients}
              </p>
              {ingredientText.length > INGR_LIMIT && (
                <button
                  onClick={() => setShowFullIngredients((v) => !v)}
                  className="mt-3 flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-emerald-400/70 transition-colors hover:text-emerald-300"
                >
                  {showFullIngredients ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5" /> Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" /> Show full list
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* ── Right column: Specifications ── */}
        <motion.div variants={card}>
          {specs.length > 0 ? (
            <div className="h-full rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
              {/* Specifications header – VIOLET */}
              <div className="mb-4 flex items-center gap-2.5">
                <div className="rounded-lg bg-violet-500/15 p-1.5">
                  <Layers className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <h3 className="text-xs font-black tracking-[0.15em] text-violet-300/80 uppercase">
                  Specifications
                </h3>
                {/* count badge */}
                <span className="ml-auto rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-300/70">
                  {specs.length}
                </span>
              </div>

              <div>
                <AnimatePresence initial={false}>
                  {visibleSpecs.map(
                    ([label, value]: [string, string], i: number) => (
                      <motion.div
                        key={label + i}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18, delay: i * 0.015 }}
                      >
                        <SpecRow label={label} value={value} />
                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              </div>

              {specs.length > SPEC_LIMIT && (
                <button
                  onClick={() => setShowAllSpecs((v) => !v)}
                  className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-violet-500/15 bg-violet-500/5 py-2.5 text-xs font-bold text-violet-300/60 transition-all hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-300"
                >
                  {showAllSpecs ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5" /> Show fewer specs
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" /> {hiddenCount} more
                      spec{hiddenCount !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="flex h-full min-h-[12rem] flex-col items-center justify-center gap-3 rounded-3xl border border-white/5 bg-white/[0.02] p-6 text-white/20">
              <ListTree className="h-8 w-8 opacity-40" />
              <p className="text-sm font-medium">No specifications provided</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
