'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import GithubAuth from '@/components/auth/GithubAuth';
import LinkedInAuth from '@/components/auth/LinkedInAuth';
import TermsCheckbox from '@/components/auth/TermsCheckbox';
import ContinueButton from '@/components/auth/ContinueButton';
import { useOAuth } from '@/hooks/useOAuth';

const GITHUB_STORAGE_KEY = 'rendly_oauth_github';
const LINKEDIN_STORAGE_KEY = 'rendly_oauth_linkedin';

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function clearVerification() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(GITHUB_STORAGE_KEY);
    localStorage.removeItem(LINKEDIN_STORAGE_KEY);
  } catch {
    // ignore
  }
  window.location.href = '/auth/sign-up';
}

function SignUpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    errorMessage,
    setErrorMessage,
    clearError,
    setGithubVerified,
    setLinkedinVerified,
    clearGithub,
    clearLinkedin,
    github,
    linkedin,
    termsChecked,
  } = useAuth();
  const { redirectToGitHub, redirectToLinkedIn } = useOAuth();
  const anyVerified = github.verified || linkedin.verified;
  const showTermsHint = anyVerified && !termsChecked;
  const otherFrozen = anyVerified;

  const onGitHubClick = () => {
    if (github.verified || linkedin.verified) return;
    setErrorMessage(null);
    redirectToGitHub();
  };
  const onLinkedInClick = () => {
    if (linkedin.verified || github.verified) return;
    setErrorMessage(null);
    redirectToLinkedIn();
  };

  useEffect(() => {
    try {
      const githubRaw = localStorage.getItem(GITHUB_STORAGE_KEY);
      const linkedinRaw = localStorage.getItem(LINKEDIN_STORAGE_KEY);
      const githubOk = (() => {
        if (!githubRaw) return false;
        try {
          const d = JSON.parse(githubRaw);
          return !!(d?.verified && d?.token);
        } catch {
          return false;
        }
      })();
      const linkedinOk = (() => {
        if (!linkedinRaw) return false;
        try {
          const d = JSON.parse(linkedinRaw);
          return !!(d?.verified && d?.token);
        } catch {
          return false;
        }
      })();
      if (githubOk && linkedinOk) {
        localStorage.removeItem(LINKEDIN_STORAGE_KEY);
        const d = JSON.parse(githubRaw!);
        clearLinkedin();
        setGithubVerified({ user: d.user, token: d.token });
      } else if (githubOk) {
        const d = JSON.parse(githubRaw!);
        clearLinkedin();
        setGithubVerified({ user: d.user, token: d.token });
      } else if (linkedinOk) {
        const d = JSON.parse(linkedinRaw!);
        clearGithub();
        setLinkedinVerified({ user: d.user, token: d.token });
      }
    } catch {
      // ignore
    }
    const verified = searchParams.get('verified');
    if (verified === 'github' || verified === 'linkedin') {
      router.replace('/auth/sign-up', { scroll: false });
    }
  }, [searchParams, router, setGithubVerified, setLinkedinVerified, clearGithub, clearLinkedin]);

  useEffect(() => {
    if (!errorMessage) return;
    const t = setTimeout(() => clearError(), 5000);
    return () => clearTimeout(t);
  }, [errorMessage, clearError]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center md:justify-start lg:justify-start xl:justify-center bg-background px-4 sm:px-6 md:px-8 py-8 md:pt-20 lg:pt-20 xl:pt-8 relative login-page-tablet-zoom">
      <div className="absolute inset-0 bg-gradient-light pointer-events-none" />

      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-5 sm:left-5 md:top-6 md:left-6 z-20 inline-flex items-center justify-center rounded-full bg-ink_black text-white border-2 border-transparent transition-all duration-200 shadow-md hover:bg-transparent hover:text-gray-500 hover:border-gray-400 active:scale-[0.98] active:bg-transparent active:text-gray-500 active:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 w-11 h-11 sm:w-auto sm:h-auto sm:px-5 sm:py-2.5 sm:gap-1.5"
        aria-label="Back to home"
      >
        <HomeIcon className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
        <span className="hidden sm:inline text-sm font-medium">Back to home</span>
      </Link>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center pt-4 sm:pt-0 md:pt-0">
        <h1
          className="font-chillax font-bold text-ink_black text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-2 text-center mt-8 sm:mt-0 md:mt-0 md:pt-[50px] lg:pt-[50px] xl:pt-0"
          style={{ fontFamily: 'var(--font-chillax)' }}
        >
          Sign Up to Rendly
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6 sm:mb-8">
          Connect with your preferred platform
        </p>

        <div className="w-full rounded-2xl sm:rounded-3xl border border-gray-200/80 bg-white/95 shadow-xl shadow-gray-200/50 p-6 sm:p-8 md:p-10 mt-2 sm:mt-0">
          <div className="flex flex-col gap-4 sm:hidden w-full">
            <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-3 w-full">
              <GithubAuth />
              <button
                type="button"
                onClick={onGitHubClick}
                disabled={otherFrozen}
                className="w-full py-3 px-5 rounded-full border-2 bg-white text-ink_black font-medium text-sm transition-all duration-200 hover:bg-black hover:text-white hover:border-black active:scale-[0.98] disabled:opacity-80 disabled:cursor-default disabled:hover:bg-white disabled:hover:text-ink_black disabled:hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 whitespace-nowrap"
                style={{ borderColor: '#dae3e5' }}
              >
                Continue with GitHub
              </button>
            </div>
            <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-3 w-full">
              <LinkedInAuth />
              <button
                type="button"
                onClick={onLinkedInClick}
                disabled={otherFrozen}
                className="w-full py-3 px-5 rounded-full border-2 bg-white text-ink_black font-medium text-sm transition-all duration-200 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] active:scale-[0.98] disabled:opacity-80 disabled:cursor-default disabled:hover:bg-white disabled:hover:text-ink_black disabled:hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A66C2] whitespace-nowrap"
                style={{ borderColor: '#dae3e5' }}
              >
                Continue with LinkedIn
              </button>
            </div>
          </div>

          <div className="hidden sm:flex flex-row flex-nowrap items-stretch justify-center gap-4 sm:gap-6 w-full">
            <div className="flex flex-col items-center gap-3 min-w-0 flex-1 max-w-[260px]">
              <GithubAuth />
              <button
                type="button"
                onClick={onGitHubClick}
                disabled={otherFrozen}
                className="w-full py-3 px-5 rounded-full border-2 bg-white text-ink_black font-medium text-sm transition-all duration-200 hover:bg-black hover:text-white hover:border-black active:scale-[0.98] disabled:opacity-80 disabled:cursor-default disabled:hover:bg-white disabled:hover:text-ink_black disabled:hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 whitespace-nowrap"
                style={{ borderColor: '#dae3e5' }}
              >
                Continue with GitHub
              </button>
            </div>
            <p className="text-base font-medium text-gray-400 shrink-0 self-center">or</p>
            <div className="flex flex-col items-center gap-3 min-w-0 flex-1 max-w-[260px]">
              <LinkedInAuth />
              <button
                type="button"
                onClick={onLinkedInClick}
                disabled={otherFrozen}
                className="w-full py-3 px-5 rounded-full border-2 bg-white text-ink_black font-medium text-sm transition-all duration-200 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] active:scale-[0.98] disabled:opacity-80 disabled:cursor-default disabled:hover:bg-white disabled:hover:text-ink_black disabled:hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A66C2] whitespace-nowrap"
                style={{ borderColor: '#dae3e5' }}
              >
                Continue with LinkedIn
              </button>
            </div>
          </div>

          <TermsCheckbox />
          {showTermsHint && (
            <p className="mt-2 text-sm text-dusty_grape text-center">Please agree to terms to continue</p>
          )}

          {errorMessage && (
            <div
              className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 w-full max-w-md"
              role="alert"
            >
              {errorMessage}
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="ml-2 underline focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
              >
                Dismiss
              </button>
            </div>
          )}

          <ContinueButton />

          <div className="mt-6 flex justify-center w-full">
            <button
              type="button"
              onClick={clearVerification}
              className="text-sm text-muted-foreground hover:text-orange-500 active:text-orange-600 transition-colors duration-200 underline underline-offset-2"
            >
              Clear verification and verify again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <AuthProvider>
      <SignUpContent />
    </AuthProvider>
  );
}
