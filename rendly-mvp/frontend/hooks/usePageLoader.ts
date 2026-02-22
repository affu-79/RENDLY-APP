'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLoading } from '@/context/LoadingContext';

/**
 * usePageLoader: simplifies loading for pages.
 * - On mount: call startLoading() so DelayedLoader can show after 300ms if data is slow.
 * - If dataPromise provided: await it then stopLoading(); if it resolves before 300ms, spinner never shows.
 * - frontendReady: true as soon as skeleton is visible (immediate).
 *
 * @param dataPromise - Optional promise (e.g. fetch). When it resolves, stopLoading() is called.
 * @param loadingMessage - Message shown in spinner when visible.
 * @returns { isLoading, dataReady, frontendReady }
 */
export function usePageLoader<T = unknown>(options?: {
  dataPromise?: Promise<T> | null;
  loadingMessage?: string;
}) {
  const { startLoading, stopLoading, setMessage, isLoading } = useLoading();
  const [dataReady, setDataReady] = useState(false);
  const [frontendReady] = useState(true); // Skeleton is already visible at 0ms

  const { dataPromise, loadingMessage } = options ?? {};

  useEffect(() => {
    if (!dataPromise) {
      setDataReady(true);
      return;
    }
    startLoading(loadingMessage);
    let cancelled = false;
    dataPromise
      .then(() => {
        if (!cancelled) {
          setDataReady(true);
          stopLoading();
        }
      })
      .catch(() => {
        if (!cancelled) stopLoading();
      });
    return () => {
      cancelled = true;
      stopLoading();
    };
  }, [dataPromise, loadingMessage, startLoading, stopLoading]);

  const setLoadingMessage = useCallback(
    (msg: string | null) => {
      setMessage(msg);
    },
    [setMessage]
  );

  return {
    isLoading,
    dataReady,
    frontendReady,
    setLoadingMessage,
  };
}
