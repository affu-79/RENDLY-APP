'use client';

import { useEffect, useState } from 'react';
import { getResolvedApiUrl } from '@/lib/resolvedApiUrl';
import { getStoredAuthToken } from '@/lib/auth-storage';

export type Profile = {
  id?: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  github_username: string | null;
  github_url: string | null;
  github_public_repos: number | null;
  github_commits_last_3m: number | null;
  linkedin_url: string | null;
  linkedin_headline: string | null;
  linkedin_summary: string | null;
};

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const token = getStoredAuthToken();
    if (!token) {
      setLoading(false);
      setError('Not authenticated');
      return;
    }
    getResolvedApiUrl()
      .then((baseUrl) =>
        fetch(`${baseUrl}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          if (res.status === 401) setError('Session expired');
          else if (res.status === 404) setError('Profile not found');
          else setError('Failed to load profile');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (data) setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load profile');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { profile, loading, error };
}
