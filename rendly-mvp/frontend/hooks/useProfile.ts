'use client';

import { useCallback, useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { getResolvedApiUrl } from '@/lib/resolvedApiUrl';
import { getStoredAuthToken } from '@/lib/auth-storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UserData = {
  id: string;
  email: string | null;
  avatar_url: string | null;
  github_id?: string | null;
  github_url?: string | null;
  linkedin_id?: string | null;
  linkedin_url?: string | null;
  display_name?: string | null;
  username?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  professions?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type FormData = {
  email: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  professions: string[];
};

export type PasswordForm = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ---------------------------------------------------------------------------
// API client helpers
// ---------------------------------------------------------------------------

async function getAuthHeaders(): Promise<{ baseURL: string; headers: Record<string, string> }> {
  const baseURL = await getResolvedApiUrl();
  const token = getStoredAuthToken();
  if (!token) throw new Error('Not authenticated');
  return {
    baseURL,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function validateUsername(username: string): boolean {
  return USERNAME_REGEX.test(username.trim());
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
  if (!/[0-9]/.test(password)) errors.push('At least one number');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('At least one special character');
  return {
    isValid: errors.length === 0,
    errors,
  };
}

const BIO_MAX = 500;
const URL_REGEX = /^https?:\/\/.+/;

export function validateForm(formData: FormData): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Invalid email format';
  }
  if (formData.username.trim() && !validateUsername(formData.username)) {
    errors.username = 'Username must be 3–20 characters, alphanumeric and underscore only';
  }
  if (formData.bio.length > BIO_MAX) {
    errors.bio = `Bio must be at most ${BIO_MAX} characters`;
  }
  if (formData.website.trim() && !URL_REGEX.test(formData.website.trim())) {
    errors.website = 'Please enter a valid URL';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  const { baseURL, headers } = await getAuthHeaders();
  try {
    const res = await axios.post<{ available: boolean }>(
      `${baseURL}/api/users/me/check-username`,
      { username: username.trim() },
      { headers, timeout: 10000 }
    );
    return res.data?.available ?? false;
  } catch {
    return false;
  }
}

export async function saveUserProfile(userId: string, data: FormData): Promise<ApiResponse<UserData>> {
  const { baseURL, headers } = await getAuthHeaders();
  try {
    const res = await axios.put<UserData>(`${baseURL}/api/users/me`, data, { headers, timeout: 15000 });
    return { success: true, data: res.data };
  } catch (e) {
    const msg = getErrorMessage(e);
    return { success: false, error: msg };
  }
}

export async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<ApiResponse<void>> {
  const { baseURL, headers } = await getAuthHeaders();
  try {
    await axios.post(
      `${baseURL}/api/users/me/change-password`,
      { oldPassword, newPassword },
      { headers, timeout: 10000 }
    );
    return { success: true };
  } catch (e) {
    return { success: false, error: getErrorMessage(e) };
  }
}

export async function disconnectGitHub(userId: string): Promise<ApiResponse<void>> {
  const { baseURL, headers } = await getAuthHeaders();
  try {
    await axios.delete(`${baseURL}/api/users/me/disconnect-github`, { headers, timeout: 10000 });
    return { success: true };
  } catch (e) {
    return { success: false, error: getErrorMessage(e) };
  }
}

export async function disconnectLinkedIn(userId: string): Promise<ApiResponse<void>> {
  const { baseURL, headers } = await getAuthHeaders();
  try {
    await axios.delete(`${baseURL}/api/users/me/disconnect-linkedin`, { headers, timeout: 10000 });
    return { success: true };
  } catch (e) {
    return { success: false, error: getErrorMessage(e) };
  }
}

export async function uploadAvatar(file: File, userId: string): Promise<{ url: string }> {
  const baseURL = await getResolvedApiUrl();
  const token = getStoredAuthToken();
  if (!token) throw new Error('Not authenticated');
  const form = new FormData();
  form.append('file', file);
  const res = await axios.post<{ url: string }>(`${baseURL}/api/users/me/avatar`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 20000,
    maxContentLength: 10 * 1024 * 1024,
    maxBodyLength: 10 * 1024 * 1024,
  });
  if (!res.data?.url) throw new Error('No URL returned');
  return { url: res.data.url };
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export function formatPhoneNumber(input: string): string {
  const cleaned = input.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 20);
  return cleaned ? `@${cleaned}` : '';
}

export const PROFESSIONS_LIST = [
  'Developer',
  'Software Engineer',
  'Founder',
  'Entrepreneur',
  'Designer',
  'Product Manager',
  'Student',
  'Consultant',
  'Freelancer',
  'Investor',
  'Marketer',
  'Teacher',
  'Data Scientist',
  'Other',
];

export function getProfessionsList(): string[] {
  return [...PROFESSIONS_LIST];
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    const msg = typeof data?.message === 'string' ? data.message : data?.error;
    if (msg) return msg;
    if (error.response?.status === 401) return 'Session expired. Please sign in again.';
    if (error.response?.status === 404) return 'Not found.';
    if (error.response?.status === 422) return 'Validation failed. Check your input.';
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return 'Network error. Check your connection.';
    }
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useProfile() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    const token = getStoredAuthToken();
    if (!token) {
      setLoading(false);
      setError('Not authenticated');
      setUser(null);
      return;
    }
    try {
      const baseURL = await getResolvedApiUrl();
      const res = await axios.get<UserData>(`${baseURL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      setUser(res.data ?? null);
      setError(null);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 401) setError('Session expired');
      else if (axios.isAxiosError(e) && e.response?.status === 404) setError('Profile not found');
      else setError(getErrorMessage(e));
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const token = getStoredAuthToken();
    if (!token) {
      setLoading(false);
      setError('Not authenticated');
      return;
    }
    fetchProfile().then(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchProfile]);

  const refetch = useCallback(() => {
    setLoading(true);
    return fetchProfile().finally(() => setLoading(false));
  }, [fetchProfile]);

  return { user, profile: user, loading, error, refetch };
}
