-- Chat storage: user JSON (whispers messages + call_logs), group JSON (group messages), groups + group_members.
-- Sender-only: message stored in sender's user_chat_data or in group_chat_data for group.
-- Requires users.id (UUID). Run after users and connections exist.

-- One JSON document per user: whispers.messages, whispers.call_logs, whispers.deleted_ids, whispers.view_once_consumed; group.messages (optional).
CREATE TABLE IF NOT EXISTS user_chat_data (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{"v":1,"whispers":{"messages":[],"call_logs":[],"deleted_ids":[],"view_once_consumed":[]},"group":{"messages":[]},"meta":{}}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_chat_data_updated_at ON user_chat_data(updated_at);

-- Groups table (conversation id = group id).
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS groups_created_by ON groups(created_by);

-- Group members with role.
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('creator', 'admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS group_members_user_id ON group_members(user_id);

-- One JSON document per group: messages only (sender-only per group).
CREATE TABLE IF NOT EXISTS group_chat_data (
  group_id UUID PRIMARY KEY REFERENCES groups(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{"v":1,"messages":[],"meta":{}}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS group_chat_data_updated_at ON group_chat_data(updated_at);

-- Optional: user_conversation_meta for favorite/read (1:1 threads). Key by (user_id, other_user_id).
CREATE TABLE IF NOT EXISTS user_conversation_meta (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  other_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  last_read_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, other_user_id)
);

-- Chat media storage bucket (whispers and group paths: whispers/<conv_key>/, group/<group_id>/).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  gen_random_uuid(),
  'chat-media',
  false,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.*', 'text/plain', 'application/octet-stream']
)
ON CONFLICT (name) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Service role can read/write chat-media (backend only).
CREATE POLICY "Service role full access chat-media"
ON storage.objects FOR ALL
USING (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'chat-media'));

-- Atomic append: avoid read-modify-write. Call from chat-service via RPC or raw SQL.
CREATE OR REPLACE FUNCTION append_user_whisper_message(p_user_id UUID, p_message JSONB)
RETURNS void AS $$
BEGIN
  INSERT INTO user_chat_data (user_id, data, updated_at)
  VALUES (p_user_id, '{"v":1,"whispers":{"messages":[],"call_logs":[],"deleted_ids":[],"view_once_consumed":[]},"group":{"messages":[]},"meta":{}}'::jsonb, now())
  ON CONFLICT (user_id) DO NOTHING;
  UPDATE user_chat_data
  SET data = jsonb_set(data, '{whispers,messages}', COALESCE(data->'whispers'->'messages', '[]'::jsonb) || jsonb_build_array(p_message)),
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION append_user_call_log(p_user_id UUID, p_log JSONB)
RETURNS void AS $$
BEGIN
  INSERT INTO user_chat_data (user_id, data, updated_at)
  VALUES (p_user_id, '{"v":1,"whispers":{"messages":[],"call_logs":[],"deleted_ids":[],"view_once_consumed":[]},"group":{"messages":[]},"meta":{}}'::jsonb, now())
  ON CONFLICT (user_id) DO NOTHING;
  UPDATE user_chat_data
  SET data = jsonb_set(data, '{whispers,call_logs}', COALESCE(data->'whispers'->'call_logs', '[]'::jsonb) || jsonb_build_array(p_log)),
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION append_group_message(p_group_id UUID, p_message JSONB)
RETURNS void AS $$
BEGIN
  INSERT INTO group_chat_data (group_id, data, updated_at)
  VALUES (p_group_id, '{"v":1,"messages":[],"meta":{}}'::jsonb, now())
  ON CONFLICT (group_id) DO NOTHING;
  UPDATE group_chat_data
  SET data = jsonb_set(data, '{messages}', COALESCE(data->'messages', '[]'::jsonb) || jsonb_build_array(p_message)),
      updated_at = now()
  WHERE group_id = p_group_id;
END;
$$ LANGUAGE plpgsql;
