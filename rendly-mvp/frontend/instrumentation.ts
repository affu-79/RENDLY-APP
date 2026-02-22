import { getResolvedApiUrl } from "./lib/resolvedApiUrl";

/**
 * Runs once when the Next.js server starts (dev or production).
 * Auto-detects backend (4001 then 80) and logs connection status.
 */
export async function register() {
  const check = async () => {
    try {
      const apiUrl = await getResolvedApiUrl();
      const healthUrl = `${apiUrl.replace(/\/$/, "")}/health`;
      const res = await fetch(healthUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        console.log("\n[Rendly] Backend API: connected (" + healthUrl + ")\n");
      } else {
        console.log("\n[Rendly] Backend API: responded with " + res.status + " (" + healthUrl + ")\n");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log("\n[Rendly] Backend API: not connected - " + msg + "\n");
    }
  };

  setTimeout(check, 1500);
}
