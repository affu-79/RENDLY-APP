'use client';

import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getStoredAuthToken, RENDLY_CURRENT_USER_CACHE_KEY } from '@/lib/auth-storage';
import { authFetch } from '@/lib/api';

export type CurrentUser = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  email?: string | null;
  role?: string | null;
};

type CurrentUserContextValue = {
  user: CurrentUser | null;
  loading: boolean;
  refetch: () => Promise<void>;
};

const CurrentUserContext = React.createContext<CurrentUserContextValue | null>(null);

const LOADING_CAP_MS = 500;

function getCachedUser(): CurrentUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw =
      sessionStorage.getItem(RENDLY_CURRENT_USER_CACHE_KEY) ??
      localStorage.getItem(RENDLY_CURRENT_USER_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof (parsed as CurrentUser).id !== 'string') return null;
    const u = parsed as CurrentUser;
    return {
      id: u.id,
      username: u.username ?? null,
      avatar_url: u.avatar_url ?? null,
      email: u.email ?? null,
      role: u.role ?? 'Curious Builder',
    };
  } catch {
    return null;
  }
}

function setCachedUser(u: CurrentUser | null) {
  try {
    if (typeof window === 'undefined') return;
    if (u) {
      const json = JSON.stringify(u);
      sessionStorage.setItem(RENDLY_CURRENT_USER_CACHE_KEY, json);
      localStorage.setItem(RENDLY_CURRENT_USER_CACHE_KEY, json);
    } else {
      sessionStorage.removeItem(RENDLY_CURRENT_USER_CACHE_KEY);
      localStorage.removeItem(RENDLY_CURRENT_USER_CACHE_KEY);
    }
  } catch {
    // ignore
  }
}

export function useCurrentUser(): CurrentUserContextValue {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error('useCurrentUser must be used within CurrentUserProvider');
  return ctx;
}

export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingCapRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refetch = useCallback(async () => {
    const token = getStoredAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      setCachedUser(null);
      return;
    }
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await authFetch('/api/users/me');
        setLoading(false);
        if (!res.ok) {
          setUser(null);
          setCachedUser(null);
          return;
        }
        const data = await res.json();
        const nextUser: CurrentUser = {
          id: data.id,
          username: data.username ?? null,
          avatar_url: data.avatar_url ?? null,
          email: data.email ?? null,
          role: data.role ?? 'Curious Builder',
        };
        setUser(nextUser);
        setCachedUser(nextUser);
        return;
      } catch (e) {
        const isUnauthorized = e instanceof Error && e.message === 'Unauthorized';
        if (isUnauthorized) {
          setUser(null);
          setLoading(false);
          setCachedUser(null);
          return;
        }
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 800 * attempt));
        } else {
          setLoading(false);
          setUser((prev) => prev);
        }
      }
    }
  }, []);

  useLayoutEffect(() => {
    const token = getStoredAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      setCachedUser(null);
      return;
    }
    const cached = getCachedUser();
    if (cached?.id) {
      setUser(cached);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getStoredAuthToken();
    if (!token) return;
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!loading) return;
    loadingCapRef.current = setTimeout(() => {
      loadingCapRef.current = null;
      setLoading(false);
    }, LOADING_CAP_MS);
    return () => {
      if (loadingCapRef.current) {
        clearTimeout(loadingCapRef.current);
        loadingCapRef.current = null;
      }
    };
  }, [loading]);

  useEffect(() => {
    const onVisible = () => {
      if (typeof window !== 'undefined' && document.visibilityState === 'visible') {
        refetch();
      }
    };
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refetch]);

  const value: CurrentUserContextValue = {
    user,
    loading,
    refetch,
  };

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
}
