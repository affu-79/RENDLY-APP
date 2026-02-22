'use client';

import React from 'react';
import Link from 'next/link';
import { useProfile } from '@/hooks/useProfile';

export default function ProfilePage() {
  const { profile, loading, error } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-glaucous border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-center text-dusty_grape font-medium">{error ?? 'Profile not found'}</p>
        <Link href="/auth/login" className="mt-4 text-sm text-glaucous underline">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-2xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary underline-offset-2 hover:underline mb-6 inline-block">
        ← Dashboard
      </Link>
      <h1 className="font-chillax font-bold text-ink_black text-2xl mb-2">Profile</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Your profile is filled from GitHub and LinkedIn. Update fields below when you add edit support.
      </p>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          {(profile.avatar_url || profile.display_name || profile.email) && (
            <section>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Basic info</h2>
              <div className="flex items-center gap-4">
                {profile.avatar_url && (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover border border-gray-200"
                  />
                )}
                <div>
                  <p className="font-medium text-ink_black">{profile.display_name ?? '—'}</p>
                  <p className="text-sm text-muted-foreground">{profile.email ?? '—'}</p>
                </div>
              </div>
            </section>
          )}

          {(profile.github_url || profile.github_username != null || profile.github_public_repos != null) && (
            <section>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">GitHub</h2>
              <ul className="space-y-1 text-sm">
                {profile.github_url && (
                  <li>
                    <span className="text-muted-foreground">Profile: </span>
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-glaucous underline">
                      {profile.github_url}
                    </a>
                  </li>
                )}
                {profile.github_username && (
                  <li>
                    <span className="text-muted-foreground">Username: </span>
                    {profile.github_username}
                  </li>
                )}
                {profile.github_public_repos != null && (
                  <li>
                    <span className="text-muted-foreground">Public repositories: </span>
                    {profile.github_public_repos}
                  </li>
                )}
                {profile.github_commits_last_3m != null && (
                  <li>
                    <span className="text-muted-foreground">Active commits (last 3 months): </span>
                    {profile.github_commits_last_3m}
                  </li>
                )}
              </ul>
            </section>
          )}

          {(profile.linkedin_url || profile.linkedin_headline || profile.linkedin_summary) && (
            <section>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">LinkedIn</h2>
              <ul className="space-y-2 text-sm">
                {profile.linkedin_url && (
                  <li>
                    <span className="text-muted-foreground">Profile: </span>
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-glaucous underline">
                      {profile.linkedin_url}
                    </a>
                  </li>
                )}
                {profile.linkedin_headline && (
                  <li>
                    <span className="text-muted-foreground">Headline: </span>
                    {profile.linkedin_headline}
                  </li>
                )}
                {profile.linkedin_summary && (
                  <li>
                    <span className="text-muted-foreground">Summary: </span>
                    <p className="mt-1 text-muted-foreground">{profile.linkedin_summary}</p>
                  </li>
                )}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
