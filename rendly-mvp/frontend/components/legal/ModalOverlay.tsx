'use client';

import React, { useEffect, useRef, useState } from 'react';

const OVERLAY_STYLES = {
  overlay:
    'fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:items-start md:justify-center md:pt-24 md:pb-6 md:px-6 lg:items-start lg:justify-center lg:pt-24 lg:pb-6 lg:px-6 xl:items-center xl:py-6 xl:p-6',
  backdrop:
    'absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300 ease-out',
  container:
    'relative z-10 w-[90%] sm:w-[85%] md:w-[75%] lg:w-[70%] max-w-[900px] max-h-[85vh] md:h-[58vh] md:max-h-[58vh] lg:h-[58vh] lg:max-h-[58vh] xl:max-h-[90vh] xl:h-auto flex flex-col rounded-xl border-2 border-alabaster_grey bg-white_1 shadow-2xl transition-all duration-300 ease-out mx-auto',
  header: 'flex items-center justify-between shrink-0 px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-5 border-b border-alabaster_grey',
  title: 'font-chillax font-bold text-ink_black text-xl sm:text-2xl md:text-3xl',
  closeButton:
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pale_sky_1-900 text-ink_black transition-all duration-150 hover:bg-pale_sky_1-700 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-glaucous focus:ring-offset-2',
  body: 'flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-5',
  footer: 'shrink-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 px-4 py-4 sm:px-5 md:px-6 border-t border-alabaster_grey',
};

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

type ModalOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** If true, clicking the backdrop closes the modal */
  closeOnBackdropClick?: boolean;
};

export default function ModalOverlay({
  isOpen,
  onClose,
  title,
  children,
  footer,
  closeOnBackdropClick = true,
}: ModalOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setShow(true);
    else {
      const t = setTimeout(() => setShow(false), 220);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (show) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [show]);

  const exiting = !isOpen && show;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (!closeOnBackdropClick || exiting) return;
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div
      ref={overlayRef}
      className={OVERLAY_STYLES.overlay}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`${OVERLAY_STYLES.backdrop} ${exiting ? 'opacity-0' : 'opacity-100'}`}
        aria-hidden
      />
      <div
        ref={containerRef}
        className={`${OVERLAY_STYLES.container} ${exiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={OVERLAY_STYLES.header}>
          <h1 id="modal-title" className={OVERLAY_STYLES.title} style={{ fontFamily: 'var(--font-chillax)' }}>
            {title}
          </h1>
          <button
            type="button"
            onClick={onClose}
            className={OVERLAY_STYLES.closeButton}
            aria-label="Close modal"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>
        <div className={OVERLAY_STYLES.body}>{children}</div>
        {footer != null && <footer className={OVERLAY_STYLES.footer}>{footer}</footer>}
      </div>
    </div>
  );
}
