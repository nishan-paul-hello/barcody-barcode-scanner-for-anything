'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Image as ImageIcon, Box } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RawDataPresenterProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

// Helper to determine if a value is a string URL to an image
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isImageUrl = (val: any) => {
  if (typeof val !== 'string') return false;
  return (
    val.startsWith('http') &&
    (val.includes('.jpg') ||
      val.includes('.png') ||
      val.includes('.jpeg') ||
      val.includes('.webp'))
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractCommon = (data: any) => {
  if (!data || typeof data !== 'object') return { images: [] };

  // Try to find common fields across varying API response formats
  // OpenFoodFacts, UPC Database, GoUPC, etc.
  const title =
    data.product_name ||
    data.name ||
    data.title ||
    data.item_name ||
    data.product?.title ||
    data.product?.name ||
    data.items?.[0]?.title;

  const brand =
    data.brands ||
    data.brand ||
    data.brand_name ||
    data.manufacturer ||
    data.product?.brand ||
    data.items?.[0]?.brand;

  const description =
    data.description ||
    data.ingredients_text ||
    data.product?.description ||
    data.items?.[0]?.description;

  const category =
    data.categories ||
    data.category ||
    data.product?.category ||
    data.items?.[0]?.category;

  const barcode =
    data.code || data.barcode || data.upc || data.ean || data.product?.upc;

  // Extract images
  let images: string[] = [];
  if (data.image_url) images.push(data.image_url);
  if (data.images && Array.isArray(data.images)) {
    images = [...images, ...data.images.filter(isImageUrl)];
  }
  if (data.product?.imageUrl) images.push(data.product.imageUrl);
  if (data.items?.[0]?.images && Array.isArray(data.items[0].images)) {
    images = [...images, ...data.items[0].images.filter(isImageUrl)];
  }

  // Deduplicate images
  images = Array.from(new Set(images));

  return { title, brand, description, category, barcode, images };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderValue = (val: any): React.ReactNode => {
  if (val === null || val === undefined)
    return <span className="text-white/20">N/A</span>;
  if (typeof val === 'boolean')
    return (
      <Badge
        className={cn(
          'px-2 py-0',
          val
            ? 'border-green-500/30 bg-green-500/10 text-green-400'
            : 'border-red-500/30 bg-red-500/10 text-red-400'
        )}
      >
        {val ? 'TRUE' : 'FALSE'}
      </Badge>
    );
  if (typeof val === 'string' || typeof val === 'number') {
    if (isImageUrl(val)) {
      // Small image preview inline
      return (
        <a
          href={String(val)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-cyan-400 hover:underline"
        >
          <ImageIcon className="h-3 w-3" /> Link
        </a>
      );
    }
    return <span className="text-white/80">{String(val)}</span>;
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return <span className="text-white/20">[]</span>;
    if (typeof val[0] !== 'object') {
      return (
        <div className="flex flex-wrap gap-1.5">
          {val.slice(0, 10).map((item, idx) => (
            <span
              key={idx}
              className="rounded-md border border-white/5 bg-white/5 px-2 py-0.5 text-xs text-white/70"
            >
              {String(item)}
            </span>
          ))}
          {val.length > 10 && (
            <span className="text-xs text-white/40">
              +{val.length - 10} more
            </span>
          )}
        </div>
      );
    }
    return (
      <span className="text-xs text-white/40">Array of {val.length} items</span>
    );
  }
  if (typeof val === 'object') {
    return (
      <span className="text-xs text-white/40">
        Nested Object ({Object.keys(val).length} keys)
      </span>
    );
  }
  return <span className="text-white/50">{String(val)}</span>;
};

// Recursive card renderer
const DataCard = ({
  title,
  data,
  depth = 0,
}: {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  depth?: number;
}) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;

  const keys = Object.keys(data).filter(
    (k) =>
      typeof data[k] !== 'function' && data[k] !== null && data[k] !== undefined
  );

  if (keys.length === 0) return null;

  const primitives = keys.filter(
    (k) => typeof data[k] !== 'object' || Array.isArray(data[k])
  );
  const objects = keys.filter(
    (k) =>
      typeof data[k] === 'object' && !Array.isArray(data[k]) && data[k] !== null
  );

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border transition-all duration-300',
        depth === 0
          ? 'border-white/10 bg-black/40 shadow-lg'
          : 'border-white/5 bg-white/5'
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
        <Layers className="h-4 w-4 text-cyan-400" />
        <h3 className="text-sm font-bold tracking-wider text-white uppercase">
          {title}
        </h3>
      </div>
      <div className="p-4">
        {primitives.length > 0 && (
          <div className="mb-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {primitives.map((key) => (
              <div
                key={key}
                className="flex flex-col gap-1 border-b border-white/5 pb-2"
              >
                <span className="text-[10px] font-black tracking-widest text-white/30 uppercase">
                  {key.replace(/_/g, ' ')}
                </span>
                <div className="text-sm">{renderValue(data[key])}</div>
              </div>
            ))}
          </div>
        )}

        {objects.length > 0 && (
          <div className="mt-4 flex flex-col gap-4">
            {objects.map((key) => (
              <DataCard
                key={key}
                title={key.replace(/_/g, ' ')}
                data={data[key]}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export function RawDataPresenter({ data }: RawDataPresenterProps) {
  if (!data) return null;

  const { title, brand, description, category, barcode, images } =
    extractCommon(data);

  return (
    <div className="space-y-6">
      {/* Header / Common Data Card */}
      {(title || brand || description || images.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black backdrop-blur-xl"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {images && images.length > 0 ? (
              <div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[0]!}
                  alt={title || 'Product Image'}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/50">
                <Box className="h-10 w-10 text-white/20" />
              </div>
            )}

            <div className="flex-1 space-y-4">
              <div>
                {(brand || category) && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {brand && (
                      <Badge className="border-cyan-500/20 bg-cyan-500/10 font-bold tracking-widest text-cyan-400 uppercase">
                        {brand}
                      </Badge>
                    )}
                    {category && (
                      <Badge className="border-white/10 bg-white/5 text-white/60">
                        {category}
                      </Badge>
                    )}
                  </div>
                )}

                <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                  {title || 'Unknown Product'}
                </h2>
                {barcode && (
                  <p className="mt-1 font-mono text-sm tracking-widest text-white/40">
                    {barcode}
                  </p>
                )}
              </div>

              {description && (
                <p className="max-w-3xl leading-relaxed text-white/60">
                  {description}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Structured Details Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DataCard title="Raw Attributes" data={data} depth={0} />
      </motion.div>
    </div>
  );
}
