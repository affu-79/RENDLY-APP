'use client';

import React from 'react';
import ModalOverlay from './ModalOverlay';
import { LegalContentRenderer } from './LegalContentRenderer';
import { PRIVACY_SECTIONS } from '@/content/legalContent';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function PrivacyPolicyModal({ isOpen, onClose }: Props) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={onClose}
      title="Privacy Policy"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-lg border-2 border-alabaster_grey bg-white_1 text-ink_black font-medium text-sm hover:bg-pale_sky_1-900 hover:border-pale_sky_1-700 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-glaucous focus:ring-offset-2"
        >
          Close
        </button>
      }
      closeOnBackdropClick
    >
      <LegalContentRenderer sections={PRIVACY_SECTIONS} />
    </ModalOverlay>
  );
}
