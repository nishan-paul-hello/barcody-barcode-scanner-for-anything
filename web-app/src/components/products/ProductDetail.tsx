'use client';

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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProductDetailProps {
  product: ProductResponseDto;
  cacheStatus?: 'hit' | 'miss';
}

const NUTRITION_GRADES = {
  A: {
    color: 'bg-emerald-500',
    text: 'Excellent',
  },
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
};

export function ProductDetail({ product, cacheStatus }: ProductDetailProps) {
  const {
    nutrition,
    images,
    name,
    brand,
    barcode,
    category,
    source,
    lastUpdated,
  } = product;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Product Hero */}
      <Card className="group overflow-hidden rounded-[2.5rem] border-white/5 bg-black/40 shadow-2xl backdrop-blur-3xl">
        <div className="flex flex-col md:flex-row">
          <div className="relative aspect-square w-full flex-shrink-0 bg-white/[0.03] p-12 md:w-80">
            {images && images.length > 0 && images[0] ? (
              <div className="relative h-full w-full">
                <Image
                  src={images[0]}
                  alt={name || 'Product'}
                  fill
                  className="object-contain transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <div className="rounded-full bg-white/5 p-4">
                  <Search className="h-8 w-8 text-white/10" />
                </div>
                <span className="text-[10px] font-black tracking-widest text-white/10 uppercase">
                  No Image Found
                </span>
              </div>
            )}
            {cacheStatus === 'hit' && (
              <div className="absolute top-6 right-6">
                <Badge className="border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-cyan-400 uppercase ring-1 ring-cyan-500/20 backdrop-blur-md">
                  <Layers className="mr-1.5 h-3 w-3" />
                  Cached
                </Badge>
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col justify-center space-y-6 p-10">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge className="rounded-full border-cyan-500/10 bg-cyan-500/5 px-4 py-1 text-[10px] font-black tracking-widest text-cyan-500/80 uppercase backdrop-blur-sm">
                  {category || 'Uncategorized'}
                </Badge>
                <Badge className="rounded-full border-white/5 bg-white/5 px-4 py-1 font-mono text-[10px] font-bold tracking-wider text-white/30 uppercase">
                  # {barcode}
                </Badge>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white lg:text-4xl">
                {name || 'Unknown Entity'}
              </h2>
              <p className="text-xl font-medium tracking-wide text-white/40">
                {brand || 'Generic Source'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 border-t border-white/5 pt-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-full bg-white/5 p-2">
                  <Database className="h-3.5 w-3.5 text-white/30" />
                </div>
                <span className="text-[11px] font-bold tracking-widest text-white/30 uppercase">
                  Provider: <span className="ml-1 text-white/60">{source}</span>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="rounded-full bg-white/5 p-2">
                  <History className="h-3.5 w-3.5 text-white/30" />
                </div>
                <span className="text-[11px] font-bold tracking-widest text-white/30 uppercase">
                  Last Sync:{' '}
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

      <div className="grid gap-8 md:grid-cols-2">
        {/* Nutrition Visualization */}
        <Card className="rounded-[2.5rem] border-white/5 bg-black/40 shadow-xl backdrop-blur-3xl">
          <CardHeader className="pb-8">
            <CardTitle className="flex items-center gap-4 text-xl font-bold tracking-tight">
              <div className="rounded-full bg-yellow-500/10 p-2.5 ring-1 ring-yellow-500/20">
                <Zap className="h-6 w-6 text-yellow-500" />
              </div>
              Macronutrient Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {nutrition ? (
              <>
                <div className="flex items-center justify-between rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-sm transition-all hover:bg-white/[0.05]">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase">
                      Analysis Grade
                    </p>
                    <div className="flex items-center gap-3">
                      {['A', 'B', 'C', 'D', 'E'].map((g) => (
                        <div
                          key={g}
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black ring-1 transition-all duration-500',
                              nutrition.grade === g
                                ? NUTRITION_GRADES[
                                    g as keyof typeof NUTRITION_GRADES
                                  ].color +
                                  ' text-white ring-white/20'
                                : 'bg-white/5 text-white/10 ring-transparent hover:bg-white/10'
                          )}
                        >
                          {g}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5 text-orange-400">
                      <Flame className="h-5 w-5 animate-pulse" />
                      <span className="text-3xl font-black tracking-tighter">
                        {nutrition.calories || 0}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold tracking-[0.3em] text-white/20 uppercase">
                      Energy Units
                    </p>
                  </div>
                </div>

                <div className="space-y-6 px-2">
                  <MacroRow
                    label="Carbohydrates"
                    value={nutrition.carbs}
                    color="bg-blue-500"
                    total={100}
                  />
                  <MacroRow
                    label="Proteins"
                    value={nutrition.protein}
                    color="bg-emerald-500"
                    total={100}
                  />
                  <MacroRow
                    label="Fats"
                    value={nutrition.fat}
                    color="bg-amber-500"
                    total={100}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <NutrientStat
                    label="Sugar"
                    value={nutrition.sugar}
                    unit="g"
                    color="text-pink-400"
                  />
                  <NutrientStat
                    label="Fiber"
                    value={nutrition.fiber}
                    unit="g"
                    color="text-indigo-400"
                  />
                  <NutrientStat
                    label="Salt"
                    value={nutrition.salt}
                    unit="g"
                    color="text-rose-400"
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-6 rounded-full border border-white/5 bg-white/5 p-6">
                  <Info className="h-10 w-10 text-white/10" />
                </div>
                <p className="text-sm font-bold tracking-widest text-white/20 uppercase">
                  Data Stream Empty
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Allergen Warnings */}
        <Card className="rounded-[2.5rem] border-white/5 bg-black/40 shadow-xl backdrop-blur-3xl">
          <CardHeader className="pb-8">
            <CardTitle className="flex items-center gap-4 text-xl font-bold tracking-tight">
              <div className="rounded-full bg-red-500/10 p-2.5 ring-1 ring-red-500/20">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              Safety Protocol
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nutrition?.allergens && nutrition.allergens.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-start gap-4 rounded-[2rem] border border-red-500/10 bg-red-500/[0.03] p-6">
                  <div className="shrink-0 rounded-full bg-red-500/20 p-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-xs leading-relaxed font-medium text-red-400/80">
                    Analysis detected high-risk molecules. Please observe the
                    following warnings before processing for consumption.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {nutrition.allergens.map((allergen) => {
                    const cleanAllergen = allergen.replace('en:', '').trim();
                    const Icon =
                      ALLERGEN_ICONS[cleanAllergen.toLowerCase()] ||
                      AlertTriangle;
                    return (
                      <div
                        key={allergen}
                        className="group flex flex-col items-center gap-4 rounded-3xl border border-white/5 bg-white/[0.03] p-6 text-center transition-all hover:scale-105 hover:bg-white/[0.08]"
                      >
                        <div className="rounded-full bg-red-500/10 p-4 ring-1 ring-red-500/20 transition-all group-hover:bg-red-500/20">
                          <Icon className="h-6 w-6 text-red-500" />
                        </div>
                        <span className="text-xs font-black tracking-widest text-white/80 uppercase">
                          {cleanAllergen}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="mb-8 rounded-full border border-emerald-500/20 bg-emerald-500/10 p-8 ring-1 ring-emerald-500/30"
                >
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                </motion.div>
                <h3 className="text-lg font-bold tracking-tight text-white/90">
                  Clean Signature
                </h3>
                <p className="mt-4 max-w-[240px] text-xs leading-relaxed text-white/40">
                  No common high-risk triggers identified in the current scan
                  layer.
                </p>
              </div>
            )}

            {nutrition?.ingredients && (
              <div className="mt-10 border-t border-white/5 pt-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-0.5 w-4 bg-cyan-500/50" />
                  <p className="text-[10px] font-black tracking-[0.3em] text-white/20 uppercase">
                    Composition Matrix
                  </p>
                </div>
                <p className="text-muted-foreground line-clamp-4 text-xs leading-relaxed font-medium transition-all duration-500 hover:line-clamp-none hover:text-white/60">
                  {nutrition.ingredients}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function MacroRow({
  label,
  value,
  color,
  total,
}: {
  label: string;
  value?: number;
  color: string;
  total: number;
}) {
  const percentage = value ? Math.min((value / total) * 100, 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-bold tracking-widest text-white/40 uppercase">
          {label}
        </span>
        <span className="font-mono text-xs font-black text-white">
          {value || 0}g
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-white/[0.02]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full',
            color
          )}
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
  return (
    <div className="group flex flex-col items-center rounded-3xl border border-white/5 bg-white/[0.03] p-5 transition-all hover:bg-white/[0.08]">
      <p className="mb-2 text-[10px] font-black tracking-widest text-white/20 uppercase transition-colors group-hover:text-white/40">
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            'text-xl font-black transition-all group-hover:scale-110',
            color || 'text-white'
          )}
        >
          {value || 0}
        </span>
        <span className="text-[10px] font-bold text-white/20">{unit}</span>
      </div>
    </div>
  );
}
