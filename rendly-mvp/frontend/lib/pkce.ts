/**
 * PKCE (Proof Key for Code Exchange) for OAuth 2.0.
 * Used by LinkedIn when they require code_verifier in the token exchange.
 */

const VERIFIER_LENGTH = 64;

function randomBytes(length: number): string {
  const array = new Uint8Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) array[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Generate a code_verifier (43–128 chars, URL-safe). */
export function generateCodeVerifier(): string {
  return randomBytes(VERIFIER_LENGTH);
}

/** Compute code_challenge = base64url(sha256(verifier)). */
export async function computeCodeChallenge(verifier: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const data = new TextEncoder().encode(verifier);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return base64UrlEncode(hash);
  }
  return Promise.resolve("");
}

export const LINKEDIN_PKCE_STORAGE_KEY = "rendly_linkedin_pkce_verifier";
