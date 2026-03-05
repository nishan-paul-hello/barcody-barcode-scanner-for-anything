'use client';

import { useEffect, useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '@/lib/api/client';
import { type TailscaleInfoDto } from '@/lib/api/types';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Copy,
  Smartphone,
  Signal,
  RefreshCw,
} from 'lucide-react';

export default function TailscaleSetupPage() {
  const [info, setInfo] = useState<TailscaleInfoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latency: number;
    message: string;
  } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchInfo = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.setup.getTailscaleInfo();
      setInfo(data);
      setError(null);
    } catch (err: unknown) {
      console.error('Failed to fetch tailscale info:', err);
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to load Tailscale configuration';
      setError(
        message ||
          'Failed to load Tailscale configuration. Is the backend running?'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchInfo();
  }, [fetchInfo]);

  const handleTestConnection = async () => {
    if (!info?.backendUrl) return;

    setTesting(true);
    setTestResult(null);
    const startTime = performance.now();

    try {
      // We try to fetch the health endpoint via the Tailscale IP
      // Note: This requires the browser (where this page is running) to have access to the Tailscale network
      // OR the backend port to be exposed locally if running on the same machine.
      // Ideally, this simulates the mobile app's perspective if the desktop is also on Tailscale.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${info.backendUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      if (response.ok) {
        setTestResult({
          success: true,
          latency,
          message: 'Connection successful!',
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const isAbort = err instanceof Error && err.name === 'AbortError';

      setTestResult({
        success: false,
        latency: 0,
        message: isAbort
          ? 'Connection timed out'
          : `Connection failed: ${errorMessage}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = () => {
    if (info?.backendUrl) {
      void navigator.clipboard.writeText(info.backendUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            Loading Tailscale Configuration...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Configuration Error
          </h3>
          <p className="mb-6 text-gray-500">{error}</p>
          <button
            onClick={() => {
              void fetchInfo();
            }}
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Mobile App Setup
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Connect your mobile device to your self-hosted backend via
            Tailscale.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-xl md:flex">
          {/* Left Side: QR Code & Connection Info */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white md:w-1/2">
            <div className="mb-6 rounded-xl bg-white p-4 shadow-lg">
              {/* QR Code Container */}
              <QRCodeSVG
                value={info?.backendUrl || ''}
                size={250}
                level="H"
                includeMargin
              />
            </div>

            <p className="mb-2 text-sm font-medium text-indigo-100">
              Scan with Barcody Mobile App
            </p>

            <div className="relative mt-4 w-full max-w-xs">
              <div className="bg-opacity-50 border-opacity-30 flex items-center rounded-lg border border-indigo-400 bg-indigo-800 p-3 backdrop-blur-sm">
                <input
                  type="text"
                  readOnly
                  value={info?.backendUrl || ''}
                  className="w-full truncate border-none bg-transparent pr-8 text-sm text-indigo-50 focus:ring-0"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute right-2 rounded-md p-1.5 text-indigo-200 transition-colors hover:bg-indigo-700"
                  title="Copy URL"
                >
                  {copySuccess ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-8 w-full">
              <button
                onClick={() => {
                  void handleTestConnection();
                }}
                disabled={testing}
                className={`flex w-full items-center justify-center rounded-lg border border-transparent bg-white px-4 py-3 text-sm font-medium text-indigo-600 shadow-md transition-all hover:bg-gray-50 ${
                  testing ? 'cursor-wait opacity-75' : ''
                }`}
              >
                {testing ? (
                  <>
                    <Loader2 className="mr-2 -ml-1 h-5 w-5 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <Signal className="mr-2 -ml-1 h-5 w-5" />
                    Test Connection
                  </>
                )}
              </button>

              {testResult && (
                <div
                  className={`mt-4 flex items-center rounded-lg p-3 text-sm ${
                    testResult.success
                      ? 'bg-opacity-20 border border-green-400 bg-green-500 text-white'
                      : 'bg-opacity-20 border border-red-400 bg-red-500 text-white'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0" />
                  ) : (
                    <XCircle className="mr-2 h-5 w-5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{testResult.message}</p>
                    {testResult.success && (
                      <p className="text-xs opacity-80">
                        Latency: {testResult.latency}ms
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Instructions */}
          <div className="bg-gray-50 p-8 md:w-1/2">
            <h3 className="mb-6 flex items-center text-xl font-bold text-gray-900">
              <Smartphone className="mr-2 h-6 w-6 text-indigo-600" />
              Setup Instructions
            </h3>

            <div className="space-y-8">
              <div className="relative pl-10">
                <div className="absolute top-0 left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-200 bg-indigo-100 text-sm font-bold text-indigo-600 shadow-sm">
                  1
                </div>
                <h4 className="text-lg font-medium text-gray-900">
                  Install Tailscale
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  Download and install the Tailscale app on your mobile device
                  from the App Store or Google Play.
                </p>
              </div>

              <div className="relative pl-10">
                <div className="absolute top-0 left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-200 bg-indigo-100 text-sm font-bold text-indigo-600 shadow-sm">
                  2
                </div>
                <h4 className="text-lg font-medium text-gray-900">
                  Connect to Network
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  Log in to Tailscale on your mobile device and ensure you are
                  connected to the same network (
                  <strong>{info?.nodeName || 'barcody-net'}</strong>).
                </p>
              </div>

              <div className="relative pl-10">
                <div className="absolute top-0 left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-200 bg-indigo-100 text-sm font-bold text-indigo-600 shadow-sm">
                  3
                </div>
                <h4 className="text-lg font-medium text-gray-900">
                  Scan QR Code
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  Open the Barcody mobile app, navigate to Settings, and select
                  &quot;Scan Setup Code&quot;. Scan the QR code shown here.
                </p>
              </div>

              <div className="relative pl-10">
                <div className="absolute top-0 left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-200 bg-indigo-100 text-sm font-bold text-indigo-600 shadow-sm">
                  4
                </div>
                <h4 className="text-lg font-medium text-gray-900">
                  Verify Connection
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  The app will automatically test the connection. If successful,
                  you&apos;re ready to start scanning barcodes!
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <p className="text-center text-xs text-gray-400">
                Host:{' '}
                <span className="font-mono text-gray-600">
                  {info?.hostname}
                </span>{' '}
                • MagicDNS:{' '}
                <span className="font-mono text-gray-600">
                  {info?.magicDNS}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
