'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/common/loading-screen';

const LoadingContext = createContext({
  isLoading: true,
  setIsLoading: (_loading: boolean) => {
    /* no-op */
  },
});

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial hydration loading (Hard Refresh)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1s to show off the premium loader
    return () => clearTimeout(timer);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading && <LoadingScreen />}
      <div
        className={
          isLoading
            ? 'opacity-0'
            : 'opacity-100 transition-opacity duration-500'
        }
      >
        {children}
      </div>
    </LoadingContext.Provider>
  );
}

export const useLoading = () => useContext(LoadingContext);
