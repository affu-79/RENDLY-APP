'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getResolvedApiUrl } from '@/lib/resolvedApiUrl';
import '../login.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const raw = email.trim();
    if (!raw) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      const baseUrl = await getResolvedApiUrl();
      const res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: raw }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || 'Request failed.');
        return;
      }
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__overlay" aria-hidden />
      <div className="login-page__inner login-page__inner--enter">
        <h1 className="login-page__title">Forgot password</h1>
        <p className="login-page__subtitle">Enter your email and we&apos;ll send you a reset link.</p>

        <div className="login-page__card login-page__card--enter">
          {sent ? (
            <div className="login-page__form">
              <p className="login-page__signup-cta" style={{ marginTop: 0 }}>
                If an account exists for that email, we&apos;ve sent a reset link. Check your inbox (and spam).
              </p>
              <Link href="/login" className="login-page__signup-link" style={{ display: 'inline-block', marginTop: '1rem' }}>
                Back to Log in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-page__form" noValidate>
              <div className="login-page__field">
                <label htmlFor="forgot-email" className="login-page__label">
                  Email
                </label>
                <div className="login-page__input-wrap">
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login-page__input"
                    disabled={loading}
                    aria-invalid={!!error}
                    style={{ paddingLeft: '1rem' }}
                  />
                </div>
              </div>
              {error && (
                <div className="login-page__error" role="alert">
                  {error}
                </div>
              )}
              <button type="submit" className="login-page__submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>

        <p className="login-page__signup-cta">
          <Link href="/login" className="login-page__signup-link">
            Back to Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
