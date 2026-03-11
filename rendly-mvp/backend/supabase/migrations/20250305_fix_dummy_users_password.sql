-- Fix password hash for existing dummy users (seed used wrong hash).
-- Password: @Afnan123 (bcrypt cost 10). Run after 20250304_seed_dummy_users.sql.
UPDATE users
SET password_hash = '$2b$10$92KGzS7M4mJjg.tXVYYMZ.Ck2k9yRD3DcJyCw8pMskUy1aOQv3X6e',
    updated_at = now()
WHERE username IN ('dummy1', 'dummy2', 'dummy3', 'dummy4', 'dummy5');
