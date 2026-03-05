'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { socketService } from '@/lib/websocket/socket-service';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, accessToken } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      console.warn('SocketProvider: User authenticated, connecting socket...');
      socketService.connect();
    } else {
      console.warn(
        'SocketProvider: User not authenticated, disconnecting socket...'
      );
      socketService.disconnect();
    }

    return () => {
      // Cleanup on unmount
      socketService.disconnect();
    };
  }, [isAuthenticated, accessToken]);

  return <>{children}</>;
};
