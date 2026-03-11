import { authFetch } from '@/lib/api';

export type Connection = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  connected_at: string;
};

export async function getConnections(): Promise<Connection[]> {
  const res = await authFetch('/api/users/me/connections');
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export type ConnectionInvite = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: string;
  created_at: string;
  direction: 'sent' | 'received';
  other_user: { id: string; username: string | null; avatar_url: string | null };
};

export async function getConnectionInvites(): Promise<ConnectionInvite[]> {
  const res = await authFetch('/api/users/me/connection-invites');
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function sendConnectionInvite(username: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const res = await authFetch('/api/users/me/connection-invites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.trim().replace(/^@/, '') }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, message: (data?.message as string) || 'Failed to send invite' };
  return { ok: true };
}

export async function acceptInvite(inviteId: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const res = await authFetch(`/api/users/me/connection-invites/${inviteId}/accept`, { method: 'POST' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, message: (data?.message as string) || 'Failed to accept' };
  return { ok: true };
}

export async function rejectInvite(inviteId: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const res = await authFetch(`/api/users/me/connection-invites/${inviteId}/reject`, { method: 'POST' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, message: (data?.message as string) || 'Failed to reject' };
  return { ok: true };
}

export async function disconnect(userId: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const res = await authFetch(`/api/users/me/connections/${userId}`, { method: 'DELETE' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, message: (data?.message as string) || 'Failed to disconnect' };
  return { ok: true };
}

export async function blockUser(userId: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const res = await authFetch('/api/users/me/blocks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, message: (data?.message as string) || 'Failed to block' };
  return { ok: true };
}

export async function unblockUser(userId: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const res = await authFetch(`/api/users/me/blocks/${userId}`, { method: 'DELETE' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, message: (data?.message as string) || 'Failed to unblock' };
  return { ok: true };
}

export type BlockedUser = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

export async function getBlockedUsers(): Promise<BlockedUser[]> {
  const res = await authFetch('/api/users/me/blocks');
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
