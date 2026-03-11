-- Add profession to users for profile page
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS profession TEXT;

COMMENT ON COLUMN users.profession IS 'Optional profession (e.g. Developer, Designer)';
