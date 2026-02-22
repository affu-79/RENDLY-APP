'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useOAuth } from '@/hooks/useOAuth';

export default function ContinueButton() {
  const router = useRouter();
  const { canContinue, setErrorMessage } = useAuth();
  const { continueToDashboard } = useOAuth();
  const [loading, setLoading] = useState(false);
  const [pressing, setPressing] = useState(false);

  const handleClick = async () => {
    if (!canContinue || loading) return;
    setErrorMessage(null);
    setPressing(true);
    await new Promise((r) => setTimeout(r, 120));
    setPressing(false);
    await new Promise((r) => setTimeout(r, 220));
    setLoading(true);
    try {
      // Show loader for 2.5s to load profile page data (even if no data)
      await new Promise((r) => setTimeout(r, 2500));
      const redirectUrl = await continueToDashboard();
      router.push(redirectUrl);
    } catch {
      setErrorMessage('Unable to continue. Please try again.');
      setLoading(false);
    }
  };

  if (!canContinue) return null;

  return (
    <div
      className="w-full max-w-md mt-6 mx-auto flex justify-center"
      style={{ animation: 'proceedFadeIn 0.4s ease-out forwards' }}
    >
      <button
        type="button"
        onClick={handleClick}
        onMouseDown={() => !loading && setPressing(true)}
        onMouseUp={() => setPressing(false)}
        onMouseLeave={() => setPressing(false)}
        disabled={loading}
        className={`group w-full sm:w-auto py-3 px-5 sm:py-2.5 rounded-full border-2 font-bold text-sm inline-flex items-center justify-center gap-2 transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 disabled:cursor-not-allowed ${
          loading
            ? 'bg-[#0D1117] text-white border-[#0D1117]'
            : 'border-black bg-transparent text-black hover:bg-[#0D1117] hover:text-white hover:border-[#0D1117]'
        }`}
        style={{
          transform: pressing ? 'scale(0.96)' : 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s, color 0.2s, border-color 0.2s',
        }}
        aria-label="Continue to Dashboard"
      >
        {loading ? (
          <>
            <LoaderIcon className="w-4 h-4 shrink-0 animate-spin" />
            <span>Please wait...</span>
          </>
        ) : (
          <>
            <ArrowRightIcon className="w-4 h-4 text-current transition-colors duration-200 group-hover:text-white" />
            <span>Continue to Dashboard</span>
          </>
        )}
      </button>
    </div>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
