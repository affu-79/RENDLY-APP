-- Password reset: token hash and expiry on users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_reset_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMPTZ;

COMMENT ON COLUMN users.password_reset_token_hash IS 'Bcrypt hash of one-time reset token';
COMMENT ON COLUMN users.password_reset_expires_at IS 'Expiry of reset token (e.g. 1 hour)';
