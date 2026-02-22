'use client';

import { analytics } from '@/lib/analytics.service';

import React, { useState, useCallback, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat, type Result } from '@zxing/library';
import {
  Upload,
  X,
  ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCreateScan } from '@/hooks/use-scans';
import { toast } from 'sonner';
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
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createScanMutation = useCreateScan();

  const scanImage = useCallback(
    async (url: string) => {
      setIsScanning(true);
      setError(null);
      setIsSuccess(false);

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
          setIsSuccess(true);

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

          toast.success(`Barcode detected: ${barcodeData}`, {
            description: `Format: ${formatName}`,
          });
        }
      } catch (err) {
        console.error('OCR/Barcode Scan error:', err);
        const errorMessage =
          'No barcode found in this image. Try a clearer photo.';
        setError(errorMessage);
        analytics.trackScanFailed(errorMessage, 'file');
        onScanError?.(err);
        toast.error('Scan failed', { description: errorMessage });
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

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [handleFile]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    setIsSuccess(false);
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
          onDrop={onDrop}
          onDragOver={onDragOver}
          className={`group relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border-2 transition-all duration-500 sm:aspect-square md:aspect-video ${
            previewUrl
              ? 'border-white/10 bg-black/40 backdrop-blur-3xl'
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
                className="relative h-full w-full p-4"
              >
                <div className="relative h-full w-full overflow-hidden rounded-3xl ring-1 ring-white/10">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className={`object-contain transition-transform duration-700 ${isScanning ? 'scale-110 blur-[2px]' : 'blur-0 scale-100'}`}
                    unoptimized
                  />

                  {/* High-tech overlay for preview */}
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {isScanning && (
                      <>
                        <div className="animate-scan-line absolute top-0 left-0 h-[2px] w-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-cyan-500/5 backdrop-blur-[1px]">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          >
                            <Loader2 className="h-10 w-10 text-cyan-400" />
                          </motion.div>
                          <p className="mt-4 text-[10px] font-bold tracking-[0.2em] text-cyan-400 uppercase">
                            Processing Data
                          </p>
                        </div>
                      </>
                    )}

                    {!isScanning && isSuccess && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500/10 backdrop-blur-[2px]"
                      >
                        <div className="rounded-full bg-emerald-500/20 p-4 ring-1 ring-emerald-500/40">
                          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                        </div>
                        <p className="mt-4 text-[10px] font-bold tracking-[0.2em] text-emerald-400 uppercase">
                          Success Detected
                        </p>
                      </motion.div>
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
                  className="absolute top-8 right-8 h-10 w-10 rounded-full border border-white/10 bg-black/40 text-white/70 backdrop-blur-md transition-all hover:bg-red-500 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </motion.div>
            ) : (
              <motion.label
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full w-full cursor-pointer flex-col items-center justify-center p-8 text-center"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept={ALLOWED_TYPES.join(',')}
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) handleFile(selectedFile);
                  }}
                />
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="mb-6 rounded-[2rem] bg-cyan-500/10 p-6 ring-1 ring-cyan-500/20"
                >
                  <Upload className="h-10 w-10 text-cyan-400" />
                </motion.div>
                <h3 className="mb-2 text-xl font-bold tracking-tight text-white/90">
                  Import Signal Source
                </h3>
                <p className="mb-8 max-w-xs text-sm leading-relaxed text-white/40">
                  Drag and drop your asset here, or click to browse local filing
                  system.
                </p>

                <div className="flex gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-1.5 text-[10px] font-bold tracking-wider text-white/30 uppercase">
                    <ImageIcon className="h-3.5 w-3.5" />
                    JPG / PNG / WEBP
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-1.5 text-[10px] font-bold tracking-wider text-white/30 uppercase">
                    10MB Limit
                  </div>
                </div>
              </motion.label>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`flex items-center justify-between gap-4 rounded-3xl border p-5 ${
              previewUrl
                ? 'border-amber-500/20 bg-amber-500/5 transition-colors'
                : 'border-red-500/20 bg-red-500/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`rounded-full p-2.5 ${
                  previewUrl ? 'bg-amber-500/10' : 'bg-red-500/10'
                }`}
              >
                <AlertCircle
                  className={`h-5 w-5 ${previewUrl ? 'text-amber-500' : 'text-red-500'}`}
                />
              </div>
              <div>
                <p className="text-sm font-bold text-white/90">
                  {previewUrl ? 'Detection Failed' : 'System Error'}
                </p>
                <p className="text-xs text-white/40">{error}</p>
              </div>
            </div>
            {previewUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => scanImage(previewUrl)}
                disabled={isScanning}
                className="h-10 rounded-full border-white/10 bg-white/5 px-6 text-[11px] font-bold tracking-widest text-white uppercase hover:bg-white/10"
              >
                {isScanning ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : null}
                Retry Scan
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
