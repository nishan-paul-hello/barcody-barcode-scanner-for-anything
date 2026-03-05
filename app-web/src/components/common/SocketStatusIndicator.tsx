import React from 'react';
import { useSocketStore } from '@/store/useSocketStore';
import { cn } from '@/lib/utils';
import { Zap, ZapOff, RefreshCcw } from 'lucide-react';

export const SocketStatusIndicator: React.FC = () => {
  const { status, lastError } = useSocketStore();

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: 'text-green-500',
          bg: 'bg-green-500',
          label: 'Live',
          icon: <Zap className="h-3 w-3" />,
          animation: 'animate-ping',
        };
      case 'reconnecting':
        return {
          color: 'text-yellow-500',
          bg: 'bg-yellow-500',
          label: 'Reconnecting',
          icon: <RefreshCcw className="h-3 w-3 animate-spin" />,
          animation: '',
        };
      case 'disconnected':
      case 'error':
        return {
          color: 'text-red-500',
          bg: 'bg-red-500',
          label: status === 'error' ? 'Error' : 'Offline',
          icon: <ZapOff className="h-3 w-3" />,
          animation: '',
        };
      default:
        return {
          color: 'text-gray-500',
          bg: 'bg-gray-500',
          label: 'Inactive',
          icon: <ZapOff className="h-3 w-3" />,
          animation: '',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className="bg-secondary/50 border-border/50 hover:bg-secondary/80 group flex cursor-default items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-sm transition-all duration-300"
      title={lastError || `WebSocket: ${config.label}`}
    >
      <div className="relative flex h-2 w-2">
        {config.animation && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75',
              config.animation,
              config.bg
            )}
          ></span>
        )}
        <span
          className={cn('relative inline-flex h-2 w-2 rounded-full', config.bg)}
        ></span>
      </div>
      <span
        className={cn(
          'text-[10px] font-bold tracking-widest uppercase transition-colors',
          config.color
        )}
      >
        {config.label}
      </span>
      <div className="hidden transition-all duration-300 group-hover:block">
        {config.icon}
      </div>
    </div>
  );
};
