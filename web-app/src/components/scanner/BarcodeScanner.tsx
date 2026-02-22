'use client';

import { analytics, AnalyticsEventType } from '@/lib/analytics.service';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  BrowserMultiFormatReader,
  type IScannerControls,
} from '@zxing/browser';
import { BarcodeFormat, DecodeHintType, type Result } from '@zxing/library';
import {
  Camera,
  CameraOff,
  RefreshCcw,
  AlertCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCreateScan } from '@/hooks/use-scans';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [flashActive, setFlashActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const createScanMutation = useCreateScan();

  const drawFeedback = useCallback(() => {
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    if (!canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = videoRef.current.clientWidth;
    const height = videoRef.current.clientHeight;

    if (width === 0 || height === 0) return;

    canvas.width = width;
    canvas.height = height;

    ctx.strokeStyle = 'rgba(34, 211, 238, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      canvas.width * 0.2,
      canvas.height * 0.3,
      canvas.width * 0.6,
      canvas.height * 0.4
    );

    setTimeout(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 300);
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

  const resetTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (isCameraActive) {
      inactivityTimerRef.current = setTimeout(() => {
        setIsCameraActive(false);
      }, 60000); // 60 seconds inactivity timeout
    }
  }, [isCameraActive]);

  useEffect(() => {
    if (isCameraActive) {
      resetTimer();
    }
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isCameraActive, resetTimer]);

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
        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.enumerateDevices
        ) {
          if (!window.isSecureContext) {
            setError(
              'Camera access requires a secure connection (HTTPS). Please ensure you are using HTTPS or localhost.'
            );
            return;
          }
          setError(
            'Your browser does not support camera access. Please try a modern browser like Chrome, Firefox, or Safari.'
          );
          return;
        }

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
            'No camera devices found. Please ensure your camera is connected and you have granted permission.'
          );
        }
      } catch (err: unknown) {
        console.error('Error listing devices:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);

        if (errorMessage.includes('method not supported')) {
          setError(
            'Camera initialization is not supported in this environment. If you are using Tailscale or another environment, ensure you are using HTTPS.'
          );
        } else {
          setError(
            'Camera permission denied or initialization failed. Please check your browser settings and refresh.'
          );
        }
      }
    };

    listDevices();
  }, []);

  // Main scanner lifecycle effect
  useEffect(() => {
    let controls: IScannerControls | null = null;
    let isMounted = true;

    async function start() {
      if (
        !active ||
        !isCameraActive ||
        !selectedDeviceId ||
        !videoRef.current ||
        !readerRef.current
      ) {
        return;
      }

      try {
        setIsScanning(true);
        setError(null);

        const newControls = await readerRef.current.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, err) => {
            if (result && isMounted) {
              playBeep();
              drawFeedback();
              resetTimer();

              const barcodeData = result.getText();
              const formatName = result.getBarcodeFormat().toString();

              onScanSuccess?.(result);

              analytics.trackScanCreated(
                mapZxingFormatToReadable(result.getBarcodeFormat()),
                'camera'
              );

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
            if (err && isMounted) {
              // Ignore expected errors during initialization or when no barcode is found
              const isIgnorableError =
                err.name === 'NotFoundException' ||
                err.name === 'IndexSizeError' ||
                (err instanceof Error &&
                  err.message.includes('source width is 0'));

              if (!isIgnorableError) {
                console.error('Scan error:', err);
                analytics.trackScanFailed(
                  err instanceof Error ? err.message : String(err),
                  'camera'
                );
                onScanError?.(err);
              }
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
      if (controls) {
        controls.stop();
      }
      setIsScanning(false);
    };
  }, [
    active,
    isCameraActive,
    selectedDeviceId,
    playBeep,
    drawFeedback,
    resetTimer,
    onScanSuccess,
    onScanError,
    createScanMutation,
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
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Card className="group relative aspect-video w-full overflow-hidden rounded-[2.5rem] border-4 border-white/5 bg-black/40 shadow-2xl backdrop-blur-3xl sm:aspect-square md:aspect-video">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700"
            muted
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 z-10"
          />

          {/* Flash Effect on Success */}
          <AnimatePresence>
            {flashActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-cyan-400"
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 z-10"
              >
                {/* Sleek Minimalist Scan Line */}
                <div className="animate-scan-line absolute left-0 flex w-full justify-center">
                  <div className="relative flex w-[75%] items-center justify-center">
                    {/* Core laser line */}
                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                    {/* Center flare point */}
                    <div className="absolute h-[2px] w-[30px] rounded-full bg-white opacity-90 blur-[1px]" />
                  </div>
                </div>

                {/* Corner Brackets */}
                <div className="absolute top-0 left-0 h-20 w-20 rounded-tl-[2.5rem] border-t-4 border-l-4 border-cyan-400/60 transition-all group-hover:border-cyan-400" />
                <div className="absolute top-0 right-0 h-20 w-20 rounded-tr-[2.5rem] border-t-4 border-r-4 border-cyan-400/60 transition-all group-hover:border-cyan-400" />
                <div className="absolute bottom-0 left-0 h-20 w-20 rounded-bl-[2.5rem] border-b-4 border-l-4 border-cyan-400/60 transition-all group-hover:border-cyan-400" />
                <div className="absolute right-0 bottom-0 h-20 w-20 rounded-br-[2.5rem] border-r-4 border-b-4 border-cyan-400/60 transition-all group-hover:border-cyan-400" />

                {/* Vignette */}
                <div className="bg-radial-gradient absolute inset-0 from-transparent via-transparent to-black/40" />
              </motion.div>
            )}
          </AnimatePresence>

          {!isScanning && !error && isCameraActive && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="rounded-full bg-cyan-500/10 p-6 ring-1 ring-cyan-500/20"
              >
                <div className="relative">
                  <Camera className="h-12 w-12 text-cyan-400" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute -inset-2 rounded-full border-b-2 border-cyan-400/30"
                  />
                </div>
              </motion.div>
              <p className="mt-6 text-sm font-medium tracking-widest text-cyan-400/80 uppercase">
                Initializing Lens
              </p>
            </div>
          )}

          {!isCameraActive && !error && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 p-8 text-center backdrop-blur-2xl">
              <div className="mb-6 rounded-full bg-cyan-500/10 p-4 ring-1 ring-cyan-500/20">
                <CameraOff className="h-12 w-12 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Camera Paused</h3>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 p-8 text-center backdrop-blur-2xl">
              <div className="mb-6 rounded-full bg-red-500/10 p-4 ring-1 ring-red-500/20">
                <AlertCircle className="h-12 w-12 text-red-400" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-white">
                Vision Blocked
              </h3>
              <p className="mb-8 max-w-xs text-sm leading-relaxed text-white/50">
                {error}
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="h-12 rounded-full border-white/10 bg-white/5 px-8 text-white transition-all hover:bg-white/10 hover:ring-2 hover:ring-white/20"
              >
                Restore Connection
              </Button>
            </div>
          )}

          {/* Controls Bar */}
          <div className="absolute bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/30 p-1.5 opacity-0 backdrop-blur-2xl transition-all group-hover:bottom-8 group-hover:opacity-100">
            <button
              onClick={() => setIsCameraActive(!isCameraActive)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white/70 transition-colors hover:text-cyan-400 focus:outline-none"
            >
              {isCameraActive ? (
                <Camera className="h-5 w-5" />
              ) : (
                <CameraOff className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={() => {
                const newValue = !soundEnabled;
                setSoundEnabled(newValue);
                analytics.track(AnalyticsEventType.SETTINGS_CHANGED, {
                  setting: 'sound_enabled',
                  value: newValue,
                });
              }}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white/70 transition-colors hover:text-cyan-400 focus:outline-none"
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </button>

            {devices.length > 1 && (
              <button
                onClick={switchCamera}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white/70 transition-colors hover:text-cyan-400 focus:outline-none"
              >
                <RefreshCcw className="h-5 w-5" />
              </button>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
