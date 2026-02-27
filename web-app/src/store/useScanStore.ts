import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ScanState {
  lastResult: string | null;
  scanMetadata: {
    format: string;
    source: 'Camera' | 'Upload' | 'Manual entry';
    timestamp: string;
  } | null;
  hasError: boolean;
  activeTab: 'camera' | 'file' | 'lookup';
  previewUrl: string | null; // Base64 or Blob storage (Blob won't persist across reloads, so Base64 is better for true persistence)
}

interface ScanStore extends ScanState {
  setLastResult: (result: string | null) => void;
  setScanMetadata: (metadata: ScanState['scanMetadata']) => void;
  setHasError: (hasError: boolean) => void;
  setActiveTab: (tab: 'camera' | 'file' | 'lookup') => void;
  setPreviewUrl: (url: string | null) => void;
  reset: () => void;
}

export const useScanStore = create<ScanStore>()(
  persist(
    (set) => ({
      lastResult: null,
      scanMetadata: null,
      hasError: false,
      activeTab: 'camera',
      previewUrl: null,

      setLastResult: (lastResult) => set({ lastResult }),
      setScanMetadata: (scanMetadata) => set({ scanMetadata }),
      setHasError: (hasError) => set({ hasError }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setPreviewUrl: (previewUrl) => set({ previewUrl }),
      reset: () =>
        set({
          lastResult: null,
          scanMetadata: null,
          hasError: false,
          previewUrl: null,
        }),
    }),
    {
      name: 'scan-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
