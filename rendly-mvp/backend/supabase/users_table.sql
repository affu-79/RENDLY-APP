-- Run in Supabase Dashboard: SQL Editor → New query → paste → Run
-- Users table: stores merged profile from GitHub + LinkedIn for profile pre-fill

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,

  -- GitHub (from OAuth)
  github_id TEXT UNIQUE,
  github_username TEXT,
  github_url TEXT,
  github_public_repos INT,
  github_commits_last_3m INT,

  -- LinkedIn (from OAuth)
  linkedin_id TEXT UNIQUE,
  linkedin_url TEXT,
  linkedin_headline TEXT,
  linkedin_summary TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id) WHERE github_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_linkedin_id ON users(linkedin_id) WHERE linkedin_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;

-- Optional: trigger to keep updated_at in sync
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
