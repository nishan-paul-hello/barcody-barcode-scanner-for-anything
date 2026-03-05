'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import type { ProductResponseDto, ProductAttribute } from '@/lib/api/types';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Info,
  Database,
  History,
  Flame,
  Leaf,
  Layers,
  Building2,
  ChevronDown,
  ChevronUp,
  Package,
  BarChart3,
  ShieldCheck,
  Hash,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// ─── constants ───────────────────────────────────────────────────────────────

const SOURCE_LABELS: Record<ProductResponseDto['source'], string> = {
  openfoodfacts: 'Open Food Facts',
  upcdatabase: 'UPC Database',
};

const NUTRITION_GRADES = {
  A: {
    bg: 'bg-emerald-500',
    ring: 'ring-emerald-500/40',
    glow: 'shadow-emerald-500/30',
    label: 'Excellent',
  },
  B: {
    bg: 'bg-green-500',
    ring: 'ring-green-500/40',
    glow: 'shadow-green-500/30',
    label: 'Good',
  },
  C: {
    bg: 'bg-yellow-500',
    ring: 'ring-yellow-500/40',
    glow: 'shadow-yellow-500/30',
    label: 'Fair',
  },
  D: {
    bg: 'bg-orange-500',
    ring: 'ring-orange-500/40',
    glow: 'shadow-orange-500/30',
    label: 'Poor',
  },
  E: {
    bg: 'bg-red-500',
    ring: 'ring-red-500/40',
    glow: 'shadow-red-500/30',
    label: 'Very Poor',
  },
};

const MACROS = [
  {
    key: 'protein',
    label: 'Protein',
    color: 'bg-blue-500',
    track: 'bg-blue-500/10',
    text: 'text-blue-400',
    max: 50,
  },
  {
    key: 'carbs',
    label: 'Carbs',
    color: 'bg-amber-500',
    track: 'bg-amber-500/10',
    text: 'text-amber-400',
    max: 130,
  },
  {
    key: 'fat',
    label: 'Fat',
    color: 'bg-rose-500',
    track: 'bg-rose-500/10',
    text: 'text-rose-400',
    max: 78,
  },
  {
    key: 'fiber',
    label: 'Fiber',
    color: 'bg-emerald-500',
    track: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    max: 38,
  },
  {
    key: 'sugar',
    label: 'Sugar',
    color: 'bg-pink-500',
    track: 'bg-pink-500/10',
    text: 'text-pink-400',
    max: 50,
  },
  {
    key: 'salt',
    label: 'Salt',
    color: 'bg-violet-500',
    track: 'bg-violet-500/10',
    text: 'text-violet-400',
    max: 6,
  },
];

// ─── types ───────────────────────────────────────────────────────────────────

interface ProductDetailProps {
  product: ProductResponseDto;
  cacheStatus?: 'hit' | 'miss';
}

// How a single attribute value should be rendered
type ValueShape = 'stat' | 'grade' | 'chips' | 'prose' | 'label';

// How a group's safety level should affect styling
type GroupSemantic = 'safety' | 'identity' | 'default';

// ─── pure helpers ─────────────────────────────────────────────────────────────

/** Classify how to render a single value based purely on its content */
function detectValueShape(value: string | number): ValueShape {
  if (typeof value === 'number') {
    return 'stat';
  }
  const str = String(value).trim();

  // Is it a parseable number?
  if (/^\d+(\.\d+)?$/.test(str)) {
    return 'stat';
  }

  // Grade scale A–E
  if (/^[A-E]$/.test(str)) {
    return 'grade';
  }

  // Comma-separated list with 4+ parts (ingredients, tags, categories…)
  const parts = str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length >= 4 && str.length > 50) {
    return 'chips';
  }

  // Long freeform text (>90 chars)
  if (str.length > 90) {
    return 'prose';
  }

  return 'label';
}

/** Classify a group's safety/identity signal from its name alone */
function detectGroupSemantic(group: string): GroupSemantic {
  const g = group.toLowerCase();
  if (
    ['safety', 'warning', 'hazard', 'allergen', 'danger'].some((k) =>
      g.includes(k)
    )
  ) {
    return 'safety';
  }
  if (
    [
      'manufacturer',
      'brand',
      'company',
      'identity',
      'classification',
      'origin',
    ].some((k) => g.includes(k))
  ) {
    return 'identity';
  }
  return 'default';
}

/** Returns true if EVERY attribute in the group is a numeric stat */
function isAllStats(attrs: ProductAttribute[]): boolean {
  return attrs.every((a) => detectValueShape(a.value) === 'stat');
}

/** Returns true if at least one attribute in the group is a plain numeric */
function isFood(
  source: string,
  attributes: ProductAttribute[] | undefined
): boolean {
  if (source === 'openfoodfacts') {
    return true;
  }
  const groups = new Set((attributes ?? []).map((a) => a.group));
  return groups.has('Nutrition');
}

// ─── food sub-components (kept exactly as loved) ──────────────────────────────

function MacroBar({
  label,
  value,
  unit,
  color,
  track,
  text,
  max,
}: {
  label: string;
  value: number | string;
  unit?: string;
  color: string;
  track: string;
  text: string;
  max: number;
}) {
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  const pct = Math.min(100, Math.round((num / max) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span
          className={cn(
            'text-[11px] font-black tracking-widest uppercase',
            text
          )}
        >
          {label}
        </span>
        <span className="text-sm font-black text-white/80">
          {typeof value === 'number' ? value.toFixed(1) : value}
          {unit && (
            <span className="ml-0.5 text-[10px] font-bold text-white/25">
              {unit}
            </span>
          )}
        </span>
      </div>
      <div className={cn('h-2 w-full overflow-hidden rounded-full', track)}>
        <motion.div
          className={cn('h-full rounded-full', color)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
    </div>
  );
}

function AllergenPill({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[11px] font-black tracking-wider text-red-300 uppercase">
      <AlertTriangle className="h-2.5 w-2.5" />
      {name.replace('en:', '')}
    </span>
  );
}

function IngredientList({ value }: { value: string | number }) {
  const raw = String(value);
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length <= 2 || raw.length < 60) {
    return <p className="text-sm leading-relaxed text-white/70">{raw}</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {parts.map((p) => (
        <span
          key={p}
          className="rounded-lg border border-white/5 bg-white/5 px-3 py-1 text-xs font-medium text-white/50 transition-colors hover:border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-300/60"
        >
          {p}
        </span>
      ))}
    </div>
  );
}

function FoodLayout({
  nutrition,
  groupedAttrs,
}: {
  nutrition: ProductResponseDto['nutrition'];
  groupedAttrs: Record<string, ProductAttribute[]>;
}) {
  const grade = nutrition?.grade;
  const gradeInfo = grade ? NUTRITION_GRADES[grade] : null;

  const nutriAttrs = groupedAttrs['Nutrition'] ?? [];
  const ingredientAttr = groupedAttrs['Ingredients']?.[0];
  const allergenAttr = groupedAttrs['Safety']?.find(
    (a) => a.label === 'Allergens'
  );
  const allergens = allergenAttr
    ? String(allergenAttr.value)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const macroValues: Record<string, number | undefined> = {};
  if (nutrition) {
    macroValues.calories = nutrition.calories;
    macroValues.protein = nutrition.protein;
    macroValues.carbs = nutrition.carbs;
    macroValues.fat = nutrition.fat;
    macroValues.fiber = nutrition.fiber;
    macroValues.sugar = nutrition.sugar;
    macroValues.salt = nutrition.salt;
  }
  nutriAttrs.forEach((a) => {
    const key = a.label.toLowerCase();
    if (macroValues[key] === undefined) {
      macroValues[key] = parseFloat(String(a.value));
    }
  });

  return (
    <div className="space-y-6">
      {/* Nutri-Score + Calories */}
      {(gradeInfo || macroValues.calories !== undefined) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4"
        >
          {gradeInfo && grade && (
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-black/40 p-6 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
              <div className="relative flex flex-col gap-3">
                <span className="text-[10px] font-black tracking-[0.2em] text-white/25 uppercase">
                  Nutri-Score
                </span>
                <div className="flex items-end gap-3">
                  <div
                    className={cn(
                      'flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-black text-white shadow-xl ring-2',
                      gradeInfo.bg,
                      gradeInfo.ring,
                      gradeInfo.glow
                    )}
                  >
                    {grade}
                  </div>
                  <div>
                    <p className="text-base font-bold text-white/80">
                      {gradeInfo.label}
                    </p>
                    <p className="text-[10px] text-white/30">Overall Quality</p>
                  </div>
                </div>
                <div className="mt-1 flex gap-1">
                  {(['A', 'B', 'C', 'D', 'E'] as const).map((g) => (
                    <div
                      key={g}
                      className={cn(
                        'flex h-5 flex-1 items-center justify-center rounded text-[9px] font-black text-white transition-all',
                        g === grade
                          ? NUTRITION_GRADES[g].bg
                          : 'bg-white/5 text-white/10'
                      )}
                    >
                      {g}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {macroValues.calories !== undefined && (
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-black/40 p-6 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.04] to-transparent" />
              <div className="relative flex flex-col gap-3">
                <span className="text-[10px] font-black tracking-[0.2em] text-white/25 uppercase">
                  Energy
                </span>
                <div className="flex items-end gap-2">
                  <span className="text-5xl leading-none font-black text-white">
                    {macroValues.calories}
                  </span>
                  <span className="mb-1 text-sm font-bold text-orange-400/70">
                    kcal
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span className="text-[10px] text-white/30">
                    per 100g serving
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Macro bars */}
      {MACROS.some((m) => macroValues[m.key] !== undefined) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl border border-white/5 bg-black/40 p-6 backdrop-blur-xl"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-white/5 p-2.5 ring-1 ring-white/10">
              <BarChart3 className="h-5 w-5 text-white/50" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white/80">
                Nutritional Breakdown
              </h3>
              <p className="text-[10px] text-white/25">per 100g</p>
            </div>
          </div>
          <div className="space-y-4">
            {MACROS.map((macro) => {
              const val = macroValues[macro.key];
              if (val === undefined) {
                return null;
              }
              return (
                <MacroBar
                  key={macro.key}
                  label={macro.label}
                  value={val}
                  unit="g"
                  color={macro.color}
                  track={macro.track}
                  text={macro.text}
                  max={macro.max}
                />
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Ingredients */}
      {ingredientAttr && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-white/5 bg-black/40 p-6 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/10 p-2.5 ring-1 ring-emerald-500/20">
              <Leaf className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="text-sm font-black text-white/80">Ingredients</h3>
          </div>
          <IngredientList value={ingredientAttr.value} />
        </motion.div>
      )}

      {/* Allergens */}
      {allergens.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-red-500/20 p-2.5 ring-1 ring-red-500/30">
              <ShieldCheck className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-red-300">
                Allergen Warning
              </h3>
              <p className="text-[10px] text-red-400/40">
                Contains the following allergens
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {allergens.map((a) => (
              <AllergenPill key={a} name={a} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── universal value renderers ────────────────────────────────────────────────

function RenderStat({
  value,
  unit,
  label,
}: {
  value: string | number;
  unit?: string;
  label: string;
}) {
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  const isInt = Number.isInteger(num);
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-black tracking-[0.18em] text-white/25 uppercase">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl leading-none font-black text-white">
          {isInt ? num : num.toFixed(2)}
        </span>
        {unit && (
          <span className="text-xs font-bold text-white/25 lowercase">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function RenderGrade({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  const g = String(value) as keyof typeof NUTRITION_GRADES;
  const info = NUTRITION_GRADES[g];
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black tracking-[0.18em] text-white/25 uppercase">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white ring-2',
            info?.bg ?? 'bg-white/10',
            info?.ring ?? ''
          )}
        >
          {value}
        </div>
        {info && (
          <span className="text-xs font-bold text-white/40">{info.label}</span>
        )}
      </div>
    </div>
  );
}

function RenderChips({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  const parts = String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    <div className="space-y-2">
      <span className="text-[10px] font-black tracking-[0.18em] text-white/25 uppercase">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {parts.map((p) => (
          <span
            key={p}
            className="rounded-lg border border-white/5 bg-white/5 px-3 py-1 text-xs font-medium text-white/40"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

function RenderProse({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const text = String(value);
  const LIMIT = 200;
  const long = text.length > LIMIT;
  const shown = expanded || !long ? text : text.slice(0, LIMIT) + '…';
  return (
    <div className="space-y-2">
      <span className="text-[10px] font-black tracking-[0.18em] text-white/25 uppercase">
        {label}
      </span>
      <p className="text-sm leading-relaxed text-white/65">{shown}</p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1 text-[10px] font-black tracking-wider text-white/25 uppercase transition-colors hover:text-white/50"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              More
            </>
          )}
        </button>
      )}
    </div>
  );
}

function RenderLabel({
  value,
  unit,
  label,
}: {
  value: string | number;
  unit?: string;
  label: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.04] py-3 last:border-0">
      <span className="shrink-0 text-[10px] font-black tracking-[0.18em] text-white/20 uppercase">
        {label}
      </span>
      <span className="max-w-[58%] text-right text-sm font-bold break-words text-white/75">
        {String(value)}
        {unit && <span className="ml-1 text-[10px] text-white/20">{unit}</span>}
      </span>
    </div>
  );
}

/** Route each attribute to the right renderer */
function AttributeValue({ attr }: { attr: ProductAttribute }) {
  const shape = detectValueShape(attr.value);
  if (shape === 'stat') {
    return (
      <RenderStat value={attr.value} unit={attr.unit} label={attr.label} />
    );
  }
  if (shape === 'grade') {
    return <RenderGrade value={attr.value} label={attr.label} />;
  }
  if (shape === 'chips') {
    return <RenderChips value={attr.value} label={attr.label} />;
  }
  if (shape === 'prose') {
    return <RenderProse value={attr.value} label={attr.label} />;
  }
  return <RenderLabel value={attr.value} unit={attr.unit} label={attr.label} />;
}

// ─── universal group card ─────────────────────────────────────────────────────

function UniversalGroupCard({
  group,
  attrs,
  index,
}: {
  group: string;
  attrs: ProductAttribute[];
  index: number;
}) {
  const semantic = detectGroupSemantic(group);
  const allStats = isAllStats(attrs);

  // stat-only groups → a tight grid of numbered tiles
  const statGrid = allStats && attrs.length >= 2;

  // safety card styling
  const isSafety = semantic === 'safety';
  const isIdentity = semantic === 'identity';

  const cardClass = cn(
    'overflow-hidden rounded-3xl border backdrop-blur-xl transition-all duration-300',
    isSafety
      ? 'border-amber-500/20 bg-amber-500/[0.04]'
      : isIdentity
        ? 'border-white/5 bg-black/30'
        : 'border-white/5 bg-black/40'
  );

  const headerClass = cn(
    'flex items-center gap-3 border-b px-6 py-4',
    isSafety ? 'border-amber-500/15' : 'border-white/5'
  );

  const IconEl = isSafety ? AlertTriangle : isIdentity ? Building2 : TrendingUp;
  const iconWrap = cn(
    'rounded-xl p-2 ring-1',
    isSafety ? 'bg-amber-500/10 ring-amber-500/25' : 'bg-white/5 ring-white/10'
  );
  const iconClass = cn(
    'h-4 w-4',
    isSafety ? 'text-amber-400' : isIdentity ? 'text-white/40' : 'text-white/30'
  );
  const titleClass = cn(
    'text-xs font-black tracking-[0.15em] uppercase',
    isSafety ? 'text-amber-300/70' : 'text-white/35'
  );

  return (
    <motion.div
      className={cardClass}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <div className={headerClass}>
        <div className={iconWrap}>
          <IconEl className={iconClass} />
        </div>
        <h3 className={titleClass}>{group}</h3>
        {isSafety && (
          <span className="ml-auto text-[9px] font-black tracking-wider text-amber-400/40 uppercase">
            ⚠ Review
          </span>
        )}
      </div>

      <div className={cn('p-6', statGrid ? 'space-y-0' : 'space-y-0')}>
        {statGrid ? (
          /* Numeric-only group → 2-column stat grid */
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/5">
            {attrs.map((attr) => (
              <div key={attr.label} className="bg-black/50 p-4">
                <RenderStat
                  value={attr.value}
                  unit={attr.unit}
                  label={attr.label}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Mixed group → render each attribute by shape */
          <div className="space-y-5">
            {attrs.map((attr) => {
              const shape = detectValueShape(attr.value);
              // Prose and chips get their own block; label rows are inline
              const needsBlock =
                shape === 'prose' ||
                shape === 'chips' ||
                shape === 'stat' ||
                shape === 'grade';
              return (
                <div
                  key={attr.label}
                  className={cn(
                    needsBlock &&
                      'rounded-2xl border border-white/5 bg-white/[0.02] p-4'
                  )}
                >
                  <AttributeValue attr={attr} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── universal layout (handles ANY unknown product category) ─────────────────

function UniversalLayout({
  groupedAttrs,
  description,
}: {
  groupedAttrs: Record<string, ProductAttribute[]>;
  description: string | undefined;
}) {
  const groups = Object.entries(groupedAttrs);
  // Safety groups always go last for drama
  const sorted = [
    ...groups.filter(([g]) => detectGroupSemantic(g) !== 'safety'),
    ...groups.filter(([g]) => detectGroupSemantic(g) === 'safety'),
  ];

  const hasAnything = groups.length > 0 || description;

  return (
    <div className="space-y-5">
      {/* Description block if present */}
      {description && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/5 bg-black/40 p-6 backdrop-blur-xl"
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-xl bg-white/5 p-2 ring-1 ring-white/10">
              <Hash className="h-4 w-4 text-white/30" />
            </div>
            <span className="text-xs font-black tracking-[0.15em] text-white/35 uppercase">
              Overview
            </span>
          </div>
          <RenderProse value={description} label="" />
        </motion.div>
      )}

      {/* One card per attribute group */}
      {sorted.map(([group, attrs], i) => (
        <UniversalGroupCard key={group} group={group} attrs={attrs} index={i} />
      ))}

      {!hasAnything && (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/5 py-16 text-center">
          <Info className="mb-3 h-8 w-8 text-white/10" />
          <p className="text-sm font-bold text-white/20">
            No extra detail available for this product.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── hero card (shared) ───────────────────────────────────────────────────────

function HeroCard({
  product,
  cacheStatus,
  isFood: isFoodProduct,
  description,
}: {
  product: ProductResponseDto;
  cacheStatus?: 'hit' | 'miss';
  isFood: boolean;
  description: string | undefined;
}) {
  const {
    images,
    name,
    brand,
    barcode,
    category,
    manufacturer,
    source,
    lastUpdated,
  } = product;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const displayImages = images?.filter(Boolean) ?? [];
  const mainImage = displayImages[selectedIndex] ?? null;
  const hasMultipleImages = displayImages.length > 1;

  const sourceLabel = SOURCE_LABELS[source] ?? source;

  const LIMIT = 240;
  const isLong = (description?.length ?? 0) > LIMIT;
  const shown =
    expanded || !isLong ? description : description?.slice(0, LIMIT) + '…';

  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-black/50 shadow-2xl ring-1 ring-white/5 backdrop-blur-3xl">
      <div className="flex flex-col md:flex-row">
        {/* Image pane */}
        <div className="relative aspect-square w-full flex-shrink-0 bg-white/[0.02] md:w-72 lg:w-80">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={name || 'Product'}
              fill
              className="object-contain p-8 transition-transform duration-700 group-hover:scale-[1.04]"
              unoptimized
              sizes="(max-width: 768px) 100vw, 320px"
              priority
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3">
              <Package className="h-14 w-14 text-white/5" />
              <span className="text-[9px] font-black tracking-[0.25em] text-white/10 uppercase">
                No Image
              </span>
            </div>
          )}

          {hasMultipleImages && (
            <div className="absolute right-3 bottom-3 left-3 flex gap-1.5 overflow-x-auto rounded-2xl border border-white/10 bg-black/70 p-2 backdrop-blur-xl">
              {displayImages.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSelectedIndex(displayImages.indexOf(src))}
                  className={cn(
                    'relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                    selectedIndex === displayImages.indexOf(src)
                      ? 'scale-105 border-white/60'
                      : 'border-transparent opacity-50 hover:opacity-80'
                  )}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="40px"
                  />
                </button>
              ))}
            </div>
          )}

          {cacheStatus === 'hit' && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 backdrop-blur-xl">
                <Layers className="h-2.5 w-2.5 text-white/30" />
                <span className="text-[9px] font-black tracking-widest text-white/30 uppercase">
                  cached
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Info pane */}
        <div className="flex flex-1 flex-col justify-between p-8 md:p-10">
          <div className="space-y-5">
            {/* Category badges */}
            <div className="flex flex-wrap items-center gap-2">
              {category ? (
                category
                  .split(',')
                  .slice(0, 3)
                  .map((c) => (
                    <Badge
                      key={c.trim()}
                      className="rounded-full border-white/5 bg-white/5 px-3 py-1 text-[10px] font-black tracking-widest text-white/35 uppercase"
                    >
                      {c.trim()}
                    </Badge>
                  ))
              ) : (
                <Badge className="rounded-full border-white/5 bg-white/5 px-3 py-1 text-[10px] font-black tracking-widest text-white/20 uppercase">
                  Product
                </Badge>
              )}
            </div>

            {/* Name */}
            <div>
              <h1 className="text-3xl leading-tight font-black tracking-tight text-white md:text-4xl">
                {name || 'Product Details'}
              </h1>
              {(brand || manufacturer) && (
                <p className="mt-2 flex items-center gap-2 text-base font-medium text-white/30">
                  <Building2 className="h-4 w-4 shrink-0 text-white/20" />
                  {brand || manufacturer}
                </p>
              )}
            </div>

            {/* Description (only for non-food — food puts it in the FoodLayout) */}
            {description && !isFoodProduct && (
              <div>
                <p className="text-sm leading-relaxed text-white/45">{shown}</p>
                {isLong && (
                  <button
                    type="button"
                    onClick={() => setExpanded((e) => !e)}
                    className="mt-2 flex items-center gap-1 text-[10px] font-black tracking-wider text-white/25 uppercase transition-colors hover:text-white/50"
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="h-3 w-3" />
                        Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        More
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer meta */}
          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-white/5 pt-5">
            <div className="flex items-center gap-1.5">
              <Database className="h-3 w-3 text-white/15" />
              <span className="text-[10px] font-bold tracking-widest text-white/20 uppercase">
                {sourceLabel}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <History className="h-3 w-3 text-white/15" />
              <span className="text-[10px] font-bold tracking-widest text-white/20 uppercase">
                {new Date(lastUpdated).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <span className="ml-auto font-mono text-[10px] text-white/10">
              {barcode}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── root component ───────────────────────────────────────────────────────────

export function ProductDetail({ product, cacheStatus }: ProductDetailProps) {
  const { nutrition, attributes, description, source } = product;

  const descriptionTrimmed = description?.trim();

  const isFoodProduct = useMemo(
    () => isFood(source, attributes),
    [source, attributes]
  );

  const groupedAttrs = useMemo(() => {
    if (!attributes || attributes.length === 0) {
      return {};
    }
    return attributes.reduce(
      (acc, attr) => {
        const group = attr.group || 'General';
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(attr);
        return acc;
      },
      {} as Record<string, ProductAttribute[]>
    );
  }, [attributes]);

  const hasContent = !!(
    descriptionTrimmed ||
    (attributes && attributes.length > 0) ||
    nutrition
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Hero */}
      <HeroCard
        product={product}
        cacheStatus={cacheStatus}
        isFood={isFoodProduct}
        description={descriptionTrimmed}
      />

      {/* Content */}
      {hasContent && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {isFoodProduct ? (
            <FoodLayout nutrition={nutrition} groupedAttrs={groupedAttrs} />
          ) : (
            <UniversalLayout
              groupedAttrs={groupedAttrs}
              description={descriptionTrimmed}
            />
          )}
        </motion.div>
      )}

      {/* No data */}
      {!hasContent && (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/5 bg-white/[0.01] py-20 text-center">
          <Info className="mb-4 h-10 w-10 text-white/10" />
          <p className="text-sm font-bold text-white/25">
            No detailed data available
          </p>
          <p className="mt-1 text-xs text-white/15">
            Only basic barcode info was found
          </p>
        </div>
      )}
    </motion.div>
  );
}
