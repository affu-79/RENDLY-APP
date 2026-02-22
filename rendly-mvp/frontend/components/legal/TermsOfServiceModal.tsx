'use client';

import React from 'react';
import ModalOverlay from './ModalOverlay';
import { LegalContentRenderer } from './LegalContentRenderer';
import { TERMS_SECTIONS } from '@/content/legalContent';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAgree?: () => void;
};

export default function TermsOfServiceModal({ isOpen, onClose, onAgree }: Props) {
  const footer = (
    <>
      {onAgree && (
        <button
          type="button"
          onClick={() => {
            onAgree();
            onClose();
          }}
          className="px-5 py-2.5 rounded-lg bg-space_indigo text-white font-medium text-sm hover:bg-space_indigo-600 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-glaucous focus:ring-offset-2"
        >
          I Agree
        </button>
      )}
      <button
        type="button"
        onClick={onClose}
        className="px-5 py-2.5 rounded-lg border-2 border-alabaster_grey bg-white_1 text-ink_black font-medium text-sm hover:bg-pale_sky_1-900 hover:border-pale_sky_1-700 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-glaucous focus:ring-offset-2"
      >
        Close
      </button>
    </>
  );

  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={onClose}
      title="Terms of Service"
      footer={footer}
      closeOnBackdropClick
    >
      <LegalContentRenderer sections={TERMS_SECTIONS} />
    </ModalOverlay>
  );
}
