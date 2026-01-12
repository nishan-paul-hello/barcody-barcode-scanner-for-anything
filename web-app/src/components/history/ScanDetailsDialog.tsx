/* eslint-disable @next/next/no-img-element */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { type ScanResponseDto } from '@/lib/api/types';
import { Badge } from '@/components/ui/badge';

interface ScanDetailsDialogProps {
  scan: ScanResponseDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ScanDetailsDialog({
  scan,
  isOpen,
  onClose,
}: ScanDetailsDialogProps) {
  if (!scan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Scan Details</DialogTitle>
          <DialogDescription>
            Detailed information about this scan.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-foreground/70 text-sm font-medium">
              Barcode:
            </span>
            <span className="col-span-3 font-mono text-sm break-all">
              {scan.barcodeData}
            </span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-foreground/70 text-sm font-medium">
              Type:
            </span>
            <span className="col-span-3">
              <Badge variant="outline">{scan.barcodeType}</Badge>
            </span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-foreground/70 text-sm font-medium">
              Date:
            </span>
            <span className="col-span-3 text-sm">
              {new Date(scan.scannedAt).toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-foreground/70 text-sm font-medium">
              Device:
            </span>
            <span className="col-span-3 text-sm capitalize">
              {scan.deviceType}
            </span>
          </div>
          {scan.product && (
            <div className="grid grid-cols-4 items-start gap-4">
              <span className="text-foreground/70 text-sm font-medium">
                Product:
              </span>
              <div className="col-span-3 text-sm">
                <p className="font-medium">{scan.product.name}</p>
                {scan.product.brand && (
                  <p className="text-muted-foreground">{scan.product.brand}</p>
                )}
                {scan.product.images && scan.product.images.length > 0 && (
                  <img
                    src={scan.product.images[0]}
                    alt={scan.product.name}
                    className="mt-2 h-20 w-20 rounded-md border object-contain text-xs"
                  />
                )}
              </div>
            </div>
          )}
          {scan.metadata && Object.keys(scan.metadata).length > 0 && (
            <div className="grid grid-cols-4 items-start gap-4">
              <span className="text-foreground/70 text-sm font-medium">
                Metadata:
              </span>
              <div className="col-span-3 overflow-hidden text-sm">
                <pre className="bg-muted overflow-x-auto rounded-md p-2 text-xs">
                  {JSON.stringify(scan.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
