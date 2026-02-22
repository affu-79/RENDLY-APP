'use client';

import React from 'react';

/**
 * Base skeleton wrapper with CSS-only pulsing (no framer-motion for fast compile).
 */
function SkeletonBase({
  className = '',
  children,
  style,
}: {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={style}
      aria-hidden
    >
      {children}
    </div>
  );
}

/**
 * Text skeleton: animated gray line(s) for loading text.
 * @param lines - Number of lines (default 1)
 * @param className - Optional Tailwind classes
 */
export function TextSkeleton({
  lines = 1,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          className="h-4 rounded"
          style={{ width: i === lines - 1 && lines > 1 ? '75%' : '100%' }}
        />
      ))}
    </div>
  );
}

/**
 * Card skeleton: gray box with title + description lines.
 */
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-gray-200 p-4 ${className}`}>
      <SkeletonBase className="mb-3 h-5 w-3/4 rounded" />
      <TextSkeleton lines={3} className="mt-2" />
    </div>
  );
}

/**
 * Image skeleton: large gray rectangle for loading images.
 */
export function ImageSkeleton({
  className = '',
  aspectRatio = 'aspect-video',
}: {
  className?: string;
  aspectRatio?: string;
}) {
  return (
    <SkeletonBase className={`rounded-lg ${aspectRatio} w-full ${className}`} />
  );
}

/**
 * Avatar skeleton: small circle for profile pictures.
 */
export function AvatarSkeleton({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClass =
    size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  return (
    <SkeletonBase className={`rounded-full ${sizeClass} ${className}`} />
  );
}

/**
 * Button skeleton: pill-shaped gray box.
 */
export function ButtonSkeleton({
  className = '',
  width = 'w-24',
}: {
  className?: string;
  width?: string;
}) {
  return (
    <SkeletonBase className={`h-10 rounded-full ${width} ${className}`} />
  );
}

/**
 * Header skeleton: logo + nav items + button.
 */
export function HeaderSkeleton({ className = '' }: { className?: string }) {
  return (
    <header
      className={`flex items-center justify-between border-b border-gray-200 px-4 py-3 ${className}`}
    >
      <SkeletonBase className="h-8 w-32 rounded" />
      <div className="flex gap-4">
        <SkeletonBase className="h-4 w-16 rounded" />
        <SkeletonBase className="h-4 w-16 rounded" />
        <ButtonSkeleton width="w-24" />
      </div>
    </header>
  );
}

/**
 * Sidebar skeleton: menu item lines.
 */
export function SidebarSkeleton({ className = '' }: { className?: string }) {
  return (
    <aside className={`w-56 space-y-2 p-4 ${className}`}>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonBase key={i} className="h-9 w-full rounded" />
      ))}
    </aside>
  );
}

/**
 * Full page skeleton: header + main content area with cards.
 * Use as instant fallback in loading.tsx so user never sees blank page.
 */
export function PageSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <HeaderSkeleton />
      <main className="p-4 md:p-6">
        <div className="mx-auto max-w-6xl">
          <SkeletonBase className="mb-6 h-8 w-48 rounded" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
}

export default {
  TextSkeleton,
  CardSkeleton,
  ImageSkeleton,
  AvatarSkeleton,
  ButtonSkeleton,
  HeaderSkeleton,
  SidebarSkeleton,
  PageSkeleton,
};
