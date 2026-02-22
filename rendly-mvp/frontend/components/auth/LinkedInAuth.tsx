'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOAuth } from '@/hooks/useOAuth';

const LINKEDIN_BLUE = '#0A66C2';

export default function LinkedInAuth() {
  const { linkedin, setErrorMessage } = useAuth();
  const { redirectToLinkedIn } = useOAuth();
  const [pressing, setPressing] = useState(false);

  const handleClick = () => {
    if (linkedin.verified) return;
    setErrorMessage(null);
    redirectToLinkedIn();
  };

  return (
    <div className="flex flex-col items-center gap-3 max-w-[280px] shrink-0 sm:w-auto">
      <button
        type="button"
        onClick={handleClick}
        onMouseDown={() => setPressing(true)}
        onMouseUp={() => setPressing(false)}
        onMouseLeave={() => setPressing(false)}
        disabled={linkedin.verified}
        className="group w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] rounded-full flex items-center justify-center border-2 bg-gray-100 border-gray-200 transition-all duration-200 hover:scale-110 hover:bg-[#0A66C2] hover:border-[#0A66C2] active:scale-105 disabled:opacity-80 disabled:cursor-default disabled:hover:scale-100 disabled:active:scale-100 disabled:hover:bg-gray-100 disabled:hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A66C2] shrink-0"
        style={{
          backgroundColor: linkedin.verified ? LINKEDIN_BLUE : undefined,
          borderColor: linkedin.verified ? LINKEDIN_BLUE : undefined,
          transform: pressing && !linkedin.verified ? 'scale(1.05)' : undefined,
        }}
        aria-label="Continue with LinkedIn"
      >
        <LinkedInIcon
          className={`w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] transition-colors duration-200 ${
            linkedin.verified ? 'text-white' : 'text-[#0A66C2] group-hover:text-white'
          }`}
        />
      </button>
      <div className="flex items-center justify-center gap-1.5 min-h-[22px] w-full text-center">
        {linkedin.verified ? (
          <>
            <VerifiedTickIcon className="w-5 h-5 shrink-0 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600">Verified</span>
          </>
        ) : (
          <span className="text-sm text-dusty_grape">Not Verified</span>
        )}
      </div>
    </div>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function VerifiedTickIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
