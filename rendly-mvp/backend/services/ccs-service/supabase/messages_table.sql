-- Run this in Supabase Dashboard: SQL Editor → New query → paste → Run
-- Creates the messages table required by CCS (Central Chat Server)

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- Optional: enable RLS and add policies if using anon key
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow insert for authenticated" ON messages FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow select for conversation participants" ON messages FOR SELECT USING (true);
