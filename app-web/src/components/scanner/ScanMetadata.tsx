'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Clock,
  Activity,
  FileText,
  Barcode,
  Copy,
  Check,
  QrCode,
  Image as ImageIcon,
  Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ScanMetadataProps {
  result: string | null;
  format?: string;
  timestamp?: string;
  fileName?: string;
  previewUrl?: string | null;
  source?: string;
}

export const ScanMetadata: React.FC<ScanMetadataProps> = ({
  result,
  format = 'Unknown',
  timestamp,
  fileName,
  previewUrl,
  source,
}) => {
  const [copied, setCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  useEffect(() => {
    if (imageCopied) {
      const timer = setTimeout(() => setImageCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [imageCopied]);

  const handleCopy = () => {
    if (result) {
      void navigator.clipboard.writeText(result);
      setCopied(true);
    }
  };

  const handleCopyImage = async () => {
    if (!previewUrl) return;
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setImageCopied(true);
    } catch (err) {
      console.error('Failed to copy image:', err);
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' }).toLowerCase();
    const year = now.getFullYear();

    const hour24 = now.getHours();
    const ampm = hour24 >= 12 ? 'pm' : 'am';
    const hour12 = String(hour24 % 12 || 12).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const sec = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');

    const formattedDate = `${day}-${month}-${year}-${hour12}-${min}-${sec}-${ms}-${ampm}`;
    const name = `scan-${formattedDate}.png`;

    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const displayTimestamp = timestamp
    ? new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--:--';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <Card className="relative flex h-[480px] flex-col gap-0 overflow-hidden rounded-[2.5rem] border-white/5 bg-black/40 py-0 shadow-2xl backdrop-blur-3xl">
        <CardHeader className="relative z-10 border-b border-white/5 bg-white/[0.02] px-6 py-[18px]">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-cyan-400" />
            <CardTitle className="text-xs font-bold tracking-widest text-white/90 uppercase">
              Barcode Details
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 flex min-h-0 flex-1 flex-col space-y-4 p-5">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="data"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex min-h-0 flex-1 flex-col space-y-4"
              >
                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2 rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-3 w-3 text-orange-400/70" />
                      <span className="text-[9px] font-black tracking-widest text-white/40 uppercase">
                        Code Type
                      </span>
                    </div>
                    <p className="truncate text-xs font-bold text-white/70 uppercase">
                      {format}
                    </p>
                  </div>
                  <div className="space-y-2 rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-purple-400/60" />
                      <span className="text-[9px] font-black tracking-widest text-white/40 uppercase">
                        Detected At
                      </span>
                    </div>
                    <p className="font-mono text-[11px] font-bold text-white/70">
                      {displayTimestamp}
                    </p>
                  </div>
                </div>

                {/* Asset Name */}
                {fileName && (
                  <div className="flex h-[52px] items-center justify-between rounded-2xl bg-white/[0.02] px-4 ring-1 ring-white/5">
                    <div className="flex items-center gap-3">
                      <FileText className="h-3.5 w-3.5 text-yellow-400/60" />
                      <span className="text-[10px] font-bold tracking-wider text-white/40 uppercase">
                        Asset Name
                      </span>
                    </div>
                    <span className="max-w-[140px] truncate text-[10px] font-black tracking-widest text-white uppercase">
                      {fileName}
                    </span>
                  </div>
                )}

                {/* Captured Image - Only shown for Live Camera scans */}
                {previewUrl && source === 'Camera' && (
                  <div className="group/img relative flex h-[52px] items-center justify-between rounded-2xl bg-white/[0.02] px-4 ring-1 ring-white/5 transition-all hover:bg-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="h-3.5 w-3.5 text-blue-400/60" />
                      <span className="text-[10px] font-bold tracking-wider text-white/40 uppercase">
                        Captured Image
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 transition-all">
                        <button
                          type="button"
                          onClick={handleCopyImage}
                          title="Copy Image"
                          className="cursor-pointer rounded-md p-1.5 text-white/40 transition-all hover:bg-white/10 hover:text-white"
                        >
                          {imageCopied ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleDownload}
                          title="Download Image"
                          className="cursor-pointer rounded-md p-1.5 text-white/40 transition-all hover:bg-white/10 hover:text-white"
                        >
                          <Download className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="relative h-8 w-12 overflow-hidden rounded-lg border border-white/10 bg-black/40 shadow-inner">
                        <Image
                          src={previewUrl}
                          alt="Captured preview"
                          fill
                          className="object-cover transition-transform group-hover/img:scale-110"
                          unoptimized
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Barcode Content Block */}
                <div className="group relative flex min-h-0 flex-1 flex-col">
                  <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] transition-all group-hover:bg-white/[0.05]">
                    {/* Header segment inside the box */}
                    <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Barcode className="h-3 w-3 text-emerald-400/60" />
                        <span className="text-[9px] font-black tracking-widest text-white/40 uppercase">
                          Barcode Content
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="cursor-pointer rounded-md p-1 opacity-60 transition-all hover:bg-cyan-500/10 hover:text-cyan-400 hover:opacity-100"
                      >
                        {copied ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>

                    {/* Content Area with Contained Scrollbar */}
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:!bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent">
                      <p className="font-mono text-[12px] leading-relaxed break-all text-white/70">
                        {result}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};
