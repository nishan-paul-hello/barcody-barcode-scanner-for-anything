'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Info, FileType, Maximize, Barcode } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ScanInfoDialog: React.FC = () => {
  const protocols = [
    'QR Code',
    'EAN-13',
    'EAN-8',
    'UPC-A',
    'UPC-E',
    'Code 128',
    'Code 39',
    'DataMatrix',
    'PDF417',
    'ITF',
  ];

  const uploadTypes = ['JPEG', 'PNG', 'WEBP'];
  const sizeLimit = '10MB';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full border border-white/5 bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-cyan-400"
        >
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2rem] border-white/10 bg-black/90 text-white backdrop-blur-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="mb-4 text-center text-xl font-bold tracking-tight">
            Scanning Specifications
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <FileType className="h-4 w-4" />
              <h4 className="text-xs font-black tracking-widest uppercase">
                Supported Assets
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {uploadTypes.map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[10px] font-bold text-white/60"
                >
                  {type}
                </span>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <Maximize className="h-4 w-4" />
              <h4 className="text-xs font-black tracking-widest uppercase">
                Size Constraint
              </h4>
            </div>
            <p className="pl-6 text-sm font-medium text-white/50">
              Maximum file size:{' '}
              <span className="font-bold text-white">{sizeLimit}</span>
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <Barcode className="h-4 w-4" />
              <h4 className="text-xs font-black tracking-widest uppercase">
                Encoded Protocols
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-2 pl-6">
              {protocols.map((protocol) => (
                <div key={protocol} className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-cyan-500/50" />
                  <span className="text-[11px] font-medium text-white/40">
                    {protocol}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};
