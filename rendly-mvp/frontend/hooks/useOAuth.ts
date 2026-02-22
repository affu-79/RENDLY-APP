'use client';

import { useCallback } from 'react';
import { getResolvedApiUrl } from '@/lib/resolvedApiUrl';
import {
  generateCodeVerifier,
  computeCodeChallenge,
  LINKEDIN_PKCE_STORAGE_KEY,
} from '@/lib/pkce';
import { GITHUB_STORAGE_KEY, LINK_TO_GITHUB_ID_KEY } from '@/lib/auth-storage';

function getRedirectUri() {
  if (typeof window === 'undefined') return '';
  // Override for provider dashboards: set NEXT_PUBLIC_OAUTH_REDIRECT_URI to match exactly what you registered
  const envUri = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI;
  if (envUri) return envUri;
  return `${window.location.origin}/auth/callback`;
}

export function useOAuth() {
  const redirectToGitHub = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    if (!clientId) {
      console.error('NEXT_PUBLIC_GITHUB_CLIENT_ID is not set');
      return;
    }
    const redirectUri = encodeURIComponent(getRedirectUri());
    const scope = encodeURIComponent('read:user user:email');
    const state = 'github';
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    window.location.href = url;
  }, []);

  const redirectToLinkedIn = useCallback(async () => {
    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
    if (!clientId) {
      console.error('NEXT_PUBLIC_LINKEDIN_CLIENT_ID is not set');
      return;
    }
    const verifier = generateCodeVerifier();
    const challenge = await computeCodeChallenge(verifier);
    try {
      sessionStorage.setItem(LINKEDIN_PKCE_STORAGE_KEY, verifier);
      // If user already verified GitHub, link LinkedIn to that same user row
      const ghRaw = typeof window !== 'undefined' ? localStorage.getItem(GITHUB_STORAGE_KEY) : null;
      if (ghRaw) {
        const d = JSON.parse(ghRaw);
        if (d?.verified && d?.user?.id) sessionStorage.setItem(LINK_TO_GITHUB_ID_KEY, String(d.user.id));
      }
    } catch {
      // ignore
    }
    const redirectUri = encodeURIComponent(getRedirectUri());
    const scope = encodeURIComponent('openid profile email');
    const state = 'linkedin';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: getRedirectUri(),
      scope: 'openid profile email',
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });
    const url = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    window.location.href = url;
  }, []);

  const exchangeCode = useCallback(
    async (code: string, provider: 'github' | 'linkedin', options?: { codeVerifier?: string; linkToGithubId?: string }) => {
      const baseUrl = await getResolvedApiUrl();
      const endpoint =
        provider === 'github'
          ? `${baseUrl}/api/auth/github/callback`
          : `${baseUrl}/api/auth/linkedin/callback`;
      const body: { code: string; code_verifier?: string; link_to_github_id?: string } = { code };
      if (provider === 'linkedin' && options?.codeVerifier) body.code_verifier = options.codeVerifier;
      if (provider === 'linkedin' && options?.linkToGithubId) body.link_to_github_id = options.linkToGithubId;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `Failed to authenticate with ${provider}`);
      }
      return res.json();
    },
    []
  );

  const continueToDashboard = useCallback(async () => {
    const baseUrl = await getResolvedApiUrl();
    const res = await fetch(`${baseUrl}/api/auth/continue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to continue');
    const data = await res.json();
    return data.redirectUrl || '/auth/profile-setup';
  }, []);

  return {
    redirectToGitHub,
    redirectToLinkedIn,
    exchangeCode,
    continueToDashboard,
    getRedirectUri,
  };
}
