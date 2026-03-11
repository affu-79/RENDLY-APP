import { getChatApiUrl } from '@/lib/resolvedApiUrl';
import { getStoredAuthToken } from '@/lib/auth-storage';

export type GroupListItem = {
  id: string;
  conversation_id: string;
  name: string;
  avatar_url: string | null;
  unreadCount: number;
  isFavorite: boolean;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastMessageSenderUsername: string | null;
};

export type GroupMember = {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  display_name: string | null;
  role: 'creator' | 'admin' | 'member';
  joined_at: string;
  is_online?: boolean;
};

export type GroupWithMembers = {
  id: string;
  conversation_id: string;
  name: string;
  avatar_url: string | null;
  motive: string | null;
  view_only_mode: boolean;
  priority_user_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  members: GroupMember[];
};

export type GroupInvitePending = {
  id: string;
  group_id: string;
  invited_by: string;
  invited_user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  group_name?: string;
  inviter_username?: string | null;
  invitee_username?: string | null;
};

export type ConnectionUser = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  display_name: string | null;
};

export type NotificationItem = {
  id: string;
  user_id: string;
  type: string;
  payload: Record<string, unknown>;
  read: boolean;
  created_at: string;
};

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredAuthToken();
  if (!token) throw new Error('Not authenticated');
  const base = await getChatApiUrl();
  return fetch(`${base}${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    },
  });
}

export const groupsApi = {
  async getGroups(): Promise<GroupListItem[]> {
    const res = await authFetch('/api/groups');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async getGroup(groupId: string): Promise<GroupWithMembers | null> {
    const res = await authFetch(`/api/groups/${groupId}`);
    if (!res.ok) return null;
    return res.json();
  },

  async createGroup(name: string): Promise<{ id: string; conversation_id: string } | null> {
    const res = await authFetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (!res.ok) return null;
    return res.json();
  },

  async updateGroup(
    groupId: string,
    payload: { name?: string; avatar_url?: string; motive?: string | null; view_only_mode?: boolean; priority_user_id?: string | null }
  ): Promise<boolean> {
    const res = await authFetch(`/api/groups/${groupId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  },

  /** Upload group avatar (creator only). Returns new avatar_url or null. */
  async uploadGroupAvatar(groupId: string, file: File): Promise<{ avatar_url: string } | null> {
    const token = getStoredAuthToken();
    if (!token) return null;
    const base = await getChatApiUrl();
    const form = new FormData();
    form.append('avatar', file);
    const res = await fetch(`${base}/api/groups/${groupId}/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.avatar_url ? { avatar_url: data.avatar_url } : null;
  },

  async deleteGroup(groupId: string): Promise<boolean> {
    const res = await authFetch(`/api/groups/${groupId}`, { method: 'DELETE' });
    return res.ok;
  },

  async removeMember(groupId: string, userId: string): Promise<boolean> {
    const res = await authFetch(`/api/groups/${groupId}/members/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
    return res.ok;
  },

  async setMemberRole(groupId: string, userId: string, role: 'admin' | 'member'): Promise<boolean> {
    const res = await authFetch(`/api/groups/${groupId}/members/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, role }),
    });
    return res.ok;
  },

  async getConnections(): Promise<ConnectionUser[]> {
    const res = await authFetch('/api/connections');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async sendInvite(groupId: string, invitedUserId: string): Promise<{ invite_id: string } | { error: string }> {
    const res = await authFetch(`/api/groups/${groupId}/invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invited_user_id: invitedUserId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data?.message ?? 'Failed to send invite' };
    return { invite_id: data.invite_id };
  },

  async getPendingInvites(): Promise<GroupInvitePending[]> {
    const res = await authFetch('/api/groups/invites/pending');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async acceptInvite(inviteId: string): Promise<boolean> {
    const res = await authFetch(`/api/groups/invites/${inviteId}/accept`, { method: 'POST' });
    return res.ok;
  },

  async rejectInvite(inviteId: string): Promise<boolean> {
    const res = await authFetch(`/api/groups/invites/${inviteId}/reject`, { method: 'POST' });
    return res.ok;
  },

  async getGroupInvites(groupId: string): Promise<GroupInvitePending[]> {
    const res = await authFetch(`/api/groups/${groupId}/invites`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async getNotifications(): Promise<NotificationItem[]> {
    const res = await authFetch('/api/notifications');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async markNotificationRead(notificationId: string): Promise<boolean> {
    const res = await authFetch(`/api/notifications/${notificationId}/read`, { method: 'PATCH' });
    return res.ok;
  },

  async markAllNotificationsRead(): Promise<boolean> {
    const res = await authFetch('/api/notifications/read-all', { method: 'PATCH' });
    return res.ok;
  },
};
