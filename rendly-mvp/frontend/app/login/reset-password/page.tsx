'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getResolvedApiUrl } from '@/lib/resolvedApiUrl';
import { validatePassword } from '@/hooks/useProfile';
import '../login.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validation = validatePassword(password);
  const passwordsMatch = password.length > 0 && password === confirm;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!token.trim()) {
        setError('Reset link is invalid or missing.');
        return;
      }
      if (!validation.isValid) {
        setError('Password does not meet requirements.');
        return;
      }
      if (!passwordsMatch) {
        setError('Passwords do not match.');
        return;
      }
      setLoading(true);
      try {
        const baseUrl = await getResolvedApiUrl();
        const res = await fetch(`${baseUrl}/api/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token.trim(), new_password: password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.message || 'Reset failed.');
          return;
        }
        setSuccess(true);
        setTimeout(() => router.push('/login?reset=1'), 2000);
      } catch {
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [token, password, passwordsMatch, validation.isValid, router]
  );

  if (!token.trim()) {
    return (
      <div className="login-page">
        <div className="login-page__overlay" aria-hidden />
        <div className="login-page__inner login-page__inner--enter">
          <h1 className="login-page__title">Invalid reset link</h1>
          <p className="login-page__subtitle">This link is missing or invalid. Request a new reset link.</p>
          <div className="login-page__card login-page__card--enter">
            <Link href="/login/forgot-password" className="login-page__signup-link" style={{ display: 'inline-block' }}>
              Request new link
            </Link>
          </div>
          <p className="login-page__signup-cta">
            <Link href="/login" className="login-page__signup-link">Back to Log in</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-page__overlay" aria-hidden />
      <div className="login-page__inner login-page__inner--enter">
        <div className="login-page__title-wrap">
          <img
            src="/images/logo.svg"
            alt=""
            className="login-page__reset-logo"
            aria-hidden
          />
          <h1 className="login-page__title" style={{ position: 'relative', zIndex: 1 }}>Set new password</h1>
        </div>
        <p className="login-page__subtitle" style={{ position: 'relative', zIndex: 1 }}>Enter and confirm your new password.</p>

        <div className="login-page__card login-page__card--enter">
          {success ? (
            <p className="login-page__signup-cta" style={{ marginTop: 0 }}>
              Password reset successfully. Redirecting to log in…
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="login-page__form" noValidate>
              <div className="login-page__field">
                <label htmlFor="reset-password" className="login-page__label">
                  New password
                </label>
                <div className="login-page__input-wrap">
                  <input
                    id="reset-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-page__input"
                    disabled={loading}
                    style={{ paddingLeft: '1rem' }}
                  />
                  <button
                    type="button"
                    className="login-page__toggle-password"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {password.length > 0 && !validation.isValid && (
                  <ul className="login-page__error" style={{ marginTop: '0.5rem', listStyle: 'inside' }}>
                    {validation.errors.map((err: string) => (
                      <li key={err}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="login-page__field">
                <label htmlFor="reset-confirm" className="login-page__label">
                  Confirm password
                </label>
                <div className="login-page__input-wrap">
                  <input
                    id="reset-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="login-page__input"
                    disabled={loading}
                    aria-invalid={confirm.length > 0 && !passwordsMatch}
                    style={{ paddingLeft: '1rem' }}
                  />
                  <button
                    type="button"
                    className="login-page__toggle-password"
                    onClick={() => setShowConfirm((s) => !s)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showConfirm ? 'Hide' : 'Show'}
                  </button>
                </div>
                {confirm.length > 0 && !passwordsMatch && (
                  <p className="login-page__error" style={{ marginTop: '0.5rem' }}>Passwords do not match.</p>
                )}
              </div>
              {error && (
                <div className="login-page__error" role="alert">
                  {error}
                </div>
              )}
              <button type="submit" className="login-page__submit" disabled={loading || !validation.isValid || !passwordsMatch}>
                {loading ? 'Resetting…' : 'Reset password'}
              </button>
            </form>
          )}
        </div>

        <p className="login-page__signup-cta">
          <Link href="/login" className="login-page__signup-link">Back to Log in</Link>
        </p>
      </div>
    </div>
  );
}
