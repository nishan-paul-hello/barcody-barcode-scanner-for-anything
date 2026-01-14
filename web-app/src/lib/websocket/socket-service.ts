import { io, type Socket } from 'socket.io-client';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocketStore } from '@/store/useSocketStore';
import type { ScanResponseDto, PaginatedResponse } from '@/lib/api/types';
import { toast } from 'sonner';

interface QueuedMessage {
  event: string;
  args: unknown[];
}

class SocketService {
  private socket: Socket | null = null;
  private messageQueue: QueuedMessage[] = [];
  private readonly MAX_QUEUE_SIZE = 50;
  private reconnectionAttempts = 0;
  private readonly MAX_RETRY_ATTEMPTS = 10;

  connect() {
    const { accessToken } = useAuthStore.getState();

    if (!accessToken) {
      console.warn('SocketService: No access token found, skipping connection');
      return;
    }

    if (this.socket?.connected) {
      return;
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ||
      'http://localhost:3002';

    // Connect to the 'scans' namespace as defined in the backend gateway
    this.socket = io(`${backendUrl}/scans`, {
      auth: { token: accessToken },
      query: { token: accessToken }, // Fallback for some clients
      reconnection: true,
      reconnectionAttempts: this.MAX_RETRY_ATTEMPTS,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      randomizationFactor: 0, // Ensure exact 1s, 2s, 4s, 8s... doubling
      timeout: 20000,
      transports: ['websocket', 'polling'], // Allow fallback
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    const { setStatus, setLastError } = useSocketStore.getState();

    this.socket.on('connect', () => {
      console.warn('WebSocket connected');
      setStatus('connected');
      setLastError(null);
      this.reconnectionAttempts = 0;
      this.flushQueue();
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('WebSocket disconnected:', reason);
      if (
        reason === 'io server disconnect' ||
        reason === 'io client disconnect'
      ) {
        setStatus('disconnected');
      } else {
        setStatus('reconnecting');
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectionAttempts++;
      setLastError(error.message);

      if (this.reconnectionAttempts >= this.MAX_RETRY_ATTEMPTS) {
        setStatus('error');
      } else {
        setStatus('reconnecting');
      }
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.warn(`WebSocket reconnection attempt #${attempt}`);
      setStatus('reconnecting');
      this.reconnectionAttempts = attempt;
    });

    // Business Logic Events
    this.socket.on('scan:created', (scan: ScanResponseDto) => {
      this.handleScanCreated(scan);
    });

    this.socket.on('scan:deleted', (data: { id: string }) => {
      this.handleScanDeleted(data.id);
    });
  }

  private handleScanCreated(scan: ScanResponseDto) {
    console.warn('Real-time: Scan created', scan);
    toast.success(`New scan received: ${scan.barcodeData}`, {
      description: scan.product?.name || 'Product details pending...',
    });

    // Invalidate the scans list to trigger a refetch
    // This ensures consistency even if we don't manually update the cache
    queryClient.invalidateQueries({ queryKey: ['scans'] });

    // Add to cache if this is a list view or update existing items
    queryClient.setQueryData(
      ['scans'],
      (oldData: PaginatedResponse<ScanResponseDto> | undefined) => {
        if (!oldData || !oldData.items) return oldData;
        return {
          ...oldData,
          items: [scan, ...oldData.items].slice(0, oldData.meta.limit || 50),
          meta: {
            ...oldData.meta,
            total: (oldData.meta.total || 0) + 1,
          },
        };
      }
    );
  }

  private handleScanDeleted(id: string) {
    console.warn('Real-time: Scan deleted', id);
    queryClient.invalidateQueries({ queryKey: ['scans'] });

    queryClient.setQueryData(
      ['scans'],
      (oldData: PaginatedResponse<ScanResponseDto> | undefined) => {
        if (!oldData || !oldData.items) return oldData;
        return {
          ...oldData,
          items: oldData.items.filter(
            (item: ScanResponseDto) => item.id !== id
          ),
          meta: {
            ...oldData.meta,
            total: Math.max(0, (oldData.meta.total || 0) - 1),
          },
        };
      }
    );
  }

  emit(event: string, ...args: unknown[]) {
    if (this.socket?.connected) {
      this.socket.emit(event, ...args);
    } else {
      console.warn(`WebSocket not connected. Queueing message: ${event}`);
      if (this.messageQueue.length >= this.MAX_QUEUE_SIZE) {
        this.messageQueue.shift(); // Discard oldest if queue is full
      }
      this.messageQueue.push({ event, args });
    }
  }

  private flushQueue() {
    if (!this.socket?.connected) return;

    console.warn(`Flushing ${this.messageQueue.length} queued messages`);
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      if (msg) {
        this.socket.emit(msg.event, ...msg.args);
      }
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      useSocketStore.getState().setStatus('disconnected');
    }
  }
}

export const socketService = new SocketService();
