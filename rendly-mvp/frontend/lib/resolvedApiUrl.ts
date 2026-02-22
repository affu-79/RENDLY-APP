/**
 * Single permanent backend URL: auto-detect by trying 4001 (local auth) then 80 (Docker gateway).
 * No need to switch env between local and Docker — whichever is running will be used.
 */

const CANDIDATES = ["http://localhost:4001", "http://localhost:80"] as const;
const HEALTH_PATH = "/health";
const TIMEOUT_MS = 4000;

let cached: string | null = null;

function checkHealth(baseUrl: string): Promise<boolean> {
  const url = `${baseUrl.replace(/\/$/, "")}${HEALTH_PATH}`;
  return new Promise<boolean>((resolve) => {
    const controller = new AbortController();
    const t = setTimeout(() => {
      controller.abort();
      resolve(false);
    }, TIMEOUT_MS);
    fetch(url, { signal: controller.signal })
      .then((res) => {
        clearTimeout(t);
        resolve(res.ok);
      })
      .catch(() => {
        clearTimeout(t);
        resolve(false);
      });
  });
}

/**
 * Resolves the backend API base URL by trying 4001 then 80. Result is cached for the session.
 * Use this everywhere instead of NEXT_PUBLIC_API_URL so one config works for both local and Docker.
 */
export async function getResolvedApiUrl(): Promise<string> {
  if (cached) return cached;

  const override = typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL?.trim();
  if (override) {
    const ok = await checkHealth(override);
    cached = ok ? override.replace(/\/$/, "") : override.replace(/\/$/, "");
    return cached;
  }

  for (const base of CANDIDATES) {
    const ok = await checkHealth(base);
    if (ok) {
      cached = base;
      return cached;
    }
  }

  cached = CANDIDATES[0];
  return cached;
}

/** Returns the cached URL if already resolved; otherwise null. */
export function getResolvedApiUrlSync(): string | null {
  return cached;
}

/** WS URL from the same host as the resolved API (for socket.io etc.). */
export function apiUrlToWsUrl(apiUrl: string): string {
  return apiUrl.replace(/^http/, "ws");
}
