'use client';

import React, { useState, useCallback, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat, type Result } from '@zxing/library';
import { Upload, X, ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCreateScan } from '@/hooks/use-scans';
import { toast } from 'sonner';
import { mapZxingFormatToReadable } from '@/lib/utils/barcode';
import Image from 'next/image';

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
        const result = await reader.decodeFromImageUrl(url);

        if (result) {
          const barcodeData = result.getText();
          const formatName = result.getBarcodeFormat().toString();

          onScanSuccess?.(result);

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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <Card
        onDrop={onDrop}
        onDragOver={onDragOver}
        className={`group relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed transition-all sm:aspect-square md:aspect-video ${
          previewUrl
            ? 'border-transparent bg-black'
            : 'border-white/10 bg-white/[0.02] hover:border-cyan-500/50 hover:bg-cyan-500/5'
        }`}
      >
        {previewUrl ? (
          <>
            <div className="relative h-full w-full">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-contain"
                unoptimized
              />
              {isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                  <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
                  <p className="mt-4 font-medium text-white/70">
                    Scanning Image...
                  </p>
                </div>
              )}
              <Button
                variant="destructive"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="absolute top-4 right-4 h-10 w-10 rounded-full shadow-lg"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center p-6 text-center">
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
            <div className="mb-4 rounded-full bg-white/5 p-4 transition-transform group-hover:scale-110">
              <Upload className="h-10 w-10 text-cyan-500" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              Upload Barcode Image
            </h3>
            <p className="text-muted-foreground/60 max-w-xs text-sm">
              Drag and drop your image here, or click to browse files
            </p>
            <div className="mt-6 flex gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[10px] font-medium text-white/40">
                <ImageIcon className="h-3 w-3" />
                JPG, PNG, WEBP
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[10px] font-medium text-white/40">
                MAX 10MB
              </div>
            </div>
          </label>
        )}
      </Card>

      {error && !previewUrl && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-500">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {error && previewUrl && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-white">Detection failed</p>
              <p className="text-xs text-white/50">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scanImage(previewUrl)}
            disabled={isScanning}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            {isScanning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};
