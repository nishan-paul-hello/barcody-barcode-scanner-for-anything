import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface TabResult {
  lastResult: string | null;
  scanMetadata: {
    format: string;
    source: 'Camera' | 'Upload' | 'Manual entry';
    timestamp: string;
    fileName?: string;
  } | null;
  hasError: boolean;
  previewUrl: string | null;
}

interface ScanState {
  activeTab: 'camera' | 'file' | 'lookup';
  results: Record<'camera' | 'file' | 'lookup', TabResult>;
}

const initialTabState: TabResult = {
  lastResult: null,
  scanMetadata: null,
  hasError: false,
  previewUrl: null,
};

interface ScanStore extends ScanState {
  // Getters for active tab data
  getLastResult: () => string | null;
  getScanMetadata: () => TabResult['scanMetadata'];
  getHasError: () => boolean;
  getPreviewUrl: () => string | null;

  // Seters for active tab data
  setLastResult: (result: string | null) => void;
  setScanMetadata: (metadata: TabResult['scanMetadata']) => void;
  setHasError: (hasError: boolean) => void;
  setActiveTab: (tab: 'camera' | 'file' | 'lookup') => void;
  setPreviewUrl: (url: string | null) => void;
  resetAll: () => void;
  resetActiveTab: () => void;
}

export const useScanStore = create<ScanStore>()(
  persist(
    (set, get) => ({
      activeTab: 'camera',
      results: {
        camera: { ...initialTabState },
        file: { ...initialTabState },
        lookup: { ...initialTabState },
      },

      getLastResult: () => get().results[get().activeTab].lastResult,
      getScanMetadata: () => get().results[get().activeTab].scanMetadata,
      getHasError: () => get().results[get().activeTab].hasError,
      getPreviewUrl: () => get().results[get().activeTab].previewUrl,

      setLastResult: (lastResult) =>
        set((state) => ({
          results: {
            ...state.results,
            [state.activeTab]: {
              ...state.results[state.activeTab],
              lastResult,
            },
          },
        })),

      setScanMetadata: (scanMetadata) =>
        set((state) => ({
          results: {
            ...state.results,
            [state.activeTab]: {
              ...state.results[state.activeTab],
              scanMetadata,
            },
          },
        })),

      setHasError: (hasError) =>
        set((state) => ({
          results: {
            ...state.results,
            [state.activeTab]: { ...state.results[state.activeTab], hasError },
          },
        })),

      setActiveTab: (activeTab) => set({ activeTab }),

      setPreviewUrl: (previewUrl) =>
        set((state) => ({
          results: {
            ...state.results,
            [state.activeTab]: {
              ...state.results[state.activeTab],
              previewUrl,
            },
          },
        })),

      resetAll: () =>
        set({
          results: {
            camera: { ...initialTabState },
            file: { ...initialTabState },
            lookup: { ...initialTabState },
          },
        }),

      resetActiveTab: () =>
        set((state) => ({
          results: {
            ...state.results,
            [state.activeTab]: { ...initialTabState },
          },
        })),
    }),
    {
      name: 'scan-storage-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeTab: state.activeTab,
        results: {
          camera: {
            lastResult: state.results.camera.lastResult,
            scanMetadata: state.results.camera.scanMetadata,
            hasError: false,
            previewUrl: null,
          },
          file: {
            lastResult: state.results.file.lastResult,
            scanMetadata: state.results.file.scanMetadata,
            hasError: false,
            previewUrl: null,
          },
          lookup: {
            lastResult: state.results.lookup.lastResult,
            scanMetadata: state.results.lookup.scanMetadata,
            hasError: false,
            previewUrl: null,
          },
        },
      }),
    }
  )
);
