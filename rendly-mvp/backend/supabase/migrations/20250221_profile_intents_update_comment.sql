-- Update selected_intents column comment to reflect current intent options
-- Run in Supabase Dashboard: SQL Editor → New query → paste → Run

COMMENT ON COLUMN users.selected_intents IS 'Array of intent slugs: Light chat, Brainstorm, Motivation, Collaborate, Networking (2-5 required at profile setup)';
