'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApiKeys, useUpdateApiKeys } from '@/hooks/use-api-keys';

interface ApiKeysModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiKeysModal({ open, onOpenChange }: ApiKeysModalProps) {
  const { data, isLoading } = useApiKeys();
  const updateMutation = useUpdateApiKeys();

  const [upcKey, setUpcKey] = React.useState('');
  const [barcodeKey, setBarcodeKey] = React.useState('');

  React.useEffect(() => {
    if (open && data && !isLoading) {
      setUpcKey(data.upcDatabaseApiKey || '');
      setBarcodeKey(data.barcodeLookupApiKey || '');
    }
  }, [open, data, isLoading]);

  const handleSave = () => {
    updateMutation.mutate(
      {
        upcDatabaseApiKey: upcKey || undefined,
        barcodeLookupApiKey: barcodeKey || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>External Barcode API Keys</DialogTitle>
          <DialogDescription>
            Configure the API keys used for UPC Database and Barcode Lookup.
            These keys are stored per account and override any environment
            values.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              UPC_DATABASE_API_KEY
            </label>
            <Input
              placeholder="Your UPC Database API key"
              value={upcKey}
              onChange={(e) => setUpcKey(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              BARCODE_LOOKUP_API_KEY
            </label>
            <Input
              placeholder="Your Barcode Lookup API key"
              value={barcodeKey}
              onChange={(e) => setBarcodeKey(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save keys'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
