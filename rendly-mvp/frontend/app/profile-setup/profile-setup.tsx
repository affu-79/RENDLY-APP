'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getResolvedApiUrl } from '@/lib/resolvedApiUrl';
import { getStoredAuthToken } from '@/lib/auth-storage';
import './profile-setup.css';

type UserMe = {
  id: string;
  email: string | null;
  avatar_url: string | null;
  github_id: string | null;
  github_url: string | null;
  linkedin_id: string | null;
  linkedin_url: string | null;
  username?: string | null;
};

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

function validateUsername(value: string): boolean {
  const v = value.replace(/^@/, '').trim();
  if (v.length < 3 || v.length > 20) return false;
  return /^[a-zA-Z0-9_]+$/.test(v);
}

function validatePassword(p: string): { length: boolean; uppercase: boolean; special: boolean; number: boolean; all: boolean } {
  const length = p.length >= 8;
  const uppercase = /[A-Z]/.test(p);
  const special = /[!@#$%^&*(),.?":{}|<>]/.test(p);
  const number = /[0-9]/.test(p);
  return { length, uppercase, special, number, all: length && uppercase && special && number };
}

function getInitials(email: string | null, githubId: string | null, linkedinId: string | null): string {
  if (email && email.includes('@')) {
    const part = email.split('@')[0];
    return part.length >= 2 ? part.slice(0, 2).toUpperCase() : part.slice(0, 1).toUpperCase();
  }
  if (githubId) return String(githubId).slice(0, 2).toUpperCase();
  if (linkedinId) return String(linkedinId).slice(0, 2).toUpperCase();
  return 'U';
}

function IconLock({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconEye({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.576 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconX({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function IconVerified({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconCopy({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16V4a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function IconGitHub({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function IconLinkedIn({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function ProfileSetup() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const usernameCheckTs = useRef(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    setToken(getStoredAuthToken());
  }, []);

  const fetchUser = useCallback(async (authToken: string) => {
    setLoading(true);
    setLoadError(null);
    try {
      const baseUrl = await getResolvedApiUrl();
      const res = await fetch(`${baseUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Failed to load profile');
      }
      const data = await res.json();
      setUser(data);
      if (data.username) setUsername(String(data.username).replace(/^@/, ''));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load profile');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token) {
      setLoading(false);
      return;
    }
    fetchUser(token);
  }, [mounted, token, fetchUser]);

  const checkUsername = useCallback(async (value: string) => {
    const normalized = value.replace(/^@/, '').trim().toLowerCase();
    if (!normalized || normalized.length < 3) {
      setUsernameStatus('invalid');
      return;
    }
    if (!validateUsername(value)) {
      setUsernameStatus('invalid');
      return;
    }
    setUsernameStatus('checking');
    const ts = Date.now();
    usernameCheckTs.current = ts;
    try {
      const baseUrl = await getResolvedApiUrl();
      const res = await fetch(`${baseUrl}/api/users/check-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: normalized }),
      });
      const data = await res.json().catch(() => ({}));
      if (ts !== usernameCheckTs.current) return;
      setUsernameStatus(data.available ? 'available' : 'taken');
    } catch {
      if (ts === usernameCheckTs.current) setUsernameStatus('idle');
    }
  }, [token]);

  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus('idle');
      return;
    }
    if (!validateUsername(username)) {
      setUsernameStatus('invalid');
      return;
    }
    const t = setTimeout(() => checkUsername(username), 500);
    return () => clearTimeout(t);
  }, [username, checkUsername]);

  const passwordReqs = useMemo(() => validatePassword(password), [password]);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const formValid =
    usernameStatus === 'available' &&
    passwordReqs.all &&
    passwordsMatch &&
    !submitLoading;

  const submit = useCallback(async () => {
    if (!formValid || !token) return;
    setSubmitError(null);
    setSubmitLoading(true);
    try {
      const baseUrl = await getResolvedApiUrl();
      const normalized = username.replace(/^@/, '').trim().toLowerCase();
      const res = await fetch(`${baseUrl}/api/auth/profile-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: normalized.startsWith('@') ? normalized : `@${normalized}`,
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to save profile');
      }
      if (data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push('/dashboard?welcome=1');
        }, 600);
      } else {
        throw new Error(data?.message || 'Failed to save profile');
      }
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to save profile');
    } finally {
      setSubmitLoading(false);
    }
  }, [formValid, token, username, password, router]);

  const copyEmail = useCallback(() => {
    if (!user?.email) return;
    navigator.clipboard.writeText(user.email);
  }, [user?.email]);

  const displayUsername = username.replace(/^@/, '').trim();

  if (!mounted || loading) {
    return (
      <div className="ps-root">
        <div className="ps-bg" />
        <div className="ps-card ps-loading-card">
          <div className="ps-title ps-skeleton" style={{ width: '70%', height: '1.4em', margin: '0 auto 20px' }} />
          <div className="ps-avatar-wrap">
            <div className="ps-avatar ps-avatar-initials ps-skeleton ps-skeleton-avatar" />
          </div>
          <div className="ps-skeleton ps-skeleton-line" />
          <div className="ps-skeleton ps-skeleton-line short" />
          <div className="ps-skeleton ps-skeleton-line" style={{ marginTop: 20 }} />
          <div className="ps-skeleton ps-skeleton-line" />
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="ps-root">
        <div className="ps-bg" />
        <div className="ps-card ps-no-token">
          <p>Please sign in to complete your profile.</p>
          <Link href="/auth/sign-up" className="ps-link-btn">
            Go to Sign up
          </Link>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="ps-root">
        <div className="ps-bg" />
        <div className="ps-card ps-no-token">
          <p className="ps-error" style={{ justifyContent: 'center' }}>{loadError}</p>
          <button type="button" className="ps-link-btn" style={{ marginTop: 16 }} onClick={() => fetchUser(token!)}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ps-root">
      <div className="ps-bg" />
      <div className="ps-card">
        <h1 className="ps-title">Complete your profile</h1>

        <div className="ps-avatar-wrap">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="ps-avatar" />
          ) : (
            <div className="ps-avatar ps-avatar-initials">
              {getInitials(user?.email ?? null, user?.github_id ?? null, user?.linkedin_id ?? null)}
            </div>
          )}
        </div>

        {user?.email && (
          <div className="ps-email-row">
            <a href={`mailto:${user.email}`} className="ps-email-link">
              {user.email}
            </a>
            <button type="button" className="ps-copy-btn" onClick={copyEmail} aria-label="Copy email">
              <IconCopy />
            </button>
          </div>
        )}

        <div className="ps-badges">
          {user?.github_id && (
            <span className="ps-badge ps-badge-gh">
              <IconGitHub className="ps-badge-icon" />
              GitHub Verified
              <IconVerified className="ps-verified" />
            </span>
          )}
          {user?.linkedin_id && (
            user?.linkedin_url ? (
              <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" className="ps-badge ps-badge-li">
                <IconLinkedIn className="ps-badge-icon" />
                LinkedIn Verified
                <IconVerified className="ps-verified" />
              </a>
            ) : (
              <span className="ps-badge ps-badge-li">
                <IconLinkedIn className="ps-badge-icon" />
                LinkedIn Verified
                <IconVerified className="ps-verified" />
              </span>
            )
          )}
        </div>

        <div className="ps-field">
          <label className="ps-label">Username *</label>
          <div className={`ps-input-wrap ${usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'ps-input-error' : ''}`}>
            <span className="ps-at" aria-hidden>@</span>
            <input
              type="text"
              className="ps-input"
              placeholder="yourname"
              value={displayUsername}
              onChange={(e) => setUsername(e.target.value.replace(/^@/, ''))}
              aria-label="Username"
            />
          </div>
          <div className={`ps-username-status ${usernameStatus}`}>
            {usernameStatus === 'checking' && <>Checking...</>}
            {usernameStatus === 'available' && <><IconCheck /> Available</>}
            {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
              <><IconX /> {usernameStatus === 'taken' ? 'Username taken' : 'Use 3–20 characters (letters, numbers, _)'}</>
            )}
          </div>
        </div>

        <div className="ps-field">
          <label className="ps-label">Create password *</label>
          <div className={`ps-input-wrap ${!passwordReqs.all && password.length > 0 ? 'ps-input-error' : ''}`}>
            <IconLock style={{ flexShrink: 0, color: '#57606a' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              className="ps-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password"
            />
            <button
              type="button"
              className="ps-input-suffix"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>
          <div className="ps-password-reqs">
            <div className={`ps-password-req ${passwordReqs.length ? 'met' : 'unmet'}`}>
              At least 8 characters
            </div>
            <div className={`ps-password-req ${passwordReqs.uppercase ? 'met' : 'unmet'}`}>
              1 uppercase letter
            </div>
            <div className={`ps-password-req ${passwordReqs.special ? 'met' : 'unmet'}`}>
              1 special character
            </div>
            <div className={`ps-password-req ${passwordReqs.number ? 'met' : 'unmet'}`}>
              1 number
            </div>
          </div>
        </div>

        <div className="ps-field">
          <label className="ps-label">Confirm password *</label>
          <div className={`ps-input-wrap ${confirmPassword.length > 0 && !passwordsMatch ? 'ps-input-error' : ''}`}>
            <IconLock style={{ flexShrink: 0, color: '#57606a' }} />
            <input
              type={showConfirm ? 'text' : 'password'}
              className="ps-input"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-label="Confirm password"
            />
            <button
              type="button"
              className="ps-input-suffix"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="ps-helper" style={{ color: '#cf222e' }}>Passwords do not match</p>
          )}
        </div>

        {submitError && (
          <div className="ps-error" role="alert">
            <IconX style={{ flexShrink: 0 }} />
            {submitError}
          </div>
        )}

        <div className="ps-submit-wrap">
          <button
            type="button"
            className="ps-submit"
            onClick={submit}
            disabled={!formValid}
          >
            {submitLoading ? (
              <>
                <span className="ps-spinner" />
                {submitSuccess ? 'Redirecting...' : 'Saving...'}
              </>
            ) : (
              <>
                <span>Save and proceed</span>
                <IconArrowRight />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
