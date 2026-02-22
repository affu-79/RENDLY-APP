import path from "path";
import dotenv from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Load env before reading (auth-service may load this module before server.ts runs dotenv)
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

if (!supabase && (supabaseUrl || supabaseKey)) {
  console.warn("[auth-service] Supabase: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY; user data will not be saved to DB.");
}

export type UserRow = {
  id?: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  github_id: string | null;
  github_username: string | null;
  github_url: string | null;
  github_public_repos: number | null;
  github_commits_last_3m: number | null;
  linkedin_id: string | null;
  linkedin_url: string | null;
  linkedin_headline: string | null;
  linkedin_summary: string | null;
  created_at?: string;
  updated_at?: string;
};

/** Upsert user by GitHub id; merge with existing row if matched by email. */
export async function upsertUserByGitHub(payload: {
  github_id: string;
  github_username: string;
  github_url: string;
  github_public_repos: number | null;
  github_commits_last_3m: number | null;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
}): Promise<string | null> {
  if (!supabase) return null;
  const { data: byGithub } = await supabase.from("users").select("id").eq("github_id", payload.github_id).maybeSingle();
  const { data: byEmail } =
    payload.email != null ? await supabase.from("users").select("id, email, display_name, avatar_url").eq("email", payload.email).maybeSingle() : { data: null };
  const existing = byGithub ?? byEmail;
  const row: Record<string, unknown> = {
    github_id: payload.github_id,
    github_username: payload.github_username,
    github_url: payload.github_url,
    github_public_repos: payload.github_public_repos,
    github_commits_last_3m: payload.github_commits_last_3m,
    email: payload.email ?? byEmail?.email ?? null,
    display_name: payload.display_name ?? byEmail?.display_name ?? null,
    avatar_url: payload.avatar_url ?? byEmail?.avatar_url ?? null,
    updated_at: new Date().toISOString(),
  };
  if (existing?.id) {
    const { error } = await supabase.from("users").update(row).eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  } else {
    const { data, error } = await supabase.from("users").insert(row).select("id").single();
    if (error) throw error;
    return data?.id;
  }
}

/**
 * Upsert user by LinkedIn id. If linkToGithubId is set, merge into that existing user (same person, second provider).
 * Otherwise merge by email or linkedin_id as before.
 */
export async function upsertUserByLinkedIn(
  payload: {
    linkedin_id: string;
    linkedin_url: string | null;
    linkedin_headline: string | null;
    linkedin_summary: string | null;
    email: string | null;
    display_name: string | null;
    avatar_url: string | null;
  },
  linkToGithubId?: string | null
): Promise<string | null> {
  if (!supabase) return null;

  // Same user: frontend said they already verified GitHub; update that row with LinkedIn data
  if (linkToGithubId && linkToGithubId.trim()) {
    const { data: byGithub } = await supabase.from("users").select("id").eq("github_id", linkToGithubId.trim()).maybeSingle();
    if (byGithub?.id) {
      const row: Record<string, unknown> = {
        linkedin_id: payload.linkedin_id,
        linkedin_url: payload.linkedin_url,
        linkedin_headline: payload.linkedin_headline,
        linkedin_summary: payload.linkedin_summary,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("users").update(row).eq("id", byGithub.id);
      if (error) throw error;
      return byGithub.id;
    }
  }

  const { data: byLinkedIn } = await supabase.from("users").select("id").eq("linkedin_id", payload.linkedin_id).maybeSingle();
  const { data: byEmail } =
    payload.email != null ? await supabase.from("users").select("id, email, display_name, avatar_url").eq("email", payload.email).maybeSingle() : { data: null };
  const existing = byLinkedIn ?? byEmail;
  const row: Record<string, unknown> = {
    linkedin_id: payload.linkedin_id,
    linkedin_url: payload.linkedin_url,
    linkedin_headline: payload.linkedin_headline,
    linkedin_summary: payload.linkedin_summary,
    email: payload.email ?? byEmail?.email ?? null,
    display_name: payload.display_name ?? byEmail?.display_name ?? null,
    avatar_url: payload.avatar_url ?? byEmail?.avatar_url ?? null,
    updated_at: new Date().toISOString(),
  };
  if (existing?.id) {
    const { error } = await supabase.from("users").update(row).eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  } else {
    const { data, error } = await supabase.from("users").insert(row).select("id").single();
    if (error) throw error;
    return data?.id;
  }
}

/** Get user by github_id or linkedin_id (for /api/users/me). */
export async function getUserByProviderId(provider: "github" | "linkedin", sub: string): Promise<UserRow | null> {
  if (!supabase) return null;
  const col = provider === "github" ? "github_id" : "linkedin_id";
  const { data } = await supabase.from("users").select("*").eq(col, sub).maybeSingle();
  return data as UserRow | null;
}
