-- Profile setup: username, password_hash, selected_intents, bio
-- Run in Supabase Dashboard: SQL Editor → New query → paste → Run

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS selected_intents JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS bio TEXT;

COMMENT ON COLUMN users.username IS 'Unique username set at profile setup';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hash set at profile setup';
COMMENT ON COLUMN users.selected_intents IS 'Array of intent slugs: Light chat, Brainstorm, Motivation, Collaborate, Networking';
COMMENT ON COLUMN users.bio IS 'Optional short bio, max 150 chars';

CREATE UNIQUE INDEX IF NOT EXISTS users_username_key ON users (username) WHERE username IS NOT NULL;
