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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductDetailProps {
  product: ProductResponseDto;
  cacheStatus?: 'hit' | 'miss';
}

const NUTRITION_GRADES = {
  A: { color: 'bg-green-600', text: 'Excellent' },
  B: { color: 'bg-green-500', text: 'Good' },
  C: { color: 'bg-yellow-500', text: 'Fair' },
  D: { color: 'bg-orange-500', text: 'Poor' },
  E: { color: 'bg-red-600', text: 'Very Poor' },
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
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
      {/* Product Hero */}
      <Card className="overflow-hidden border-white/5 bg-white/[0.02] backdrop-blur-md">
        <div className="flex flex-col md:flex-row">
          <div className="relative h-64 w-full flex-shrink-0 bg-white/5 md:w-64">
            {images && images.length > 0 && images[0] ? (
              <Image
                src={images[0]}
                alt={name || 'Product'}
                fill
                className="object-contain p-4 transition-transform duration-500 hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-black tracking-widest text-white/10 uppercase">
                No Image
              </div>
            )}
            {cacheStatus === 'hit' && (
              <div className="absolute top-2 right-2">
                <Badge
                  variant="secondary"
                  className="border-cyan-500/30 bg-cyan-500/20 text-cyan-400 backdrop-blur-md"
                >
                  Cached
                </Badge>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-4 p-6">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-white/10 text-[10px] tracking-wider text-white/50 uppercase"
                >
                  {category || 'Uncategorized'}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-white/10 text-[10px] tracking-wider text-white/50 uppercase"
                >
                  {barcode}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {name || 'Unknown Product'}
              </h2>
              <p className="text-muted-foreground font-medium">
                {brand || 'Generic Brand'}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Database className="h-3 w-3" />
                <span>
                  Source:{' '}
                  <span className="text-white/70 capitalize">{source}</span>
                </span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <History className="h-3 w-3" />
                <span>
                  Updated:{' '}
                  <span className="text-white/70">
                    {new Date(lastUpdated).toLocaleDateString()}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Nutrition Visualization */}
        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-yellow-500" />
              Nutrition Facts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {nutrition ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm font-medium">
                      Nutri-Score
                    </p>
                    <div className="flex items-center gap-2">
                      {['A', 'B', 'C', 'D', 'E'].map((g) => (
                        <div
                          key={g}
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold transition-all duration-300',
                            nutrition.grade === g
                              ? NUTRITION_GRADES[
                                  g as keyof typeof NUTRITION_GRADES
                                ].color +
                                  ' shadow- scale-110 shadow-lg' +
                                  NUTRITION_GRADES[
                                    g as keyof typeof NUTRITION_GRADES
                                  ].color +
                                  '/20'
                              : 'bg-white/5 text-white/20'
                          )}
                        >
                          {g}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-orange-400">
                      <Flame className="h-4 w-4" />
                      <span className="text-2xl font-black">
                        {nutrition.calories || 0}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[10px] tracking-widest uppercase">
                      kcal / 100g
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <MacroRow
                    label="Carbohydrates"
                    value={nutrition.carbs}
                    color="bg-blue-500"
                    total={100}
                  />
                  <MacroRow
                    label="Proteins"
                    value={nutrition.protein}
                    color="bg-green-500"
                    total={100}
                  />
                  <MacroRow
                    label="Fats"
                    value={nutrition.fat}
                    color="bg-yellow-500"
                    total={100}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <NutrientStat
                    label="Sugar"
                    value={nutrition.sugar}
                    unit="g"
                  />
                  <NutrientStat
                    label="Fiber"
                    value={nutrition.fiber}
                    unit="g"
                  />
                  <NutrientStat label="Salt" value={nutrition.salt} unit="g" />
                </div>
              </>
            ) : (
              <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
                <Info className="mb-2 h-8 w-8 opacity-20" />
                <p className="text-sm">Nutrition data unavailable</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Allergen Warnings */}
        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Allergen Advisory
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nutrition?.allergens && nutrition.allergens.length > 0 ? (
              <div className="space-y-4">
                <p className="text-muted-foreground text-xs">
                  Based on the product&apos;s ingredient list, the following
                  allergens are present or potentially present:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {nutrition.allergens.map((allergen) => {
                    const cleanAllergen = allergen.replace('en:', '').trim();
                    const Icon =
                      ALLERGEN_ICONS[cleanAllergen.toLowerCase()] ||
                      AlertTriangle;
                    return (
                      <div
                        key={allergen}
                        className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-400"
                      >
                        <div className="rounded-lg bg-red-500/20 p-2">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold capitalize">
                          {cleanAllergen}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 animate-pulse rounded-full border border-green-500/20 bg-green-500/10 p-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <p className="font-semibold text-white">
                  No Common Allergens Detected
                </p>
                <p className="text-muted-foreground mt-1 max-w-[200px] text-xs">
                  Always check the physical label before consuming if you have
                  severe allergies.
                </p>
              </div>
            )}

            {nutrition?.ingredients && (
              <div className="mt-6 border-t border-white/5 pt-6">
                <p className="text-muted-foreground mb-2 text-[10px] font-bold tracking-widest uppercase">
                  Ingredients List
                </p>
                <p className="text-muted-foreground line-clamp-4 text-xs leading-relaxed transition-all duration-300 hover:line-clamp-none">
                  {nutrition.ingredients}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
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
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-white/70">{label}</span>
        <span className="font-mono font-bold text-white">{value || 0}g</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out',
            color
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function NutrientStat({
  label,
  value,
  unit,
}: {
  label: string;
  value?: number;
  unit: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-white/5 bg-white/5 p-3">
      <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-wider uppercase">
        {label}
      </p>
      <div className="flex items-baseline gap-0.5">
        <span className="text-lg font-black text-white">{value || 0}</span>
        <span className="text-muted-foreground text-[10px] font-medium">
          {unit}
        </span>
      </div>
    </div>
  );
}
