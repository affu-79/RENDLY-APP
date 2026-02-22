'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

/**
 * Loading context manages ONLY the spinner (DelayedLoader) visibility.
 * Skeletons are controlled by Suspense fallbacks and render at 0ms.
 * Spinner shows after 300ms only when isLoading is true.
 */

type LoadingContextValue = {
  isLoading: boolean;
  message: string | null;
  startLoading: (msg?: string) => void;
  stopLoading: () => void;
  setMessage: (msg: string | null) => void;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessageState] = useState<string | null>(null);

  const startLoading = useCallback((msg?: string) => {
    setIsLoading(true);
    setMessageState(msg ?? null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setMessageState(null);
  }, []);

  const setMessage = useCallback((msg: string | null) => {
    setMessageState(msg);
  }, []);

  const value: LoadingContextValue = {
    isLoading,
    message,
    startLoading,
    stopLoading,
    setMessage,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading(): LoadingContextValue {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return ctx;
}
