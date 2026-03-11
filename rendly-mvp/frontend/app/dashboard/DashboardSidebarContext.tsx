'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';

const SIDEBAR_CLOSE_MS = 500;
const BRAND_OUT_MS = 400;

type DashboardSidebarContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  navigateAfterClose: (href: string) => void;
};

const DashboardSidebarContext = createContext<DashboardSidebarContextValue | null>(null);

export function useDashboardSidebar() {
  const ctx = useContext(DashboardSidebarContext);
  if (!ctx) return null;
  return ctx;
}

export function DashboardSidebarProvider({
  children,
  sidebarOpen,
  setSidebarOpen,
  onBeforeNavigate,
}: {
  children: React.ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onBeforeNavigate?: () => void;
}) {
  const router = useRouter();

  const navigateAfterClose = useCallback(
    (href: string) => {
      setSidebarOpen(false);
      setTimeout(() => {
        onBeforeNavigate?.();
        setTimeout(() => {
          router.push(href);
        }, BRAND_OUT_MS);
      }, SIDEBAR_CLOSE_MS);
    },
    [setSidebarOpen, router, onBeforeNavigate]
  );

  const value: DashboardSidebarContextValue = {
    sidebarOpen,
    setSidebarOpen,
    navigateAfterClose,
  };

  return (
    <DashboardSidebarContext.Provider value={value}>
      {children}
    </DashboardSidebarContext.Provider>
  );
}

export { SIDEBAR_CLOSE_MS, BRAND_OUT_MS };
