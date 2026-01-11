'use client';

import { useState } from 'react';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Scan, Info } from 'lucide-react';

export default function ScanPage() {
  const [lastResult, setLastResult] = useState<string | null>(null);

  return (
    <div className="animate-in fade-in container max-w-4xl space-y-8 py-6 duration-500">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Scanner</h1>
        <p className="text-muted-foreground">
          Scan any barcode or QR code using your device camera.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <BarcodeScanner
            onScanSuccess={(result) => setLastResult(result.getText())}
          />

          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-cyan-500" />
                Scanning Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground list-disc space-y-2 pl-4 text-sm">
                <li>Ensure there is enough light on the barcode.</li>
                <li>
                  Hold the device steady and center the barcode in the frame.
                </li>
                <li>Try switching cameras if detection is slow.</li>
                <li>Keep the barcode at a medium distance (about 10-15cm).</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="h-fit border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Last Scan</CardTitle>
              <CardDescription>Recently detected barcode data</CardDescription>
            </CardHeader>
            <CardContent>
              {lastResult ? (
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 break-all">
                  <p className="font-mono text-sm text-cyan-400">
                    {lastResult}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/5 py-8 text-center">
                  <Scan className="text-muted-foreground/30 mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-xs">No scans yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500 p-1 opacity-50" />
            <CardHeader>
              <CardTitle className="text-muted-foreground text-lg text-[10px] font-black tracking-widest uppercase">
                Supported Formats
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {[
                'QR Code',
                'EAN-13',
                'UPC-A',
                'Code 128',
                'DataMatrix',
                'PDF417',
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center space-x-2 rounded-md bg-white/5 px-2 py-1 text-[11px] font-medium text-white/50"
                >
                  <div className="h-1 w-1 rounded-full bg-cyan-500" />
                  <span>{f}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
