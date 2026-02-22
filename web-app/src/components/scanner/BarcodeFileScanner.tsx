'use client';

import { analytics } from '@/lib/analytics.service';

import React, { useState, useCallback, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat, type Result } from '@zxing/library';
import { Upload, X, Loader2, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCreateScan } from '@/hooks/use-scans';
import { mapZxingFormatToReadable } from '@/lib/utils/barcode';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface BarcodeFileScannerProps {
  onScanSuccess?: (result: Result) => void;
  onScanError?: (error: unknown) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const BarcodeFileScanner: React.FC<BarcodeFileScannerProps> = ({
  onScanSuccess,
  onScanError,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [imgDims, setImgDims] = useState<{ w: number; h: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createScanMutation = useCreateScan();

  const scanImage = useCallback(
    async (url: string) => {
      setIsScanning(true);
      setError(null);

      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.QR_CODE,
        BarcodeFormat.EAN_13,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
        BarcodeFormat.DATA_MATRIX,
        BarcodeFormat.PDF_417,
        BarcodeFormat.ITF,
        BarcodeFormat.EAN_8,
        BarcodeFormat.CODE_39,
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);

      const reader = new BrowserMultiFormatReader(hints);

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

          onScanSuccess?.(result);

          analytics.trackScanCreated(
            mapZxingFormatToReadable(result.getBarcodeFormat()),
            'file'
          );

          createScanMutation.mutate({
            barcodeData,
            barcodeType: mapZxingFormatToReadable(result.getBarcodeFormat()),
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
    [onScanSuccess, onScanError, createScanMutation]
  );

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Invalid file type. Please upload a JPG, PNG, or WebP image.');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError('File is too large. Maximum size is 10MB.');
        return;
      }

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Capture dimensions for proportional rounding
      const img = new window.Image();
      img.onload = () => {
        setImgDims({ w: img.naturalWidth, h: img.naturalHeight });
      };
      img.src = url;

      await scanImage(url);
    },
    [scanImage]
  );

  const onPaste = useCallback(
    (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            handleFile(file);
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
    if (!previewUrl) return;
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `barcode-asset-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
                    if (selectedFile) handleFile(selectedFile);
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
      </motion.div>

      <AnimatePresence>
        {!isScanning && error && !previewUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 flex items-center justify-between gap-4 rounded-3xl border border-red-500/20 bg-red-500/5 p-5"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-500/10 p-2.5 ring-1 ring-red-500/20">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-white/90">System Error</p>
                <p className="text-xs text-white/40">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
        <AnimatePresence>
          {isPreviewOpen && previewUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md md:p-8"
              onClick={() => setIsPreviewOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative flex max-h-[85vh] w-full max-w-4xl flex-col items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Floating Action Toolbar */}
                <div className="mb-4 flex items-center gap-1 rounded-full border border-white/10 bg-black/50 p-1.5 backdrop-blur-xl">
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white/70 transition-all hover:bg-white/10 hover:text-cyan-400"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <button
                    onClick={downloadImage}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white/70 transition-all hover:bg-white/10 hover:text-cyan-400"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => window.open(previewUrl, '_blank')}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white/70 transition-all hover:bg-white/10 hover:text-cyan-400"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>

                {/* Dynamic Image Container */}
                <div
                  className="relative overflow-hidden shadow-2xl ring-1 ring-white/5 backdrop-blur-3xl"
                  style={{
                    borderRadius: imgDims
                      ? `${Math.min(imgDims.w, imgDims.h) * 0.05}px`
                      : '2rem',
                    aspectRatio: imgDims
                      ? `${imgDims.w} / ${imgDims.h}`
                      : 'auto',
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
      </AnimatePresence>
    </div>
  );
};
