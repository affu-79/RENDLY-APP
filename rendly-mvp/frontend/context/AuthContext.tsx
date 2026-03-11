'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ProviderState = {
  verified: boolean;
  user: Record<string, unknown> | null;
  token: string | null;
};

type AuthContextValue = {
  github: ProviderState;
  linkedin: ProviderState;
  termsChecked: boolean;
  setTermsChecked: (v: boolean) => void;
  setGithubVerified: (payload: { user?: Record<string, unknown>; token?: string }) => void;
  setLinkedinVerified: (payload: { user?: Record<string, unknown>; token?: string }) => void;
  clearGithub: () => void;
  clearLinkedin: () => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  errorMessage: string | null;
  setErrorMessage: (v: string | null) => void;
  canContinue: boolean;
  clearError: () => void;
};

const initialState: ProviderState = {
  verified: false,
  user: null,
  token: null,
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [github, setGithubState] = useState<ProviderState>(initialState);
  const [linkedin, setLinkedinState] = useState<ProviderState>(initialState);
  const [termsChecked, setTermsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setGithubVerified = useCallback(
    (payload: { user?: Record<string, unknown>; token?: string }) => {
      setGithubState({
        verified: true,
        user: payload.user ?? null,
        token: payload.token ?? null,
      });
    },
    []
  );

  const setLinkedinVerified = useCallback(
    (payload: { user?: Record<string, unknown>; token?: string }) => {
      setLinkedinState({
        verified: true,
        user: payload.user ?? null,
        token: payload.token ?? null,
      });
    },
    []
  );

  const clearGithub = useCallback(() => setGithubState(initialState), []);
  const clearLinkedin = useCallback(() => setLinkedinState(initialState), []);

  const clearError = useCallback(() => setErrorMessage(null), []);

  const canContinue = useMemo(
    () => (github.verified || linkedin.verified) && termsChecked,
    [github.verified, linkedin.verified, termsChecked]
  );

  const value: AuthContextValue = useMemo(
    () => ({
      github,
      linkedin,
      termsChecked,
      setTermsChecked,
      setGithubVerified,
      setLinkedinVerified,
      clearGithub,
      clearLinkedin,
      isLoading,
      setIsLoading,
      errorMessage,
      setErrorMessage,
      canContinue,
      clearError,
    }),
    [
      github,
      linkedin,
      termsChecked,
      setGithubVerified,
      setLinkedinVerified,
      clearGithub,
      clearLinkedin,
      isLoading,
      errorMessage,
      canContinue,
      clearError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
