'use client';

import React from 'react';
import { useLoading } from '@/context/LoadingContext';
import DelayedLoader from './DelayedLoader';

/**
 * GlobalLoaderClient: connects LoadingContext to DelayedLoader.
 * Place once in root layout. When any page calls startLoading(), spinner
 * appears after 300ms (only if still loading). Skeleton is separate (Suspense).
 */
export default function GlobalLoaderClient() {
  const { isLoading, message } = useLoading();

  return (
    <DelayedLoader
      isActive={isLoading}
      delay={300}
      message={message}
      showOverlay={true}
      size="md"
    />
  );
}
