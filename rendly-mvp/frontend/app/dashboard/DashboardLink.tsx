'use client';

import React from 'react';
import Link from 'next/link';
import { useDashboardSidebar } from './DashboardSidebarContext';

/**
 * Use for links that leave the dashboard. Closes the right sidebar with animation, then navigates.
 */
export function DashboardLink({
  href,
  children,
  className,
  ...rest
}: React.ComponentProps<typeof Link>) {
  const ctx = useDashboardSidebar();
  const hrefStr = typeof href === 'string' ? href : (href?.pathname ?? '');
  const isOutsideDashboard = hrefStr.startsWith('/') && !hrefStr.startsWith('/dashboard');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isOutsideDashboard || !ctx) return;
    e.preventDefault();
    ctx.navigateAfterClose(hrefStr);
  };

  if (ctx && isOutsideDashboard) {
    return (
      <Link href={href} className={className} onClick={handleClick} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}
