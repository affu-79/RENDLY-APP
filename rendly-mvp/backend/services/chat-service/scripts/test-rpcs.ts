/**
 * Test script for chat performance RPCs: list_conversation_partner_ids, get_whisper_unread_count.
 * Run from chat-service root: npx ts-node scripts/test-rpcs.ts
 *
 * Alternative: start chat-service (NODE_ENV=development) and GET http://localhost:3004/api/dev/test-rpcs
 */
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

import { supabase } from "../src/supabase-users";
import { listConversationPartnerIds, getWhisperUnreadCount } from "../src/db";

const TIMEOUT_MS = 15000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);
}

async function main() {
  if (!supabase) {
    console.error("Supabase not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
    process.exit(1);
  }

  console.log("Testing RPCs (timeout", TIMEOUT_MS, "ms)...\n");

  let users: { id: string }[] | null = null;
  let usersError: { message?: string } | null = null;
  try {
    const r = await withTimeout(supabase.from("users").select("id").limit(1), TIMEOUT_MS) as { data: { id: string }[] | null; error: { message?: string } | null };
    users = r.data;
    usersError = r.error;
  } catch (e) {
    console.error("Users fetch failed:", (e as Error).message);
    process.exit(1);
  }

  if (usersError || !users?.length) {
    console.error("Could not fetch a user from DB:", usersError?.message ?? "no users");
    process.exit(1);
  }

  const userId = users[0].id;
  console.log("1. list_conversation_partner_ids for user", userId.slice(0, 8) + "...");
  let partnerIds: string[] = [];
  try {
    partnerIds = await withTimeout(listConversationPartnerIds(userId), TIMEOUT_MS);
    console.log("   OK – partner count =", partnerIds.length, partnerIds.length ? "ids =" : "", partnerIds.length ? partnerIds : "");
  } catch (e) {
    console.error("   Error:", (e as Error).message);
  }

  if (partnerIds.length > 0) {
    console.log("\n2. get_whisper_unread_count for first partner:");
    try {
      const count = await withTimeout(getWhisperUnreadCount(userId, partnerIds[0]), TIMEOUT_MS);
      console.log("   OK – unread count =", count);
    } catch (e) {
      console.error("   Error:", (e as Error).message);
    }
  }

  console.log("\n3. Direct RPC list_conversation_partner_ids:");
  const direct = await supabase.rpc("list_conversation_partner_ids", { p_user_id: userId });
  console.log("   ids =", direct.data, "error =", direct.error?.message ?? "none");
  if (direct.error) {
    console.log("   -> Run migration: supabase/migrations/20250602_chat_perf_rpcs.sql");
  } else {
    console.log("   -> RPC is working.");
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
