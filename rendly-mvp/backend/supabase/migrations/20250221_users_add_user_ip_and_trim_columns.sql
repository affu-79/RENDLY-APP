-- Migration: Add user_IP and keep only circled fields (one account per device + spam/DDoS mitigation)
-- Run in Supabase Dashboard: SQL Editor → New query → paste → Run

-- 1. Add user_IP column (stores client IP for one-account-per-device and security)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS user_IP TEXT;

COMMENT ON COLUMN users.user_IP IS 'Client IP at sign-up; used for one account per device and spam/DDoS mitigation';

-- 2. Optional: Remove columns not in the circled set (run only after backing up data if needed)
-- Uncomment the following lines to drop the columns you no longer want:

-- ALTER TABLE users DROP COLUMN IF EXISTS display_name;
-- ALTER TABLE users DROP COLUMN IF EXISTS github_username;
-- ALTER TABLE users DROP COLUMN IF EXISTS github_public_repos;
-- ALTER TABLE users DROP COLUMN IF EXISTS github_commits_last_3m;
-- ALTER TABLE users DROP COLUMN IF EXISTS linkedin_headline;
-- ALTER TABLE users DROP COLUMN IF EXISTS linkedin_summary;

-- After running this migration, the app expects users to have at least:
-- id, email, avatar_url, github_id, github_url, linkedin_id, linkedin_url, created_at, updated_at, user_IP
