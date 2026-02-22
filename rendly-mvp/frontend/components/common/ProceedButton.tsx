'use client';

import React from 'react';
import Link from 'next/link';

interface ProceedButtonProps {
  shouldShow?: boolean;
  delay?: number;
}

const buttonClass = `
  px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4
  rounded-full
  border-2 border-space_indigo
  bg-transparent
  text-space_indigo
  font-semibold text-sm sm:text-base md:text-lg
  transition-all duration-300
  hover:bg-space_indigo hover:text-white_1 hover:scale-105 hover:shadow-lg
  active:scale-[0.98]
  cursor-pointer
  focus:outline-none
  focus:ring-2 focus:ring-offset-2 focus:ring-glaucous
  focus:ring-offset-background
  tracking-wide
  inline-block text-center
`;

export function ProceedButton({ shouldShow = true }: ProceedButtonProps) {
  if (!shouldShow) return null;

  return (
    <Link
      href="/auth/login"
      prefetch
      className={buttonClass}
      style={{
        animation: 'proceedFadeIn 0.6s ease-out forwards',
      }}
    >
      PROCEED TO DASHBOARD
    </Link>
  );
}

export default ProceedButton;
