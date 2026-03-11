'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getResolvedApiUrl } from '@/lib/resolvedApiUrl';
import { getStoredAuthToken } from '@/lib/auth-storage';
import ProfileSetup from './profile-setup';

export default function ProfileSetupPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const checkAndRedirect = useCallback(async () => {
    const token = getStoredAuthToken();
    if (!token) {
      setReady(true);
      return;
    }
    try {
      const baseUrl = await getResolvedApiUrl();
      const res = await fetch(`${baseUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setReady(true);
        return;
      }
      const data = await res.json();
      const username = data?.username;
      if (username && String(username).trim()) {
        setShouldRedirect(true);
        router.replace('/dashboard');
      }
    } catch {
      // ignore
    } finally {
      setReady(true);
    }
  }, [router]);

  useEffect(() => {
    checkAndRedirect();
  }, [checkAndRedirect]);

  if (shouldRedirect) return null;
  if (!ready) return null;

  return <ProfileSetup />;
}
