import { create } from 'zustand';

interface UIStore {
  isLoginModalOpen: boolean;
  pendingRedirectPath: string | null;
  openLoginModal: (redirectPath?: string) => void;
  closeLoginModal: () => void;
  setPendingRedirectPath: (path: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isLoginModalOpen: false,
  pendingRedirectPath: null,
  openLoginModal: (redirectPath) =>
    set({
      isLoginModalOpen: true,
      pendingRedirectPath: redirectPath || null,
    }),
  closeLoginModal: () =>
    set({ isLoginModalOpen: false, pendingRedirectPath: null }),
  setPendingRedirectPath: (path) => set({ pendingRedirectPath: path }),
}));
