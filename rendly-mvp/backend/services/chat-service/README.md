# Chat Service

REST + Socket.IO service for conversations, messages, groups, and call logs. Uses Supabase for storage.

## Database setup

Run the chat migrations on your Supabase database **before** starting the service (otherwise you'll get `PGRST202` / "Could not find the function append_user_whisper_message"):

1. **Supabase Dashboard:** SQL Editor → run the contents of each file in order:
   - `backend/supabase/migrations/20250309_chat_user_group_json.sql` (tables + initial RPCs)
   - `backend/supabase/migrations/20250328_chat_rpc_param_order.sql` (RPC parameter order for PostgREST)
   - `backend/supabase/migrations/20250602_chat_perf_rpcs.sql` (conversation list + unread count)
   - `backend/supabase/migrations/20250603_get_whisper_thread_messages.sql` (fast whisper messages)
   - `backend/supabase/migrations/20250604_get_group_unread_count.sql` (fast group unread count)
   - `backend/supabase/migrations/20250605_get_group_thread_messages.sql` (fast group messages, target under 500ms / max 2000ms)
   - `backend/supabase/migrations/20250606_group_messages_table.sql` (normalized group_messages table + fast RPC read; apply if group retrieval is still slow)
   - `backend/supabase/migrations/20250608_append_rpcs_statement_timeout.sql` (raises statement timeout for append RPCs; fixes "Failed to save message" / 57014 when whisper history is large)

2. **Reload schema cache** (if the function still isn't found): in SQL Editor run:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

3. Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (and optionally `JWT_SECRET`) are set in `backend/.env` or this service's env.

4. **If "Failed to save message" / 57014 still occurs** after applying the migrations: set `DATABASE_URL` in `backend/.env` to your Supabase connection string (e.g. `postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres`). The chat-service rewrites `db.REF.supabase.co` to the pooler host (`aws-0-REGION.pooler.supabase.com:6543`) so the connection resolves (avoids ENOTFOUND). Default region is `us-east-1`; set `SUPABASE_POOLER_REGION` (e.g. `ap-southeast-1`) if your project is in another region.

## Run

```bash
npm run dev
```

Default port: 4002 (or set `CHAT_SERVICE_PORT` / `PORT`, e.g. 3004).
