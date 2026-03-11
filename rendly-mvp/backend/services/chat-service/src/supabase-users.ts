import path from "path";
import dotenv from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export type UserRow = {
  id?: string;
  username?: string | null;
  email?: string | null;
  avatar_url?: string | null;
};

export async function getUserById(id: string): Promise<UserRow | null> {
  if (!supabase || !id?.trim()) return null;
  const { data } = await supabase.from("users").select("id, username, email, avatar_url").eq("id", id.trim()).maybeSingle();
  return data as UserRow | null;
}

/** Batch fetch users by ids (one query). Returns a Map for quick lookup. */
export async function getUsersByIds(ids: string[]): Promise<Map<string, UserRow>> {
  const map = new Map<string, UserRow>();
  if (!supabase || ids.length === 0) return map;
  const trimmed = [...new Set(ids.map((id) => id?.trim()).filter(Boolean))] as string[];
  if (trimmed.length === 0) return map;
  const { data } = await supabase.from("users").select("id, username, email, avatar_url").in("id", trimmed);
  (data ?? []).forEach((row: UserRow & { id?: string }) => {
    if (row.id) map.set(row.id, row);
  });
  return map;
}

export async function getUserByProviderId(provider: "github" | "linkedin", sub: string): Promise<UserRow | null> {
  if (!supabase) return null;
  const col = provider === "github" ? "github_id" : "linkedin_id";
  const { data } = await supabase.from("users").select("id, username, email, avatar_url").eq(col, sub).maybeSingle();
  return data as UserRow | null;
}
