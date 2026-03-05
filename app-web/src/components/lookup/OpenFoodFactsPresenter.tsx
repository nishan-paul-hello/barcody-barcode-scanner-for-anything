'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Package,
  Layers,
  Image as ImageIcon,
  FlaskConical,
  Barcode,
  Activity,
  Leaf,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OpenFoodFactsPresenterProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

// ─── Placeholder when no image is available ────────────────────────────────────
const ImagePlaceholder = () => (
  <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-emerald-950/20">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-32 w-32 rounded-full bg-emerald-500/10 blur-[70px]" />
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

// ─── Single spec grid cell ────────────────────────────────────────────────────
const SpecCell = ({
  label,
  value,
  colorClass = 'hover:border-emerald-500/25 group-hover:text-emerald-400/60',
}: {
  label: string;
  value: string;
  colorClass?: string;
}) => (
  <div
    className={cn(
      'group flex flex-col gap-1.5 rounded-xl border border-white/[0.04] bg-white/[0.015] p-3.5 transition-all hover:bg-white/[0.035]',
      colorClass.split(' ')[0]
    )}
  >
    <span
      className={cn(
        'text-[10px] font-black tracking-widest text-slate-500 uppercase transition-colors',
        colorClass.split(' ')[1]
      )}
    >
      {label}
    </span>
    <span className="text-sm leading-tight font-bold text-slate-200">
      {value}
    </span>
  </div>
);

// ─── Nutrition-specific cell ──────────────────────────────────────────────────
const NutriCell = ({
  label,
  value,
  unit = 'g',
}: {
  label: string;
  value: string | number;
  unit?: string;
}) => (
  <div className="group flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.015] p-3 transition-all hover:border-emerald-500/20 hover:bg-white/[0.03]">
    <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-300/70">
      {label}
    </span>
    <div className="flex items-baseline gap-0.5">
      <span className="text-sm font-black text-slate-100 italic">
        {typeof value === 'number' ? value.toFixed(1) : value}
      </span>
      <span className="text-[10px] font-bold text-slate-500 uppercase">
        {unit}
      </span>
    </div>
  </div>
);

// ─── Score Badge (Nutri-Score, Nova, Eco-Score) ──────────────────────────────
const ScoreBadge = ({
  type,
  score,
}: {
  type: 'nutriscore' | 'nova' | 'ecoscore';
  score: string | number;
}) => {
  const colors: Record<string, string> = {
    a: 'bg-emerald-500 text-emerald-950',
    b: 'bg-green-500 text-green-950',
    c: 'bg-yellow-500 text-yellow-950',
    d: 'bg-orange-500 text-orange-950',
    e: 'bg-red-500 text-red-950',
    '1': 'bg-emerald-500 text-emerald-950',
    '2': 'bg-yellow-500 text-yellow-950',
    '3': 'bg-orange-500 text-orange-950',
    '4': 'bg-red-500 text-red-950',
  };

  const labels: Record<string, string> = {
    nutriscore: 'Nutri-Score',
    nova: 'NOVA',
    ecoscore: 'Eco-Score',
  };

  const val = String(score).toLowerCase();
  const bgClass = colors[val] || 'bg-slate-700 text-slate-300';

  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-white/10 shadow-lg">
      <div className="bg-white/5 px-2 py-1 text-[10px] font-black tracking-tighter text-white/60 uppercase backdrop-blur-md">
        {labels[type]}
      </div>
      <div
        className={cn(
          'px-3 py-1 text-xs font-black uppercase ring-1 ring-white/10 ring-inset',
          bgClass
        )}
      >
        {score}
      </div>
    </div>
  );
};

// ─── Category breadcrumb ──────────────────────────────────────────────────────
const CategoryPath = ({ path }: { path: string[] }) => (
  <div className="flex flex-wrap items-center gap-1.5">
    {path.map((segment, i) => (
      <span key={segment} className="flex items-center gap-1.5">
        {i > 0 && (
          <ChevronRight className="h-2.5 w-2.5 shrink-0 text-white/15" />
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
export function OpenFoodFactsPresenter({ data }: OpenFoodFactsPresenterProps) {
  const [imgBroken, setImgBroken] = useState(false);
  const [imgReady, setImgReady] = useState(false);

  const product = data?.product;

  if (!product) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-emerald-950/20 text-slate-500">
        <Package className="h-10 w-10 opacity-30" />
        <p className="text-sm font-medium">
          No product data found in Open Food Facts
        </p>
      </div>
    );
  }

  const {
    product_name,
    brands,
    ingredients_text,
    image_url,
    image_front_url,
    categories,
    categories_hierarchy = [],
    nutriments = {},
    nutriscore_grade,
    nova_group,
    ecoscore_grade,
    serving_size,
    quantity,
    packaging,
    lc,
    code,
    allergens,
    traces,
    additives_tags = [],
    labels,
    ingredients_analysis_tags = [],
    stores,
    countries,
  } = product;

  const imageUrl = image_url || image_front_url;
  const hasImage = !!imageUrl && !imgBroken;

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
  const ingredientList = !isDataEmpty(ingredients_text)
    ? ingredients_text
        .split(/[,;:]+/) // Split by comma, semicolon or colon
        .map((item: string) => item.replace(/[*\-_()[\]]/g, '').trim()) // Cleanup marks
        .filter((item: string) => item.length > 1 && !/^\d+$/.test(item)) // Remove tiny/numeric stuff
    : [];

  // Format categories hierarchy
  const catPath = categories_hierarchy
    .map(
      (c: string) => c.split(':')[1]?.replace(/-/g, ' ') || c.replace(/-/g, ' ')
    )
    .map((c: string) => c.charAt(0).toUpperCase() + c.slice(1))
    .slice(-4); // Take the most specific 4

  // Parse dietary info
  const isVegan = ingredients_analysis_tags.some((t: string) =>
    t.includes('vegan')
  );
  const isVeggie = ingredients_analysis_tags.some((t: string) =>
    t.includes('vegetarian')
  );

  // Clean additives
  const additives = additives_tags.map(
    (t: string) => t.split(':')[1]?.toUpperCase() || t.toUpperCase()
  );

  // Clean allergens/traces
  const allergenList = (allergens || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);
  const traceList = (traces || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);

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
        className="relative overflow-hidden rounded-3xl border border-emerald-500/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Image col */}
          <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40 md:w-56">
            {hasImage ? (
              <>
                {/* silent preloader */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt=""
                  style={{ display: 'none' }}
                  onLoad={() => setImgReady(true)}
                  onError={() => setImgBroken(true)}
                />
                <AnimatePresence>
                  {!imgReady && (
                    <motion.div
                      key="ph"
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
                    className="absolute inset-0"
                  >
                    <Image
                      src={imageUrl}
                      alt={product_name || 'Product image'}
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

          {/* Info col */}
          <div className="flex flex-1 flex-col gap-4 py-1">
            <div className="flex flex-wrap items-center gap-3">
              {nutriscore_grade && (
                <ScoreBadge type="nutriscore" score={nutriscore_grade} />
              )}
              {nova_group && <ScoreBadge type="nova" score={nova_group} />}
              {ecoscore_grade && (
                <ScoreBadge type="ecoscore" score={ecoscore_grade} />
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl leading-tight font-black tracking-tight text-white md:text-3xl">
                {product_name || 'Unknown Product'}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                {brands && (
                  <Badge className="border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-emerald-300 uppercase">
                    {brands}
                  </Badge>
                )}
                <Badge className="border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-sky-300 uppercase">
                  {(lc || 'EN').toUpperCase()}
                </Badge>
              </div>
            </div>

            {catPath.length > 0 && <CategoryPath path={catPath} />}

            <div className="h-px w-full bg-white/[0.06]" />

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.08] px-3 py-1.5 ring-1 ring-emerald-500/20">
                <Barcode className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span className="font-mono text-xs tracking-wider text-emerald-200/80">
                  {code}
                </span>
              </div>
              <a
                href={`https://world.openfoodfacts.org/product/${code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400 transition-all hover:bg-white/10 hover:text-white"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                OFF Page
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Lower grid ────────────────────────────────────────────────────── */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Left Col: Ingredients + Nutrition Summary */}
        <motion.div variants={card} className="space-y-5">
          {/* Ingredients */}
          {ingredientList.length > 0 && (
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="rounded-lg bg-emerald-500/15 p-1.5">
                  <FlaskConical className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <h3 className="text-xs font-black tracking-[0.15em] text-emerald-300/80 uppercase">
                  Ingredients
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {ingredientList.map((ingredient: string) => (
                  <div
                    key={ingredient}
                    className="group rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-1.5 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/10"
                  >
                    <span className="text-xs font-semibold tracking-tight text-slate-300 uppercase tabular-nums transition-colors group-hover:text-emerald-100">
                      {ingredient}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nutrition Grid */}
          {Object.keys(nutriments).length > 0 && (
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-sky-500/15 p-1.5">
                    <Activity className="h-3.5 w-3.5 text-sky-400" />
                  </div>
                  <h3 className="text-xs font-black tracking-[0.15em] text-sky-300/80 uppercase">
                    Nutrition
                  </h3>
                </div>
                <span className="text-[10px] font-black tracking-widest text-white/20 uppercase">
                  Per 100g/ml
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {nutriments['energy-kcal_100g'] !== undefined && (
                  <div className="col-span-2">
                    <NutriCell
                      label="Energy"
                      value={nutriments['energy-kcal_100g']}
                      unit="kcal"
                    />
                  </div>
                )}
                {nutriments.fat_100g !== undefined && (
                  <NutriCell label="Fat" value={nutriments.fat_100g} />
                )}
                {nutriments['saturated-fat_100g'] !== undefined && (
                  <NutriCell
                    label="Sat. Fat"
                    value={nutriments['saturated-fat_100g']}
                  />
                )}
                {nutriments.carbohydrates_100g !== undefined && (
                  <NutriCell
                    label="Carbs"
                    value={nutriments.carbohydrates_100g}
                  />
                )}
                {nutriments.sugars_100g !== undefined && (
                  <NutriCell label="Sugars" value={nutriments.sugars_100g} />
                )}
                {nutriments.proteins_100g !== undefined && (
                  <NutriCell
                    label="Proteins"
                    value={nutriments.proteins_100g}
                  />
                )}
                {nutriments.salt_100g !== undefined && (
                  <NutriCell label="Salt" value={nutriments.salt_100g} />
                )}
                {nutriments.fiber_100g !== undefined && (
                  <NutriCell label="Fiber" value={nutriments.fiber_100g} />
                )}
              </div>
            </div>
          )}

          {/* Safety & Dietary Section */}
          {(allergenList.length > 0 ||
            traceList.length > 0 ||
            isVegan ||
            isVeggie ||
            additives.length > 0) && (
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="rounded-lg bg-red-500/15 p-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                </div>
                <h3 className="text-xs font-black tracking-[0.15em] text-red-300/80 uppercase">
                  Safety & Dietary
                </h3>
              </div>

              <div className="space-y-4">
                {/* Badges for Vegan/Veggie */}
                <div className="flex flex-wrap gap-2">
                  {isVegan && (
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-[10px] font-black text-emerald-400 uppercase">
                      <ShieldCheck className="h-3 w-3" /> Vegan
                    </div>
                  )}
                  {isVeggie && (
                    <div className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/15 px-3 py-1 text-[10px] font-black text-green-400 uppercase">
                      <ShieldCheck className="h-3 w-3" /> Vegetarian
                    </div>
                  )}
                </div>

                {allergenList.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black tracking-widest text-red-400/60 uppercase">
                      Allergens
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {allergenList.map((a: string) => (
                        <span
                          key={a}
                          className="rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-200/70"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {additives.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black tracking-widest text-amber-400/60 uppercase">
                      Additives
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {additives.map((a: string) => (
                        <span
                          key={a}
                          className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] text-amber-200/70"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Right Col: Attributes + Description */}
        <motion.div variants={card} className="space-y-5">
          {/* Attributes Grid */}
          {(quantity || serving_size || packaging || categories) && (
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
              <div className="mb-5 flex items-center gap-2.5">
                <div className="rounded-lg bg-violet-500/15 p-1.5">
                  <Layers className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <h3 className="text-xs font-black tracking-[0.15em] text-violet-300/80 uppercase">
                  Details
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {quantity && (
                  <SpecCell
                    label="Quantity"
                    value={quantity}
                    colorClass="hover:border-violet-500/25 group-hover:text-violet-400/60"
                  />
                )}
                {serving_size && (
                  <SpecCell
                    label="Serving"
                    value={serving_size}
                    colorClass="hover:border-violet-500/25 group-hover:text-violet-400/60"
                  />
                )}
                {packaging && (
                  <SpecCell
                    label="Packaging"
                    value={packaging}
                    colorClass="hover:border-violet-500/25 group-hover:text-violet-400/60"
                  />
                )}
                {categories && (
                  <div className="col-span-full">
                    <SpecCell
                      label="Categories"
                      value={categories}
                      colorClass="hover:border-violet-500/25 group-hover:text-violet-400/60"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Environmental / Extra tags */}
          {(ecoscore_grade || labels) && (
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="rounded-lg bg-amber-500/15 p-1.5">
                  <Leaf className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <h3 className="text-xs font-black tracking-[0.15em] text-amber-300/80 uppercase">
                  Sustainability & Labels
                </h3>
              </div>

              <div className="space-y-4">
                {ecoscore_grade && (
                  <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-4 ring-1 ring-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-300">
                        Eco-Score
                      </span>
                      <ScoreBadge type="ecoscore" score={ecoscore_grade} />
                    </div>
                  </div>
                )}

                {labels && (
                  <div className="flex flex-wrap gap-1.5">
                    {labels.split(',').map((l: string) => (
                      <span
                        key={l.trim()}
                        className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-300/60 uppercase"
                      >
                        {l.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Logistics */}
          {(stores || countries) && (
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="rounded-lg bg-sky-500/15 p-1.5">
                  <MapPin className="h-3.5 w-3.5 text-sky-400" />
                </div>
                <h3 className="text-xs font-black tracking-[0.15em] text-sky-300/80 uppercase">
                  Availability
                </h3>
              </div>
              <div className="space-y-3">
                {countries && (
                  <div className="flex flex-wrap gap-1.5">
                    {countries.split(',').map((c: string) => (
                      <span
                        key={c.trim()}
                        className="rounded border border-white/5 bg-white/5 px-2 py-0.5 text-xs font-medium text-slate-400"
                      >
                        {c.trim()}
                      </span>
                    ))}
                  </div>
                )}
                {stores && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="text-[10px] font-black text-slate-600 uppercase">
                      Stores:
                    </span>
                    <span className="font-bold text-slate-300">{stores}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
