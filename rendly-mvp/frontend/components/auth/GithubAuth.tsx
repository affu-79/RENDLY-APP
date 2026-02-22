'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOAuth } from '@/hooks/useOAuth';

const GITHUB_BLACK = '#0D1117';

export default function GithubAuth() {
  const { github, setErrorMessage } = useAuth();
  const { redirectToGitHub } = useOAuth();
  const [pressing, setPressing] = useState(false);

  const handleClick = () => {
    if (github.verified) return;
    setErrorMessage(null);
    redirectToGitHub();
  };

  return (
    <div className="flex flex-col items-center gap-3 max-w-[280px] shrink-0 sm:w-auto">
      <button
        type="button"
        onClick={handleClick}
        onMouseDown={() => setPressing(true)}
        onMouseUp={() => setPressing(false)}
        onMouseLeave={() => setPressing(false)}
        disabled={github.verified}
        className="group w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] rounded-full flex items-center justify-center border-2 bg-gray-100 border-gray-200 transition-all duration-200 hover:scale-110 hover:bg-black hover:border-black active:scale-105 disabled:opacity-80 disabled:cursor-default disabled:hover:scale-100 disabled:active:scale-100 disabled:hover:bg-gray-100 disabled:hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 shrink-0"
        style={{
          backgroundColor: github.verified ? GITHUB_BLACK : undefined,
          borderColor: github.verified ? GITHUB_BLACK : undefined,
          transform: pressing && !github.verified ? 'scale(1.05)' : undefined,
        }}
        aria-label="Continue with GitHub"
      >
        <GitHubIcon
          className={`w-[60px] h-[60px] sm:w-[64px] sm:h-[64px] transition-colors duration-200 ${
            github.verified ? 'text-white' : 'text-black group-hover:text-white'
          }`}
        />
      </button>
      <div className="flex items-center justify-center gap-1.5 min-h-[22px] w-full text-center">
        {github.verified ? (
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

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
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
