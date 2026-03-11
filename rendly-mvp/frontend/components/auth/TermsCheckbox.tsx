'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/hooks/useModal';
import TermsOfServiceModal from '@/components/legal/TermsOfServiceModal';
import PrivacyPolicyModal from '@/components/legal/PrivacyPolicyModal';

export default function TermsCheckbox() {
  const { termsChecked, setTermsChecked } = useAuth();
  const termsModal = useModal(false);
  const privacyModal = useModal(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mt-6">
        <label className="flex items-center justify-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={termsChecked}
            onChange={(e) => {
              if (e.target.checked) {
                termsModal.open();
              } else {
                setTermsChecked(false);
              }
            }}
            className="w-5 h-5 rounded border-2 border-[#dae3e5] bg-white_1 text-space_indigo focus:ring-2 focus:ring-glaucous focus:ring-offset-2 transition-all duration-150 cursor-pointer accent-space_indigo"
            aria-label="I agree to terms and privacy policy"
          />
          <span className="text-sm text-dusty_grape select-none">
            I agree to the{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                termsModal.open();
              }}
              className="text-primary underline underline-offset-2 hover:no-underline font-medium focus:outline-none focus:ring-2 focus:ring-glaucous focus:ring-offset-1 rounded"
            >
              Terms
            </button>
            {' '}and{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                privacyModal.open();
              }}
              className="text-primary underline underline-offset-2 hover:no-underline font-medium focus:outline-none focus:ring-2 focus:ring-glaucous focus:ring-offset-1 rounded"
            >
              Privacy Policy
            </button>
            {' '}of Rendly
          </span>
        </label>
      </div>
      <TermsOfServiceModal
        isOpen={termsModal.isOpen}
        onClose={termsModal.close}
        onAgree={() => setTermsChecked(true)}
      />
      <PrivacyPolicyModal isOpen={privacyModal.isOpen} onClose={privacyModal.close} />
    </>
  );
}
