import { create } from 'zustand';

export type ConnectionStatus =
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error';

interface SocketState {
  status: ConnectionStatus;
  lastError: string | null;
  setStatus: (status: ConnectionStatus) => void;
  setLastError: (error: string | null) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  status: 'disconnected',
  lastError: null,
  setStatus: (status) => set({ status }),
  setLastError: (error) => set({ lastError: error }),
}));
