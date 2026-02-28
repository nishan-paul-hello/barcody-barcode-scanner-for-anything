'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Package,
  Tag,
  Info,
  Layers,
  Image as ImageIcon,
  ExternalLink,
  Barcode,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FlaskConical,
  ArrowUpRight,
  ListTree,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GoUpcPresenterProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

// ─── Placeholder when no image is available ───────────────────────────────────
const ImagePlaceholder = () => (
  <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-white/[0.03]">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-32 w-32 rounded-full bg-purple-500/10 blur-[60px]" />
    </div>
    <div className="relative flex flex-col items-center gap-3 text-white/10">
      <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl">
        <ImageIcon className="h-12 w-12 opacity-20" />
      </div>
      <span className="text-[10px] font-black tracking-[0.2em] uppercase opacity-30">
        No Visual
      </span>
    </div>
  </div>
);

// ─── Single spec pill ─────────────────────────────────────────────────────────
const SpecPill = ({ label, value }: { label: string; value: string }) => (
  <div className="group flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 transition-colors hover:border-purple-500/20 hover:bg-white/[0.06]">
    <span className="mt-0.5 min-w-0 shrink-0 text-[10px] font-bold tracking-wider text-purple-400/60 uppercase">
      {label}
    </span>
    <span className="text-sm break-words text-white/80">{value}</span>
  </div>
);

// ─── Category breadcrumb ──────────────────────────────────────────────────────
const CategoryPath = ({ path }: { path: string[] }) => (
  <div className="flex flex-wrap items-center gap-1.5 text-xs text-white/30">
    {path.map((segment, i) => (
      <span key={i} className="flex items-center gap-1.5">
        {i > 0 && <span className="text-white/10">›</span>}
        <span
          className={
            i === path.length - 1
              ? 'font-semibold text-purple-400/80'
              : 'text-white/30'
          }
        >
          {segment}
        </span>
      </span>
    ))}
  </div>
);

// ─── Animations ───────────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09 } },
};
const card = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
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
      <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-3xl border border-white/5 bg-white/[0.02] text-white/20">
        <Package className="h-10 w-10 opacity-20" />
        <p className="text-sm">No product data returned by Go-UPC</p>
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

  // Decide how many specs to show by default
  const SPEC_LIMIT = 8;
  const visibleSpecs: [string, string][] = showAllSpecs
    ? specs
    : specs.slice(0, SPEC_LIMIT);
  const hiddenCount = specs.length - SPEC_LIMIT;

  // Ingredients truncation
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
      className="space-y-6"
    >
      {/* ── Hero Card ───────────────────────────────────────────────────── */}
      <motion.div
        variants={card}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl"
      >
        {/* subtle purple glow top-left */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-56 w-56 rounded-full bg-purple-600/10 blur-[80px]" />

        <div className="relative flex flex-col gap-8 md:flex-row">
          {/* Image */}
          <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40 md:w-60">
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

          {/* Info */}
          <div className="flex flex-1 flex-col gap-5 py-1">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              {brand && (
                <Badge className="border-purple-500/20 bg-purple-500/10 font-bold tracking-wider text-purple-300 uppercase">
                  {brand}
                </Badge>
              )}
              {category && (
                <Badge className="border-indigo-500/20 bg-indigo-500/10 font-bold tracking-wider text-indigo-300 uppercase">
                  {category}
                </Badge>
              )}
              {codeType && (
                <Badge className="border-white/10 bg-white/5 font-mono text-xs tracking-widest text-white/40 uppercase">
                  {codeType}
                </Badge>
              )}
              {inferred && (
                <Badge className="border-yellow-500/20 bg-yellow-500/10 text-xs font-semibold text-yellow-400">
                  Inferred Code
                </Badge>
              )}
            </div>

            {/* Name */}
            <h2 className="text-2xl leading-tight font-black text-white md:text-3xl">
              {name}
            </h2>

            {/* Category breadcrumb */}
            {categoryPath.length > 0 && <CategoryPath path={categoryPath} />}

            {/* Barcode + links row */}
            <div className="flex flex-wrap items-center gap-5 text-sm">
              {(upc || ean || code) && (
                <div className="flex items-center gap-2 text-white/50">
                  <Barcode className="h-4 w-4 text-purple-400" />
                  <span className="font-mono tracking-wider">
                    {upc ?? ean ?? code}
                  </span>
                </div>
              )}
              {barcodeUrl && (
                <a
                  href={barcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-1.5 text-white/30 transition-colors hover:text-purple-400"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="text-xs tracking-wide">View on Go-UPC</span>
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Lower grid ──────────────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left column: Description + Ingredients */}
        <motion.div variants={card} className="space-y-6">
          {/* Description */}
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-black tracking-widest text-white/40 uppercase">
              <Info className="h-4 w-4 text-purple-400" />
              Description
            </h3>
            <p className="text-sm leading-relaxed text-white/75 selection:bg-purple-500/30">
              {description || 'No description available for this product.'}
            </p>
          </div>

          {/* Ingredients */}
          {ingredientText && (
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-black tracking-widest text-white/40 uppercase">
                <FlaskConical className="h-4 w-4 text-indigo-400" />
                Ingredients
              </h3>
              <p className="text-sm leading-relaxed text-white/65 selection:bg-purple-500/30">
                {displayedIngredients}
              </p>
              {ingredientText.length > INGR_LIMIT && (
                <button
                  onClick={() => setShowFullIngredients((v) => !v)}
                  className="mt-3 flex cursor-pointer items-center gap-1.5 text-xs font-bold text-purple-400/70 transition-colors hover:text-purple-300"
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

        {/* Right column: Specs */}
        <motion.div variants={card}>
          {specs.length > 0 ? (
            <div className="h-full rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
              <h3 className="mb-5 flex items-center gap-2 text-sm font-black tracking-widest text-white/40 uppercase">
                <Layers className="h-4 w-4 text-purple-400" />
                Specifications
                <span className="ml-auto rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400/70">
                  {specs.length}
                </span>
              </h3>

              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {visibleSpecs.map(
                    ([label, value]: [string, string], i: number) => (
                      <motion.div
                        key={label + i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, delay: i * 0.02 }}
                      >
                        <SpecPill label={label} value={value} />
                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              </div>

              {specs.length > SPEC_LIMIT && (
                <button
                  onClick={() => setShowAllSpecs((v) => !v)}
                  className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/5 bg-white/[0.03] py-2.5 text-xs font-bold text-white/30 transition-all hover:border-purple-500/20 hover:text-purple-400"
                >
                  {showAllSpecs ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5" /> Show fewer specs
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" />
                      {hiddenCount} more spec{hiddenCount !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            /* No specs fallback */
            <div className="flex h-full min-h-[12rem] flex-col items-center justify-center gap-3 rounded-3xl border border-white/5 bg-white/[0.02] p-6 text-white/10">
              <ListTree className="h-8 w-8 opacity-20" />
              <p className="text-sm">No specifications provided</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── "Powered by" footer strip ────────────────────────────────────── */}
      <motion.div variants={card}>
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/5 bg-white/[0.02] py-3 text-[11px] tracking-widest text-white/20 uppercase">
          <Sparkles className="h-3 w-3 text-purple-400/40" />
          Data sourced from Go-UPC
          <a
            href="https://go-upc.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-purple-400/50 underline-offset-2 hover:underline"
          >
            go-upc.com
          </a>
          <Tag className="h-3 w-3 text-purple-400/40" />
        </div>
      </motion.div>
    </motion.div>
  );
}
