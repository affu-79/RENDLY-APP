import { authFetch } from '@/lib/api';

export type ProfileMe = {
  id: string;
  email: string | null;
  avatar_url: string | null;
  github_id: string | null;
  github_url: string | null;
  linkedin_id: string | null;
  linkedin_url: string | null;
  username: string | null;
  selected_intents: string[] | null;
  bio: string | null;
  profession: string | null;
};

export type PatchProfilePayload = {
  username?: string;
  email?: string;
  avatar_url?: string | null;
  bio?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  selected_intents?: string[];
  profession?: string | null;
};

export async function getProfile(): Promise<ProfileMe | null> {
  const res = await authFetch('/api/users/me');
  if (!res.ok) return null;
  return res.json();
}

export async function patchProfile(payload: PatchProfilePayload): Promise<{ ok: true; user: ProfileMe } | { ok: false; message: string }> {
  const res = await authFetch('/api/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, message: (data?.message as string) || 'Update failed' };
  return { ok: true, user: data as ProfileMe };
}

export type SearchUser = { id: string; username: string | null; avatar_url: string | null };

export async function searchUsers(username: string): Promise<SearchUser[]> {
  const q = encodeURIComponent(username.trim().replace(/^@/, ''));
  if (q.length < 2) return [];
  const res = await authFetch(`/api/users/search?username=${q}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const res = await authFetch('/api/users/check-username', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.trim().replace(/^@/, '') }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data?.available === true;
}

/** Upload avatar image. POST multipart with field "avatar". Returns new public URL. */
export async function uploadAvatar(file: File): Promise<{ avatar_url: string }> {
  const form = new FormData();
  form.append('avatar', file);
  const res = await authFetch('/api/users/me/avatar', {
    method: 'POST',
    body: form,
    // Do not set Content-Type; browser sets multipart/form-data with boundary
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data?.message as string) || 'Upload failed');
  }
  const data = await res.json();
  if (!data?.avatar_url) throw new Error('No URL returned');
  return { avatar_url: data.avatar_url };
}
