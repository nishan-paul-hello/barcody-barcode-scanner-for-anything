'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Barcode } from 'lucide-react';

interface BarcodeInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLookup: (barcode: string) => void;
}

export function BarcodeInputDialog({
  open,
  onOpenChange,
  onLookup,
}: BarcodeInputDialogProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    onLookup(trimmed);
    setValue('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#1a1a1a] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-white">
            <div className="rounded-full bg-cyan-500/10 p-2 ring-1 ring-cyan-500/20">
              <Barcode className="size-4 text-cyan-400" />
            </div>
            Enter barcode
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Type a barcode number to look up product info (e.g. UPC, EAN).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="e.g. 012345678905"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-11 rounded-xl border-white/10 bg-white/5 font-mono text-white placeholder:text-white/30 focus-visible:ring-cyan-500/50"
            aria-label="Barcode number"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-white/10 text-white/80 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!value.trim()}
              className="rounded-xl bg-cyan-500 font-bold text-white hover:bg-cyan-600 disabled:opacity-50"
            >
              Look up
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
