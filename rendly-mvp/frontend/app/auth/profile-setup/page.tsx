'use client';

import React from 'react';
import Link from 'next/link';
import { useProfile } from '@/hooks/useProfile';

export default function ProfileSetupPage() {
  const { profile, loading, error } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-glaucous border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <p className="text-center text-dusty_grape font-medium">{error ?? 'Profile not found'}</p>
        <Link
          href="/auth/login"
          className="mt-4 px-4 py-2 rounded-lg bg-space_indigo text-white text-sm font-medium hover:brightness-110"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-lg flex flex-col">
        <Link
          href="/auth/login"
          className="text-sm text-muted-foreground hover:text-primary underline-offset-2 hover:underline mb-6"
        >
          ← Back to login
        </Link>
        <h1 className="font-chillax font-bold text-ink_black text-2xl mb-2">Profile</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Your details have been imported from GitHub and LinkedIn. You can update them later in your dashboard.
        </p>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
          {(profile.display_name || profile.email) && (
            <div>
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Name & email</h2>
              <p className="text-ink_black font-medium">{profile.display_name ?? '—'}</p>
              <p className="text-sm text-muted-foreground">{profile.email ?? '—'}</p>
            </div>
          )}
          {(profile.github_url || profile.github_username != null) && (
            <div>
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">GitHub</h2>
              <p className="text-sm">
                {profile.github_url ? (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-glaucous underline">
                    {profile.github_url}
                  </a>
                ) : (
                  profile.github_username ?? '—'
                )}
              </p>
              {profile.github_public_repos != null && (
                <p className="text-xs text-muted-foreground mt-1">
                  Public repos: {profile.github_public_repos}
                  {profile.github_commits_last_3m != null && ` · Commits (last 3 months): ${profile.github_commits_last_3m}`}
                </p>
              )}
            </div>
          )}
          {(profile.linkedin_url || profile.linkedin_headline) && (
            <div>
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">LinkedIn</h2>
              {profile.linkedin_url && (
                <p className="text-sm">
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-glaucous underline">
                    {profile.linkedin_url}
                  </a>
                </p>
              )}
              {profile.linkedin_headline && (
                <p className="text-sm text-muted-foreground mt-1">{profile.linkedin_headline}</p>
              )}
            </div>
          )}
        </div>

        <Link
          href="/dashboard/profile"
          className="mt-6 px-4 py-3 rounded-lg bg-space_indigo text-white text-center font-medium hover:brightness-110"
        >
          Continue to Dashboard
        </Link>
      </div>
    </div>
  );
}
