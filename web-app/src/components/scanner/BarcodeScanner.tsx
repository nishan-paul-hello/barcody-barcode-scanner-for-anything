'use client';
import { SCAN_FORMAT_LIST } from '@/lib/constants/barcode-formats';

import { analytics, AnalyticsEventType } from '@/lib/analytics.service';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  BrowserMultiFormatReader,
  type IScannerControls,
} from '@zxing/browser';
import { DecodeHintType, type Result } from '@zxing/library';
import {
  Camera,
  CameraOff,
  RefreshCcw,
  AlertCircle,
  Volume2,
  VolumeX,
  Lock,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCreateScan } from '@/hooks/use-scans';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface BarcodeScannerProps {
  onScanSuccess?: (result: Result, fileName?: string) => void;
  onScanError?: (error: unknown) => void;
  onClear?: () => void;
  active?: boolean;
}

import { mapZxingFormatToReadable } from '@/lib/utils/barcode';

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanSuccess,
  onScanError,
  onClear,
  active = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('barcody_sound_pref');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [scanSuccess, setScanSuccess] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [startRetryTrigger, setStartRetryTrigger] = useState(0);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const startRetryCountRef = useRef(0);
  const playBeepRef = useRef<() => void>(() => {});
  const drawFeedbackRef = useRef<() => void>(() => {});
  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanErrorRef = useRef(onScanError);
  const createScanMutation = useCreateScan();
  const createScanMutationRef = useRef(createScanMutation);

  // Turn camera off when tab is left or context is lost (saves cost); stays off until user clicks camera on
  useEffect(() => {
    if (!active) {
      const id = setTimeout(() => setIsCameraActive(false), 0);
      return () => clearTimeout(id);
    }
  }, [active]);

  const handleToggleSound = useCallback(() => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    try {
      localStorage.setItem('barcody_sound_pref', String(newValue));
    } catch {
      // Ignored
    }
    analytics.track(AnalyticsEventType.SETTINGS_CHANGED, {
      setting: 'sound_enabled',
      value: newValue,
    });
  }, [soundEnabled]);

  const handleToggleCamera = useCallback(
    (forcedState?: boolean) => {
      const newValue =
        forcedState !== undefined ? forcedState : !isCameraActive;
      setIsCameraActive(newValue);
      // When turning camera ON, ensure we have a device selected so the scanner effect can start
      if (newValue && !selectedDeviceId && devices.length > 0) {
        const preferred = devices.find((d) =>
          /back|rear|environment/i.test(d.label)
        );
        setSelectedDeviceId(
          preferred ? preferred.deviceId : (devices[0]?.deviceId ?? '')
        );
      }
    },
    [isCameraActive, selectedDeviceId, devices]
  );

  // Capture a still frame from the video element and return as data URL
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0)
      return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.92);
  }, []);

  const drawFeedback = useCallback(() => {
    setScanSuccess(true);
    // Capture the frame on success flash
    const frame = captureFrame();
    if (frame) {
      // Delay slightly so the green flash is visible before preview takes over
      setTimeout(() => {
        setCapturedPreview(frame);
        setIsCameraActive(false);
      }, 650);
    }
    setTimeout(() => setScanSuccess(false), 600);
  }, [captureFrame]);

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

  useEffect(() => {
    playBeepRef.current = playBeep;
    drawFeedbackRef.current = drawFeedback;
    onScanSuccessRef.current = onScanSuccess;
    onScanErrorRef.current = onScanError;
    createScanMutationRef.current = createScanMutation;
  }, [playBeep, drawFeedback, onScanSuccess, onScanError, createScanMutation]);

  // Initial device listing and reader setup
  useEffect(() => {
    const hints = new Map();
    // Format list is driven by BARCODE_FORMAT_REGISTRY in barcode-formats.ts.
    hints.set(DecodeHintType.POSSIBLE_FORMATS, SCAN_FORMAT_LIST);
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
    let retryTimeoutId: ReturnType<typeof setTimeout> | null = null;

    async function start() {
      if (!active || !isCameraActive || !readerRef.current) {
        return;
      }
      // When camera is on but no device selected yet, pick first device so next effect run will start
      if (!selectedDeviceId && devices.length > 0) {
        const preferred = devices.find((d) =>
          /back|rear|environment/i.test(d.label)
        );
        setSelectedDeviceId(
          preferred ? preferred.deviceId : (devices[0]?.deviceId ?? '')
        );
        return;
      }
      if (!selectedDeviceId) {
        return;
      }
      // videoRef.current can be null on first run (tab/layout not painted yet); retry after paint
      if (!videoRef.current) {
        if (startRetryCountRef.current < 15) {
          startRetryCountRef.current += 1;
          retryTimeoutId = setTimeout(
            () => setStartRetryTrigger((t) => t + 1),
            80
          );
        }
        return;
      }

      startRetryCountRef.current = 0; // reset so future camera-on can retry
      try {
        setIsScanning(true);
        setError(null);

        const newControls = await readerRef.current.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, err) => {
            if (result && isMounted) {
              playBeepRef.current();
              drawFeedbackRef.current();

              const barcodeData = result.getText();
              const formatName = result.getBarcodeFormat().toString();

              onScanSuccessRef.current?.(result);

              analytics.trackScanCreated(
                mapZxingFormatToReadable(
                  result.getBarcodeFormat(),
                  barcodeData
                ),
                'camera'
              );

              createScanMutationRef.current.mutate({
                barcodeData,
                barcodeType: mapZxingFormatToReadable(
                  result.getBarcodeFormat(),
                  barcodeData
                ),
                rawData: barcodeData,
                deviceType: 'web',
                scannedAt: new Date().toISOString(),
                metadata: { format: formatName, timestamp: Date.now() },
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
                // Silenced scanning error to prevent Next.js dev overlay
                analytics.trackScanFailed(
                  err instanceof Error ? err.message : String(err),
                  'camera'
                );
                onScanErrorRef.current?.(err);
              }
            }
          }
        );

        if (!isMounted) {
          newControls.stop();
        } else {
          controls = newControls;
          // Ensure video is playing (some browsers need explicit play after stream attach)
          requestAnimationFrame(() => {
            videoRef.current?.play().catch(() => {});
          });
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
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
      if (controls) {
        controls.stop();
      }
      setIsScanning(false);
    };
  }, [active, isCameraActive, selectedDeviceId, devices, startRetryTrigger]);

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

  const handleClearPreview = useCallback(() => {
    setCapturedPreview(null);
    onClear?.();
  }, [onClear]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Card className="group relative aspect-video w-full overflow-hidden rounded-[2.5rem] border-4 border-white/5 bg-black/40 shadow-2xl backdrop-blur-3xl sm:aspect-square md:aspect-video">
          {/* Captured preview — shown after a successful scan */}
          <AnimatePresence>
            {capturedPreview && (
              <motion.div
                key="captured"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30"
              >
                <Image
                  src={capturedPreview}
                  alt="Captured scan"
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* Green success brackets overlay */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -top-px -left-px h-28 w-28 rounded-tl-[2.5rem] border-t-[6px] border-l-[6px] border-green-400" />
                  <div className="absolute -top-px -right-px h-28 w-28 rounded-tr-[2.5rem] border-t-[6px] border-r-[6px] border-green-400" />
                  <div className="absolute -bottom-px -left-px h-28 w-28 rounded-bl-[2.5rem] border-b-[6px] border-l-[6px] border-green-400" />
                  <div className="absolute -right-px -bottom-px h-28 w-28 rounded-br-[2.5rem] border-r-[6px] border-b-[6px] border-green-400" />
                </div>
                {/* Cross — top-right of preview, appears on hover (same as Upload tab) */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearPreview}
                  className="absolute top-6 right-6 h-10 w-10 cursor-pointer rounded-full border border-white/10 bg-black/40 text-white/70 opacity-0 backdrop-blur-md transition-all group-hover:opacity-100 hover:bg-red-500 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

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

          <AnimatePresence>
            {isScanning && !capturedPreview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 z-10"
              >
                {/* Corner Brackets */}
                <div
                  className={`absolute -top-px -left-px h-28 w-28 rounded-tl-[2.5rem] border-t-[6px] border-l-[6px] transition-all duration-150 ${scanSuccess ? 'border-green-400' : 'border-cyan-400'}`}
                />
                <div
                  className={`absolute -top-px -right-px h-28 w-28 rounded-tr-[2.5rem] border-t-[6px] border-r-[6px] transition-all duration-150 ${scanSuccess ? 'border-green-400' : 'border-cyan-400'}`}
                />
                <div
                  className={`absolute -bottom-px -left-px h-28 w-28 rounded-bl-[2.5rem] border-b-[6px] border-l-[6px] transition-all duration-150 ${scanSuccess ? 'border-green-400' : 'border-cyan-400'}`}
                />
                <div
                  className={`absolute -right-px -bottom-px h-28 w-28 rounded-br-[2.5rem] border-r-[6px] border-b-[6px] transition-all duration-150 ${scanSuccess ? 'border-green-400' : 'border-cyan-400'}`}
                />

                {/* Vignette */}
                <div className="bg-radial-gradient absolute inset-0 from-transparent via-transparent to-black/40" />
              </motion.div>
            )}
          </AnimatePresence>

          {!isCameraActive && !capturedPreview && !error && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 p-8 text-center backdrop-blur-2xl">
              <div className="flex -translate-y-8 flex-col items-center">
                <Lock
                  className="mb-5 h-10 w-10 text-amber-400"
                  strokeWidth={1.5}
                />
                <p className="text-base font-semibold tracking-widest text-white uppercase">
                  Camera Paused
                </p>
              </div>
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
          <div
            className={`absolute left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/30 p-1.5 backdrop-blur-2xl transition-all ${
              isCameraActive || capturedPreview
                ? 'bottom-6 opacity-0 group-hover:bottom-8 group-hover:opacity-100'
                : 'bottom-8 opacity-100'
            }`}
          >
            <button
              onClick={() => handleToggleCamera()}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white/70 transition-colors hover:text-cyan-400 focus:outline-none"
            >
              {isCameraActive ? (
                <Camera className="h-5 w-5" />
              ) : (
                <CameraOff className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={handleToggleSound}
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
