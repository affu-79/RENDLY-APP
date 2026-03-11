-- Seed 5 dummy users for testing connection invites and profile flows.
-- Login: use username (dummy1, dummy2, ...) or email (dummy1@example.com, ...).
-- Password for all: @Afnan123
-- Run once; uses ON CONFLICT so safe to re-run (no duplicate usernames).

-- bcrypt hash for '@Afnan123' (cost 10) — verified with bcrypt.compare
INSERT INTO users (id, email, username, password_hash, updated_at)
VALUES
  (gen_random_uuid(), 'dummy1@example.com', 'dummy1', '$2b$10$92KGzS7M4mJjg.tXVYYMZ.Ck2k9yRD3DcJyCw8pMskUy1aOQv3X6e', now()),
  (gen_random_uuid(), 'dummy2@example.com', 'dummy2', '$2b$10$92KGzS7M4mJjg.tXVYYMZ.Ck2k9yRD3DcJyCw8pMskUy1aOQv3X6e', now()),
  (gen_random_uuid(), 'dummy3@example.com', 'dummy3', '$2b$10$92KGzS7M4mJjg.tXVYYMZ.Ck2k9yRD3DcJyCw8pMskUy1aOQv3X6e', now()),
  (gen_random_uuid(), 'dummy4@example.com', 'dummy4', '$2b$10$92KGzS7M4mJjg.tXVYYMZ.Ck2k9yRD3DcJyCw8pMskUy1aOQv3X6e', now()),
  (gen_random_uuid(), 'dummy5@example.com', 'dummy5', '$2b$10$92KGzS7M4mJjg.tXVYYMZ.Ck2k9yRD3DcJyCw8pMskUy1aOQv3X6e', now())
ON CONFLICT (username) DO NOTHING;
