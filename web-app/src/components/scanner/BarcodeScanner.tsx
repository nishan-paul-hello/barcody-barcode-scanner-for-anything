'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  BrowserMultiFormatReader,
  type IScannerControls,
} from '@zxing/browser';
import { BarcodeFormat, DecodeHintType, type Result } from '@zxing/library';
import {
  Camera,
  RefreshCcw,
  AlertCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCreateScan } from '@/hooks/use-scans';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  onScanSuccess?: (result: Result) => void;
  onScanError?: (error: unknown) => void;
  active?: boolean;
}

import { mapZxingFormatToReadable } from '@/lib/utils/barcode';

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanSuccess,
  onScanError,
  active = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const createScanMutation = useCreateScan();

  const drawFeedback = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = videoRef.current.clientWidth;
    canvas.height = videoRef.current.clientHeight;

    ctx.strokeStyle = '#00f2ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(
      canvas.width * 0.2,
      canvas.height * 0.3,
      canvas.width * 0.6,
      canvas.height * 0.4
    );

    setTimeout(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 200);
  }, []);

  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.15);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (err) {
      console.error('Error playing beep:', err);
    }
  }, [soundEnabled]);

  // Initial device listing and reader setup
  useEffect(() => {
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

    readerRef.current = new BrowserMultiFormatReader(hints);

    const listDevices = async () => {
      try {
        const videoDevices =
          await BrowserMultiFormatReader.listVideoInputDevices();
        setDevices(videoDevices);

        if (videoDevices.length > 0) {
          const backCamera = videoDevices.find((d) =>
            /back|rear|environment/i.test(d.label)
          );
          setSelectedDeviceId(
            backCamera ? backCamera.deviceId : (videoDevices[0]?.deviceId ?? '')
          );
        } else {
          setError(
            'No camera devices found. Please ensure your camera is connected.'
          );
        }
      } catch (err) {
        console.error('Error listing devices:', err);
        setError(
          'Camera permission denied or no devices available. Please check your browser settings.'
        );
      }
    };

    listDevices();

    return () => {
      // Background cleanup is handled by the main lifecycle effect
    };
  }, []);

  // Main scanner lifecycle effect
  useEffect(() => {
    let controls: IScannerControls | null = null;
    let isMounted = true;
    let timer: NodeJS.Timeout;

    async function start() {
      if (
        !active ||
        !selectedDeviceId ||
        !videoRef.current ||
        !readerRef.current
      ) {
        return;
      }

      try {
        // Defer state update to avoid lint error and ensure stability
        timer = setTimeout(() => {
          if (isMounted) setIsScanning(true);
        }, 0);

        setError(null);

        const newControls = await readerRef.current.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, err) => {
            if (result && isMounted) {
              playBeep();
              drawFeedback();

              const barcodeData = result.getText();
              const formatName = result.getBarcodeFormat().toString();

              onScanSuccess?.(result);

              createScanMutation.mutate({
                barcodeData,
                barcodeType: mapZxingFormatToReadable(
                  result.getBarcodeFormat()
                ),
                rawData: barcodeData,
                deviceType: 'web',
                scannedAt: new Date().toISOString(),
                metadata: { format: formatName, timestamp: Date.now() },
              });

              toast.info(`Scanned: ${barcodeData}`, {
                description: `Format: ${formatName}`,
              });
            }
            if (err && !(err.name === 'NotFoundException')) {
              console.error('Scan error:', err);
              if (isMounted) onScanError?.(err);
            }
          }
        );

        if (!isMounted) {
          newControls.stop();
        } else {
          controls = newControls;
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error starting scanner:', err);
          setError(
            'Could not initialize camera. It might be in use by another application or blocked by your browser.'
          );
          setIsScanning(false);
        }
      }
    }

    start();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
      if (controls) {
        controls.stop();
      }
      setIsScanning(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    active,
    selectedDeviceId,
    playBeep,
    drawFeedback,
    onScanSuccess,
    onScanError,
  ]);

  const switchCamera = useCallback(() => {
    if (devices.length < 2) return;
    const currentIndex = devices.findIndex(
      (d) => d.deviceId === selectedDeviceId
    );
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDevice = devices[nextIndex];
    if (nextDevice) {
      setSelectedDeviceId(nextDevice.deviceId);
    }
  }, [devices, selectedDeviceId]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center space-y-4">
      <Card className="group relative aspect-video w-full overflow-hidden rounded-3xl border-2 border-white/10 bg-black sm:aspect-square md:aspect-video">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0"
        />

        {isScanning && (
          <div className="pointer-events-none absolute inset-0">
            <div className="animate-scan-line absolute top-0 left-0 h-1 w-full bg-cyan-400/50 shadow-[0_0_15px_rgba(0,242,255,0.8)]" />
            <div className="absolute top-8 left-8 h-12 w-12 rounded-tl-xl border-t-4 border-l-4 border-cyan-400 opacity-80" />
            <div className="absolute top-8 right-8 h-12 w-12 rounded-tr-xl border-t-4 border-r-4 border-cyan-400 opacity-80" />
            <div className="absolute bottom-8 left-8 h-12 w-12 rounded-bl-xl border-b-4 border-l-4 border-cyan-400 opacity-80" />
            <div className="absolute right-8 bottom-8 h-12 w-12 rounded-br-xl border-r-4 border-b-4 border-cyan-400 opacity-80" />
          </div>
        )}

        {!isScanning && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="animate-pulse rounded-full bg-white/10 p-4">
              <Camera className="h-12 w-12 text-white/50" />
            </div>
            <p className="mt-4 font-medium text-white/70">
              Initializing Camera...
            </p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6 text-center backdrop-blur-md">
            <AlertCircle className="text-destructive mb-4 h-16 w-16" />
            <h3 className="mb-2 text-xl font-bold text-white">Camera Error</h3>
            <p className="mb-6 max-w-xs text-white/60">{error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              Try Again
            </Button>
          </div>
        )}

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center space-x-2 rounded-2xl border border-white/10 bg-black/50 p-2 opacity-0 backdrop-blur-xl transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="rounded-xl text-white hover:bg-white/10"
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>

          {devices.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={switchCamera}
              className="rounded-xl text-white hover:bg-white/10"
            >
              <RefreshCcw className="h-5 w-5" />
            </Button>
          )}
        </div>
      </Card>

      <div className="flex w-full items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <div
            className={`h-2 w-2 rounded-full ${isScanning ? 'animate-pulse bg-emerald-500' : 'bg-red-500'}`}
          />
          <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            {isScanning ? 'Scanner Active' : 'Scanner Paused'}
          </span>
        </div>

        {devices.length > 0 && (
          <span className="text-muted-foreground max-w-[200px] truncate text-xs">
            {devices.find((d) => d.deviceId === selectedDeviceId)?.label ||
              'Primary Camera'}
          </span>
        )}
      </div>
    </div>
  );
};
