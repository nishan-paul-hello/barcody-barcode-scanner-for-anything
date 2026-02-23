'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import type { ProductResponseDto } from '@/lib/api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Milk,
  Wheat,
  Egg,
  Database,
  History,
  Flame,
  Zap,
  Leaf,
  Layers,
  Search,
  Building2,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const DESCRIPTION_TRUNCATE_LENGTH = 280;
const SOURCE_LABELS: Record<ProductResponseDto['source'], string> = {
  openfoodfacts: 'Open Food Facts',
  upcdatabase: 'UPC Database',
  barcodelookup: 'Barcode Lookup',
};

interface ProductDetailProps {
  product: ProductResponseDto;
  cacheStatus?: 'hit' | 'miss';
}

const NUTRITION_GRADES = {
  A: { color: 'bg-emerald-500', text: 'Excellent' },
  B: { color: 'bg-green-500', text: 'Good' },
  C: { color: 'bg-yellow-500', text: 'Fair' },
  D: { color: 'bg-orange-500', text: 'Poor' },
  E: { color: 'bg-red-500', text: 'Very Poor' },
};

const ALLERGEN_ICONS: Record<string, LucideIcon> = {
  milk: Milk,
  dairy: Milk,
  gluten: Wheat,
  wheat: Wheat,
  eggs: Egg,
  egg: Egg,
  soy: Leaf,
  nuts: AlertTriangle,
  peanuts: AlertTriangle,
  fish: AlertTriangle,
  seafood: AlertTriangle,
};

function hasNutritionData(nutrition: ProductResponseDto['nutrition']): boolean {
  if (!nutrition) return false;
  const { grade, calories, fat, carbs, protein, sugar, fiber, salt } =
    nutrition;
  return (
    grade != null ||
    (calories != null && calories > 0) ||
    (fat != null && fat > 0) ||
    (carbs != null && carbs > 0) ||
    (protein != null && protein > 0) ||
    (sugar != null && sugar > 0) ||
    (fiber != null && fiber > 0) ||
    (salt != null && salt > 0)
  );
}

function hasSafetyData(nutrition: ProductResponseDto['nutrition']): boolean {
  if (!nutrition) return false;
  const hasAllergens =
    nutrition.allergens != null && nutrition.allergens.length > 0;
  const hasIngredients = !!nutrition.ingredients?.trim();
  return hasAllergens || hasIngredients;
}

function hasDetailsData(product: ProductResponseDto): boolean {
  return !!(product.description?.trim() || product.manufacturer?.trim());
}

export function ProductDetail({ product, cacheStatus }: ProductDetailProps) {
  const {
    nutrition,
    images,
    name,
    brand,
    barcode,
    category,
    description,
    manufacturer,
    source,
    lastUpdated,
  } = product;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const hasNutrition = useMemo(() => hasNutritionData(nutrition), [nutrition]);
  const hasSafety = useMemo(() => hasSafetyData(nutrition), [nutrition]);
  const hasDetails = useMemo(() => hasDetailsData(product), [product]);

  const displayImages = images?.filter(Boolean) ?? [];
  const mainImage = displayImages[selectedImageIndex] ?? null;
  const hasMultipleImages = displayImages.length > 1;

  const descriptionTrimmed = description?.trim();
  const isDescriptionLong =
    (descriptionTrimmed?.length ?? 0) > DESCRIPTION_TRUNCATE_LENGTH;
  const descriptionToShow =
    descriptionExpanded || !isDescriptionLong
      ? descriptionTrimmed
      : descriptionTrimmed?.slice(0, DESCRIPTION_TRUNCATE_LENGTH) + '…';

  const sourceLabel = SOURCE_LABELS[source] ?? source;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* ——— Hero: works for any product ——— */}
      <Card className="group overflow-hidden rounded-[2.5rem] border-white/5 bg-black/40 shadow-2xl backdrop-blur-3xl">
        <div className="flex flex-col md:flex-row">
          <div className="relative aspect-square w-full flex-shrink-0 bg-white/[0.03] p-8 md:w-80">
            {mainImage ? (
              <div className="relative h-full w-full">
                <Image
                  src={mainImage}
                  alt={name || 'Product'}
                  fill
                  className="object-contain transition-all duration-500 group-hover:scale-[1.02]"
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 320px"
                  priority
                />
              </div>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <div className="rounded-full bg-white/5 p-4">
                  <Search className="h-8 w-8 text-white/10" />
                </div>
                <span className="text-[10px] font-black tracking-widest text-white/10 uppercase">
                  No image
                </span>
              </div>
            )}

            {hasMultipleImages && (
              <div className="absolute right-3 bottom-3 left-3 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/60 p-2 backdrop-blur-md">
                {displayImages.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(i)}
                    className={cn(
                      'relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all',
                      selectedImageIndex === i
                        ? 'border-cyan-400 ring-2 ring-cyan-400/30'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    )}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                      sizes="56px"
                    />
                  </button>
                ))}
              </div>
            )}

            {cacheStatus === 'hit' && (
              <div className="absolute top-4 right-4">
                <Badge className="border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-cyan-400 uppercase ring-1 ring-cyan-500/20 backdrop-blur-md">
                  <Layers className="mr-1.5 h-3 w-3" />
                  Cached
                </Badge>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-center space-y-5 p-8 md:p-10">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {category
                  ? category.split(',').map((cat, i) => (
                      <Badge
                        key={`${cat}-${i}`}
                        className="max-w-full rounded-full border-cyan-500/10 bg-cyan-500/5 px-3 py-0.5 text-[10px] font-black tracking-widest text-cyan-500/80 uppercase"
                      >
                        <span className="truncate">{cat.trim()}</span>
                      </Badge>
                    ))
                  : null}
                <Badge className="rounded-full border-white/5 bg-white/5 px-3 py-0.5 font-mono text-[10px] font-bold tracking-wider text-white/30 uppercase">
                  # {barcode}
                </Badge>
              </div>
              <h2 className="text-2xl font-black tracking-tight break-words text-white md:text-3xl">
                {name || 'Unknown product'}
              </h2>
              {(brand || manufacturer) && (
                <p className="text-lg font-medium tracking-wide break-words text-white/50">
                  {brand || manufacturer}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-5 border-t border-white/5 pt-4">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-white/5 p-2">
                  <Database className="h-3.5 w-3.5 text-white/30" />
                </div>
                <span className="text-[11px] font-bold tracking-widest text-white/30 uppercase">
                  Source:{' '}
                  <span className="ml-1 text-white/60">{sourceLabel}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-white/5 p-2">
                  <History className="h-3.5 w-3.5 text-white/30" />
                </div>
                <span className="text-[11px] font-bold tracking-widest text-white/30 uppercase">
                  Updated:{' '}
                  <span className="ml-1 text-white/60">
                    {new Date(lastUpdated).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ——— Product details (description / manufacturer): any product ——— */}
      <AnimatePresence>
        {hasDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="rounded-[2.5rem] border-white/5 bg-black/40 shadow-xl backdrop-blur-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-bold tracking-tight">
                  <div className="rounded-full bg-white/10 p-2.5 ring-1 ring-white/10">
                    <FileText className="h-5 w-5 text-white/70" />
                  </div>
                  Product details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {manufacturer?.trim() && (
                  <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
                    <div>
                      <p className="text-[10px] font-black tracking-widest text-white/30 uppercase">
                        Manufacturer
                      </p>
                      <p className="mt-1 text-sm font-medium break-words text-white/80">
                        {manufacturer.trim()}
                      </p>
                    </div>
                  </div>
                )}
                {descriptionTrimmed && (
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                    <p className="mb-2 text-[10px] font-black tracking-widest text-white/30 uppercase">
                      Description
                    </p>
                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap text-white/70">
                      {descriptionToShow}
                    </p>
                    {isDescriptionLong && (
                      <button
                        type="button"
                        onClick={() => setDescriptionExpanded((e) => !e)}
                        className="mt-3 flex items-center gap-1 text-xs font-bold tracking-wide text-cyan-400 hover:text-cyan-300"
                      >
                        {descriptionExpanded ? (
                          <>
                            Show less <ChevronUp className="h-3.5 w-3.5" />
                          </>
                        ) : (
                          <>
                            Show more <ChevronDown className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ——— Nutrition & Safety: only when data exists ——— */}
      <div
        className={cn(
          'grid gap-8',
          hasNutrition && hasSafety ? 'md:grid-cols-2' : 'max-w-2xl'
        )}
      >
        {hasNutrition && (
          <Card className="rounded-[2.5rem] border-white/5 bg-black/40 shadow-xl backdrop-blur-3xl">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-lg font-bold tracking-tight">
                <div className="rounded-full bg-yellow-500/10 p-2.5 ring-1 ring-yellow-500/20">
                  <Zap className="h-5 w-5 text-yellow-500" />
                </div>
                Nutrition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                {nutrition?.grade != null && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black tracking-widest text-white/30 uppercase">
                      Grade
                    </p>
                    <div className="flex gap-2">
                      {(['A', 'B', 'C', 'D', 'E'] as const).map((g) => (
                        <div
                          key={g}
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-black ring-1 transition-all',
                            nutrition.grade === g
                              ? cn(
                                  NUTRITION_GRADES[g].color,
                                  'text-white ring-white/20'
                                )
                              : 'bg-white/5 text-white/10 ring-transparent'
                          )}
                        >
                          {g}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {nutrition?.calories != null && nutrition.calories > 0 && (
                  <div className="text-left sm:text-right">
                    <div className="flex items-center gap-1.5 text-orange-400">
                      <Flame className="h-5 w-5" />
                      <span className="text-2xl font-black">
                        {nutrition.calories}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold tracking-widest text-white/20 uppercase">
                      kcal
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <MacroRow
                  label="Carbs"
                  value={nutrition?.carbs}
                  color="bg-blue-500"
                />
                <MacroRow
                  label="Protein"
                  value={nutrition?.protein}
                  color="bg-emerald-500"
                />
                <MacroRow
                  label="Fat"
                  value={nutrition?.fat}
                  color="bg-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <NutrientStat
                  label="Sugar"
                  value={nutrition?.sugar}
                  unit="g"
                  color="text-pink-400"
                />
                <NutrientStat
                  label="Fiber"
                  value={nutrition?.fiber}
                  unit="g"
                  color="text-indigo-400"
                />
                <NutrientStat
                  label="Salt"
                  value={nutrition?.salt}
                  unit="g"
                  color="text-rose-400"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {hasSafety && (
          <Card className="rounded-[2.5rem] border-white/5 bg-black/40 shadow-xl backdrop-blur-3xl">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-lg font-bold tracking-tight">
                <div className="rounded-full bg-red-500/10 p-2.5 ring-1 ring-red-500/20">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                Allergens & ingredients
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {nutrition?.allergens && nutrition.allergens.length > 0 ? (
                <>
                  <div className="flex items-start gap-3 rounded-2xl border border-red-500/10 bg-red-500/[0.03] p-4">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <p className="text-xs leading-relaxed font-medium text-red-400/90">
                      Check the list below if you have food allergies or
                      intolerances.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {nutrition.allergens.map((allergen) => {
                      const clean = allergen.replace(/^en:/i, '').trim();
                      const Icon =
                        ALLERGEN_ICONS[clean.toLowerCase()] ?? AlertTriangle;
                      return (
                        <div
                          key={allergen}
                          className="flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-center"
                        >
                          <div className="rounded-full bg-red-500/10 p-3 ring-1 ring-red-500/20">
                            <Icon className="h-5 w-5 text-red-500" />
                          </div>
                          <span className="text-xs font-bold tracking-wide text-white/80 uppercase">
                            {clean}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4 rounded-full border border-emerald-500/20 bg-emerald-500/10 p-6">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium text-white/60">
                    No allergen data listed for this product.
                  </p>
                </div>
              )}

              {nutrition?.ingredients?.trim() && (
                <div className="border-t border-white/5 pt-6">
                  <p className="mb-2 text-[10px] font-black tracking-widest text-white/30 uppercase">
                    Ingredients
                  </p>
                  <p className="text-sm leading-relaxed text-white/60">
                    {nutrition.ingredients.trim()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ——— Minimal product: nothing else to show ——— */}
      {!hasDetails && !hasNutrition && !hasSafety && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-white/10 bg-white/[0.02] py-12 text-center"
        >
          <Info className="mb-3 h-10 w-10 text-white/20" />
          <p className="text-sm font-medium text-white/40">
            No extra details available for this barcode. What you see above is
            what we have.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

function MacroRow({
  label,
  value,
  color,
}: {
  label: string;
  value?: number;
  color: string;
}) {
  const num = value ?? 0;
  const pct = Math.min((num / 100) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="font-bold tracking-wide text-white/40 uppercase">
          {label}
        </span>
        <span className="font-mono font-bold text-white/80">{num}g</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full', color)}
        />
      </div>
    </div>
  );
}

function NutrientStat({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value?: number;
  unit: string;
  color?: string;
}) {
  const num = value ?? 0;
  return (
    <div className="flex flex-col items-center rounded-2xl border border-white/5 bg-white/[0.03] p-4">
      <p className="mb-1 text-[10px] font-bold tracking-widest text-white/30 uppercase">
        {label}
      </p>
      <span className={cn('text-lg font-black', color ?? 'text-white')}>
        {num}
        <span className="ml-0.5 text-[10px] font-bold text-white/30">
          {unit}
        </span>
      </span>
    </div>
  );
}
