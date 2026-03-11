import { getResolvedApiUrl } from '@/lib/resolvedApiUrl';
import { clearAuthStorage, getStoredAuthToken } from '@/lib/auth-storage';

export const auth = {
  login: async () => ({}),

  /** Log out: optionally notify backend, clear local auth storage. Does not redirect. */
  logout: async (): Promise<void> => {
    const token = typeof window !== 'undefined' ? getStoredAuthToken() : null;
    try {
      const baseUrl = await getResolvedApiUrl();
      await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {
      // Proceed to clear local storage even if backend is unreachable
    }
    clearAuthStorage();
  },
};
