import path from "path";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import axios from "axios";
import jwt from "jsonwebtoken";
import { upsertUserByGitHub, upsertUserByLinkedIn, getUserByProviderId } from "./supabase-users";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || process.env.PORT || 3001;

const REDIRECT_URI = process.env.OAUTH_REDIRECT_URI || "http://localhost:3001/auth/callback";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

/** Idempotency: avoid exchanging the same GitHub code twice (e.g. double useEffect in dev). */
const githubCodeCache = new Map<string, { user: object; jwt: string }>();
const GITHUB_CODE_CACHE_TTL_MS = 60_000;
function getCachedGitHubResult(code: string): { user: object; jwt: string } | null {
  return githubCodeCache.get(code) ?? null;
}
function setCachedGitHubResult(code: string, user: object, jwt: string) {
  githubCodeCache.set(code, { user, jwt });
  setTimeout(() => githubCodeCache.delete(code), GITHUB_CODE_CACHE_TTL_MS);
}

/** Fetch total commit contributions in the last 3 months for a GitHub user (GraphQL). */
async function getGitHubCommitsLast3Months(accessToken: string, login: string): Promise<number> {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 3);
  const fromStr = from.toISOString().slice(0, 19) + "Z";
  const toStr = to.toISOString().slice(0, 19) + "Z";
  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          commitContributionsByRepository {
            contributions(first: 100) { totalCount }
          }
        }
      }
    }
  `;
  try {
    const res = await axios.post(
      "https://api.github.com/graphql",
      { query, variables: { login, from: fromStr, to: toStr } },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );
    const repos = res.data?.data?.user?.contributionsCollection?.commitContributionsByRepository ?? [];
    let total = 0;
    for (const r of repos) {
      const c = r.contributions?.totalCount ?? 0;
      total += c;
    }
    return total;
  } catch {
    return 0;
  }
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.get("/health", (_req, res) => {
  res.json({ status: "OK", service: "auth-service" });
});

app.get("/api/auth/status", (_req, res) => {
  res.json({ message: "Auth service is running" });
});

app.post("/api/auth/github/callback", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== "string") {
      res.status(400).json({ message: "Missing or invalid code" });
      return;
    }
    const normalizedCode = code.trim();
    const cached = getCachedGitHubResult(normalizedCode);
    if (cached) {
      return res.json({ user: cached.user, accessToken: cached.jwt });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      res.status(500).json({ message: "GitHub OAuth not configured" });
      return;
    }
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: clientId,
        client_secret: clientSecret,
        code: normalizedCode,
        redirect_uri: REDIRECT_URI,
      },
      { headers: { Accept: "application/json" }, timeout: 10000 }
    );
    const rawToken = tokenRes.data?.access_token;
    if (!rawToken) {
      res.status(401).json({ message: tokenRes.data?.error_description || "GitHub token exchange failed" });
      return;
    }
    const accessToken = String(rawToken).trim();

    const headers = {
      Accept: "application/vnd.github+json" as const,
      "X-GitHub-Api-Version": "2022-11-28",
    };
    type GhProfile = { id?: number; login?: string; name?: string; email?: string | null; avatar_url?: string | null; public_repos?: number };

    async function fetchGitHubUser(token: string): Promise<GhProfile> {
      const authHeaders = [
        { ...headers, Authorization: `Bearer ${token}` },
        { ...headers, Authorization: `token ${token}` },
      ];
      let lastErr: unknown;
      for (const h of authHeaders) {
        try {
          const r = await axios.get<GhProfile>("https://api.github.com/user", {
            headers: h,
            timeout: 10000,
          });
          return r.data;
        } catch (e) {
          lastErr = e;
          const status = (e as { response?: { status?: number } })?.response?.status;
          if (status === 401) {
            await new Promise((r) => setTimeout(r, 350));
            try {
              const r = await axios.get<GhProfile>("https://api.github.com/user", {
                headers: h,
                timeout: 10000,
              });
              return r.data;
            } catch {
              continue;
            }
          }
          throw e;
        }
      }
      const msg = (lastErr as { response?: { data?: { message?: string } } })?.response?.data?.message;
      console.error("[auth-service] GitHub /user 401 (tried Bearer and token, with retry):", msg ?? lastErr);
      throw lastErr;
    }

    let profile: GhProfile;
    try {
      profile = await fetchGitHubUser(accessToken);
    } catch (userErr: unknown) {
      const status = (userErr as { response?: { status?: number } })?.response?.status;
      const msg = (userErr as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (status === 401) {
        res.status(401).json({
          message: "GitHub returned bad credentials. Ensure your GitHub OAuth app callback URL matches exactly and try again.",
        });
        return;
      }
      console.error("[auth-service] GitHub /user error:", msg ?? userErr);
      res.status(500).json({ message: msg ?? "Failed to load GitHub profile" });
      return;
    }
    const githubId = String(profile.id);
    const login = profile.login ?? "";
    const name = profile.name || profile.login;
    const email = profile.email ?? null;
    const avatarUrl = profile.avatar_url ?? null;
    const publicRepos = typeof profile.public_repos === "number" ? profile.public_repos : null;
    const commitsLast3m = await getGitHubCommitsLast3Months(accessToken, login);
    const githubUrl = login ? `https://github.com/${login}` : "";

    try {
      const userId = await upsertUserByGitHub({
        github_id: githubId,
        github_username: login,
        github_url: githubUrl,
        github_public_repos: publicRepos,
        github_commits_last_3m: commitsLast3m,
        email: email ?? null,
        display_name: name ?? null,
        avatar_url: avatarUrl ?? null,
      });
      console.log(`[auth-service] GitHub verified: ${login} (id=${githubId}). User data ${userId ? "saved" : "skipped (no DB)"} in Supabase users table.`);
    } catch (dbErr) {
      console.error("[auth-service] Supabase upsert (GitHub) failed:", dbErr);
    }

    const user = {
      id: githubId,
      login,
      name,
      avatar_url: avatarUrl,
      email,
    };
    const jwtToken = jwt.sign(
      { sub: user.id, provider: "github", login: user.login },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    setCachedGitHubResult(normalizedCode, user, jwtToken);
    res.json({ user, accessToken: jwtToken });
  } catch (err: unknown) {
    console.error("GitHub callback error:", err);
    const ax = err as { response?: { status?: number; data?: { message?: string; error_description?: string; error?: string } } };
    const data = ax?.response?.data;
    const status = ax?.response?.status;
    const message = data?.message ?? data?.error_description ?? data?.error ?? "GitHub authentication failed";
    res.status(status && status >= 400 ? status : 500).json({ message: String(message) });
  }
});

app.post("/api/auth/linkedin/callback", async (req, res) => {
  try {
    const { code, code_verifier: codeVerifier, link_to_github_id: linkToGithubId } = req.body;
    if (!code || typeof code !== "string") {
      res.status(400).json({ message: "Missing or invalid code" });
      return;
    }
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      res.status(500).json({ message: "LinkedIn OAuth not configured" });
      return;
    }
    const params: Record<string, string> = {
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
    };
    if (codeVerifier && typeof codeVerifier === "string") {
      params.code_verifier = codeVerifier;
    }
    const tokenRes = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams(params).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: 10000 }
    );
    const accessToken = tokenRes.data?.access_token;
    if (!accessToken) {
      res.status(401).json({ message: "LinkedIn token exchange failed" });
      return;
    }
    const profileRes = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 10000,
    });
    const profile = profileRes.data;
    const linkedinId = profile.sub;
    const name = profile.name ?? profile.given_name ?? "User";
    const email = profile.email ?? null;
    const picture = profile.picture ?? null;

    let linkedinUrl: string | null = null;
    let linkedinHeadline: string | null = null;
    let linkedinSummary: string | null = null;
    try {
      const meRes = await axios.get("https://api.linkedin.com/v2/me?projection=(id,vanityName)", {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 8000,
      });
      const vanity = meRes.data?.vanityName;
      if (vanity) linkedinUrl = `https://www.linkedin.com/in/${vanity}`;
    } catch {
      // optional; userinfo is enough
    }

    try {
      const userId = await upsertUserByLinkedIn(
        {
          linkedin_id: linkedinId,
          linkedin_url: linkedinUrl,
          linkedin_headline: linkedinHeadline,
          linkedin_summary: linkedinSummary,
          email: email ?? null,
          display_name: name ?? null,
          avatar_url: picture ?? null,
        },
        linkToGithubId
      );
      console.log(`[auth-service] LinkedIn verified: ${name} (id=${linkedinId}). User data ${userId ? "saved" : "skipped (no DB)"} in Supabase users table${linkToGithubId ? " (merged with GitHub user)" : ""}.`);
    } catch (dbErr) {
      console.error("[auth-service] Supabase upsert (LinkedIn) failed:", dbErr);
    }

    const user = {
      id: linkedinId,
      name,
      picture,
      email,
    };
    const jwtToken = jwt.sign(
      { sub: user.id, provider: "linkedin" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ user, accessToken: jwtToken });
  } catch (err: unknown) {
    console.error("LinkedIn callback error:", err);
    const ax = err as { response?: { status?: number; data?: { error_description?: string; error?: string } } };
    const data = ax?.response?.data;
    const status = ax?.response?.status;
    const message = data?.error_description ?? data?.error ?? "LinkedIn authentication failed";
    res.status(status && status >= 400 ? status : 500).json({ message: String(message) });
  }
});

app.post("/api/auth/continue", (_req, res) => {
  res.json({ redirectUrl: "/auth/profile-setup" });
});

/** Get current user profile from DB (for profile-setup and dashboard). Requires Authorization: Bearer <jwt>. */
app.get("/api/users/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      res.status(401).json({ message: "Missing or invalid authorization" });
      return;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string; provider?: string };
    const sub = decoded?.sub;
    const provider = decoded?.provider === "linkedin" ? "linkedin" : "github";
    if (!sub) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }
    const user = await getUserByProviderId(provider, sub);
    if (!user) {
      res.status(404).json({ message: "User profile not found" });
      return;
    }
    res.json({
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      github_username: user.github_username,
      github_url: user.github_url,
      github_public_repos: user.github_public_repos,
      github_commits_last_3m: user.github_commits_last_3m,
      linkedin_url: user.linkedin_url,
      linkedin_headline: user.linkedin_headline,
      linkedin_summary: user.linkedin_summary,
    });
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }
    console.error("GET /api/users/me error:", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
});

app.use((err: unknown, _req: express.Request, res: express.Response) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
