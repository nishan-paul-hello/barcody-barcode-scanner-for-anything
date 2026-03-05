import { create } from 'zustand';

interface UIState {
  isLoginModalOpen: boolean;
  isApiKeysModalOpen: boolean;
  pendingRedirectPath: string | null;
  openLoginModal: (redirectPath?: string) => void;
  closeLoginModal: () => void;
  setPendingRedirectPath: (path: string | null) => void;
  setApiKeysModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoginModalOpen: false,
  isApiKeysModalOpen: false,
  pendingRedirectPath: null,
  openLoginModal: (redirectPath) =>
    set({
      isLoginModalOpen: true,
      pendingRedirectPath: redirectPath || null,
    }),
  closeLoginModal: () =>
    set({ isLoginModalOpen: false, pendingRedirectPath: null }),
  setPendingRedirectPath: (path) => set({ pendingRedirectPath: path }),
  setApiKeysModalOpen: (open) => set({ isApiKeysModalOpen: open }),
}));
