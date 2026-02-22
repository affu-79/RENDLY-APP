'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { LoadingProvider } from '@/context/LoadingContext';

/**
 * Global loader in separate chunk so layout compiles fast.
 */
const GlobalLoaderClient = dynamic(() => import('./GlobalLoaderClient'), {
  ssr: false,
});

export default function LoadingProviderClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LoadingProvider>
      {children}
      <GlobalLoaderClient />
    </LoadingProvider>
  );
}
