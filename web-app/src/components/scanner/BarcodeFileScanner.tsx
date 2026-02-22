'use client';

import { analytics } from '@/lib/analytics.service';

import React, { useState, useCallback, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat, type Result } from '@zxing/library';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
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
        console.error('OCR/Barcode Scan error:', err);
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
          className={`group relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border-2 transition-all duration-500 sm:aspect-square md:aspect-video ${
            previewUrl
              ? 'border-white/5 bg-transparent'
              : 'border-dashed border-white/5 bg-white/[0.02] hover:border-cyan-500/30 hover:bg-cyan-500/[0.03]'
          }`}
        >
          <AnimatePresence mode="wait">
            {previewUrl ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative h-full w-full"
              >
                <div className="relative h-full w-full overflow-hidden">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className={`object-contain transition-transform duration-700 ${isScanning ? 'scale-105 blur-[2px]' : 'blur-0 scale-100'}`}
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
                  className="absolute top-6 right-6 h-10 w-10 cursor-pointer rounded-full border border-white/10 bg-black/40 text-white/70 backdrop-blur-md transition-all hover:bg-red-500 hover:text-white"
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

                <div className="flex items-center gap-2 text-[15px] text-white/50">
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
            className="flex items-center justify-between gap-4 rounded-3xl border border-red-500/20 bg-red-500/5 p-5"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-500/10 p-2.5 ring-1 ring-red-500/20">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-white/90">System Error</p>
                <p className="text-xs text-white/40">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
