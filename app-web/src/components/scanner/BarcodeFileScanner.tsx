'use client';

import { analytics } from '@/lib/analytics.service';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType, type Result } from '@zxing/library';
import {
  Upload,
  X,
  Loader2,
  Download,
  ExternalLink,
  KeyRound,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCreateScan } from '@/hooks/use-scans';
import { mapZxingFormatToReadable } from '@/lib/utils/barcode';
import { SCAN_FORMAT_LIST } from '@/lib/constants/barcode-formats';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useScanStore } from '@/store/useScanStore';
import { useApiKeys } from '@/hooks/use-api-keys';
import { useUIStore } from '@/store/useUIStore';
import { convertToProcessableImage } from '@/lib/utils/file-conversion';

interface BarcodeFileScannerProps {
  onScanSuccess?: (result: Result, fileName?: string) => void;
  onScanError?: (error: unknown) => void;
  onClear?: () => void;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB for HEIC
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/bmp',
  'image/avif',
  'image/heic',
  'image/heif',
];

// Defined once at module level — shared by scanImage and scanFromCanvas.
// Format list is driven by BARCODE_FORMAT_REGISTRY in barcode-formats.ts.
const SCAN_HINTS = new Map<DecodeHintType, unknown>();
SCAN_HINTS.set(DecodeHintType.POSSIBLE_FORMATS, SCAN_FORMAT_LIST);
SCAN_HINTS.set(DecodeHintType.TRY_HARDER, true);

export const BarcodeFileScanner: React.FC<BarcodeFileScannerProps> = ({
  onScanSuccess,
  onScanError,
  onClear,
}) => {
  const { results, activeTab, setPreviewUrl } = useScanStore();
  const { previewUrl } = results[activeTab];
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [imgDims, setImgDims] = useState<{ w: number; h: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createScanMutation = useCreateScan();
  const { data: apiKeys } = useApiKeys();
  const { setApiKeysModalOpen } = useUIStore();

  const hasApiConfigured = React.useMemo(() => {
    if (!apiKeys) {
      return true;
    } // Assume true while loading to avoid flickering
    return !!apiKeys.upcDatabaseApiKey;
  }, [apiKeys]);

  // Restore image dimensions if preview exists on mount
  useEffect(() => {
    if (previewUrl) {
      const img = new window.Image();
      img.onload = () => {
        setImgDims({ w: img.naturalWidth, h: img.naturalHeight });
      };
      img.src = previewUrl;
    }
  }, [previewUrl]);

  const scanImage = useCallback(
    async (url: string, fileName?: string) => {
      setIsScanning(true);
      setError(null);

      const reader = new BrowserMultiFormatReader(SCAN_HINTS);

      try {
        // Pre-validate image dimensions to prevent IndexSizeError in ZXing internal canvas
        await new Promise<void>((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => {
            if (img.naturalWidth === 0 || img.naturalHeight === 0) {
              reject(new Error('Image has no dimensions'));
            } else {
              resolve();
            }
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = url;
        });

        const result = await reader.decodeFromImageUrl(url);

        if (result) {
          const barcodeData = result.getText();
          const formatName = result.getBarcodeFormat().toString();

          onScanSuccess?.(result, fileName);

          analytics.trackScanCreated(
            mapZxingFormatToReadable(result.getBarcodeFormat(), barcodeData),
            'file'
          );

          createScanMutation.mutate({
            barcodeData,
            barcodeType: mapZxingFormatToReadable(
              result.getBarcodeFormat(),
              barcodeData
            ),
            rawData: barcodeData,
            deviceType: 'web',
            scannedAt: new Date().toISOString(),
            metadata: {
              format: formatName,
              method: 'upload',
              timestamp: Date.now(),
            },
          });
        }
      } catch (err) {
        // Clear the preview so a failed upload never lingers
        setPreviewUrl(null);
        setImgDims(null);
        // Silencing expected scanning errors to prevent dev overlay
        const errorMessage =
          'No barcode found in this image. Try a clearer photo.';
        setError(errorMessage);
        analytics.trackScanFailed(errorMessage, 'file');
        onScanError?.(err);
      } finally {
        setIsScanning(false);
      }
    },
    [onScanSuccess, onScanError, createScanMutation, setPreviewUrl]
  );

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      const isAllowed =
        ALLOWED_TYPES.includes(file.type) ||
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif');

      if (!isAllowed) {
        setError(
          'Unsupported file type — try JPEG, PNG, WebP, HEIC, AVIF, or BMP.'
        );
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError('File is too large. Maximum size is 20MB.');
        return;
      }

      let processableUrl: string | null = null;

      try {
        onClear?.();
        processableUrl = await convertToProcessableImage(file);

        setPreviewUrl(processableUrl);

        // Capture image dimensions for the proportional preview container
        await new Promise<void>((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => {
            setImgDims({ w: img.naturalWidth, h: img.naturalHeight });
            resolve();
          };
          img.onerror = () => reject(new Error('Failed to load preview image'));
          img.src = processableUrl || '';
        });

        await scanImage(processableUrl, file.name);
      } catch (err) {
        console.error('File processing error:', err);
        setError(err instanceof Error ? err.message : 'Failed to process file');
      }
    },
    [scanImage, setPreviewUrl, onClear]
  );

  const onPaste = useCallback(
    (e: ClipboardEvent) => {
      if (!e.clipboardData) {
        return;
      }
      const items = e.clipboardData.items;
      if (!items) {
        return;
      }

      for (const item of items) {
        if (item && item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            void handleFile(file);
            break;
          }
        }
      }
    },
    [handleFile]
  );

  React.useEffect(() => {
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [onPaste]);

  const downloadImage = () => {
    if (!previewUrl) {
      return;
    }
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `barcode-asset-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFile = () => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear?.();
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full"
      >
        <Card
          className={`group relative flex aspect-video w-full flex-col overflow-hidden rounded-[2.5rem] border-2 transition-all duration-500 sm:aspect-square md:aspect-video ${
            previewUrl
              ? 'border-white/5 bg-transparent p-0'
              : error
                ? 'items-center justify-center border-red-500/20 bg-red-500/[0.02]'
                : 'items-center justify-center border-dashed border-white/5 bg-white/[0.02] py-6 hover:border-cyan-500/30 hover:bg-cyan-500/[0.03]'
          }`}
        >
          <AnimatePresence mode="wait">
            {previewUrl ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative h-full w-full"
              >
                <div
                  className="group/img relative h-full w-full cursor-pointer overflow-hidden rounded-[2.5rem]"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className={`object-cover transition-all duration-700 ${isScanning ? 'blur-[2px]' : 'blur-0'}`}
                    unoptimized
                  />

                  {/* Status overlays */}
                  <div className="pointer-events-none absolute inset-0">
                    {isScanning && (
                      <>
                        <div className="animate-scan-line absolute top-0 left-0 h-[1px] w-full bg-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent backdrop-blur-[1px]">
                          <Loader2 className="h-8 w-8 animate-spin text-cyan-400/60" />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="absolute top-6 right-6 h-10 w-10 cursor-pointer rounded-full border border-white/10 bg-black/40 text-white/70 opacity-0 backdrop-blur-md transition-all group-hover:opacity-100 hover:bg-red-500 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="flex h-full w-full flex-col items-center justify-center gap-5 p-8 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-black tracking-tight text-white">
                    Scan Failed
                  </p>
                  <p className="mx-auto max-w-sm text-[15px] leading-relaxed font-medium whitespace-normal text-white/70 md:max-w-none md:whitespace-nowrap">
                    {error}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="mt-1 flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-bold text-white/50 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white/80"
                >
                  <X className="h-3 w-3" />
                  Dismiss
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full w-full flex-col items-center justify-center p-8 text-center"
              >
                <input
                  type="file"
                  id="barcode-image-upload"
                  ref={fileInputRef}
                  className="hidden"
                  accept={ALLOWED_TYPES.join(',')}
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      void handleFile(selectedFile);
                    }
                  }}
                />
                <label
                  htmlFor="barcode-image-upload"
                  className="cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="mb-6 rounded-[2rem] bg-cyan-500/10 p-6 ring-1 ring-cyan-500/20"
                  >
                    <Upload className="h-10 w-10 text-cyan-400" />
                  </motion.div>
                </label>
                <h3 className="mb-2 text-xl font-bold tracking-tight text-white/90">
                  Upload Image
                </h3>

                <div className="my-6 text-[15px] font-medium text-white/50">
                  OR
                </div>

                <div className="flex items-center gap-2 text-xl font-bold text-white/90">
                  <kbd className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-sans text-xs">
                    Ctrl
                  </kbd>
                  <span>+</span>
                  <kbd className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-sans text-xs">
                    V
                  </kbd>
                  <span>to paste an image</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* API Warning Component */}
        <AnimatePresence>
          {previewUrl && !isScanning && !hasApiConfigured && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="group relative mt-6 overflow-hidden rounded-[2.5rem] border border-amber-500/20 bg-amber-500/5 p-6 backdrop-blur-xl transition-all hover:border-amber-500/40 hover:bg-amber-500/10"
            >
              <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl transition-opacity group-hover:opacity-40" />

              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30">
                  <KeyRound className="h-6 w-6" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[15px] font-bold tracking-tight text-white/90">
                      Lookup API Configuration Required
                    </h4>
                    <span className="flex h-5 items-center rounded-full bg-amber-500/10 px-2 text-[10px] font-black tracking-widest text-amber-500 uppercase ring-1 ring-amber-500/20">
                      Important
                    </span>
                  </div>
                  <p className="max-w-md text-sm leading-relaxed text-white/50">
                    To fetch detailed product information like names, images and
                    brands, you&apos;ll need to set up your personal API keys in
                    settings.
                  </p>
                </div>

                <Button
                  onClick={() => setApiKeysModalOpen(true)}
                  className="h-11 cursor-pointer items-center gap-2 rounded-xl bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all hover:scale-[1.02] hover:bg-amber-400 active:scale-95 sm:ml-auto"
                >
                  <span className="font-bold">Set API Keys</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isPreviewOpen && previewUrl && (
          <motion.div
            key="preview-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md md:p-8"
            onClick={() => setIsPreviewOpen(false)}
          >
            <motion.div
              key="preview-content"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative flex max-h-[85vh] w-full max-w-4xl flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-1 rounded-full border border-white/10 bg-black/50 p-1.5 backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white/70 transition-all hover:bg-white/10 hover:text-cyan-400"
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={downloadImage}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white/70 transition-all hover:bg-white/10 hover:text-cyan-400"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => window.open(previewUrl, '_blank')}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white/70 transition-all hover:bg-white/10 hover:text-cyan-400"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>

              <div
                className="relative overflow-hidden shadow-2xl ring-1 ring-white/5 backdrop-blur-3xl"
                style={{
                  borderRadius: imgDims
                    ? `${Math.min(imgDims.w, imgDims.h) * 0.05}px`
                    : '2rem',
                  aspectRatio: imgDims ? `${imgDims.w} / ${imgDims.h}` : 'auto',
                }}
              >
                <Image
                  src={previewUrl}
                  alt="Full Preview"
                  width={imgDims?.w || 1600}
                  height={imgDims?.h || 1200}
                  className="h-auto max-h-[75vh] w-auto max-w-full object-contain"
                  unoptimized
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
