/** Keys used to store OAuth data in localStorage (must match login/callback). */
export const GITHUB_STORAGE_KEY = "rendly_oauth_github";
export const LINKEDIN_STORAGE_KEY = "rendly_oauth_linkedin";

/** Session key: when user already verified GitHub and is now verifying LinkedIn, we link to that user. */
export const LINK_TO_GITHUB_ID_KEY = "rendly_link_to_github_id";

type StoredAuth = { verified?: boolean; user?: unknown; token?: string | null };

/** Returns the first available JWT from GitHub or LinkedIn localStorage. Used for /api/users/me. */
export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const g = localStorage.getItem(GITHUB_STORAGE_KEY);
    if (g) {
      const d: StoredAuth = JSON.parse(g);
      if (d?.verified && d?.token) return d.token;
    }
    const l = localStorage.getItem(LINKEDIN_STORAGE_KEY);
    if (l) {
      const d: StoredAuth = JSON.parse(l);
      if (d?.verified && d?.token) return d.token;
    }
  } catch {
    // ignore
  }
  return null;
}
