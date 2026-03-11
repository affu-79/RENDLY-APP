import { authFetch } from '@/lib/api';

export type UserSettings = {
  camera_allowed: boolean;
  microphone_allowed: boolean;
  notifications_allowed: boolean;
  location_allowed: boolean;
  popups_redirects_allowed: boolean;
  sound_allowed: boolean;
  auto_verify: boolean;
  on_device_site_data: boolean;
};

export async function getSettings(): Promise<UserSettings> {
  const res = await authFetch('/api/users/me/settings');
  if (!res.ok) throw new Error('Failed to load settings');
  const data = await res.json();
  return {
    camera_allowed: Boolean(data.camera_allowed),
    microphone_allowed: Boolean(data.microphone_allowed),
    notifications_allowed: Boolean(data.notifications_allowed),
    location_allowed: Boolean(data.location_allowed),
    popups_redirects_allowed: Boolean(data.popups_redirects_allowed),
    sound_allowed: Boolean(data.sound_allowed),
    auto_verify: Boolean(data.auto_verify),
    on_device_site_data: Boolean(data.on_device_site_data),
  };
}

export async function patchSettings(partial: Partial<UserSettings>): Promise<{ ok: true } | { ok: false; message: string }> {
  const res = await authFetch('/api/users/me/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partial),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, message: (data?.message as string) || 'Failed to save settings' };
  return { ok: true };
}

export type ReportType = 'harassment' | 'fraud' | 'spam' | 'other';

export async function submitReport(params: {
  type: ReportType;
  description?: string;
  target_user_id?: string;
  target_type?: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const res = await authFetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, message: (data?.message as string) || 'Failed to submit report' };
  return { ok: true };
}

export async function submitContact(params: { name: string; email: string; message: string }): Promise<{ ok: true } | { ok: false; message: string }> {
  const res = await authFetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, message: (data?.message as string) || 'Failed to send message' };
  return { ok: true };
}

export async function deleteAccount(): Promise<{ ok: true } | { ok: false; message: string }> {
  const res = await authFetch('/api/users/me', { method: 'DELETE' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, message: (data?.message as string) || 'Failed to delete account' };
  return { ok: true };
}
