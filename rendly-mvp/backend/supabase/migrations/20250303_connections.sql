-- Connections, connection invites, and user blocks for profile/social features.
-- Requires users.id (UUID). Run after users table exists.

-- Connection invites: one row per (from, to) pair; status allows re-invite after reject.
CREATE TABLE IF NOT EXISTS connection_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(from_user_id, to_user_id)
);

CREATE INDEX IF NOT EXISTS connection_invites_to_user_id ON connection_invites(to_user_id);
CREATE INDEX IF NOT EXISTS connection_invites_from_user_id ON connection_invites(from_user_id);
CREATE INDEX IF NOT EXISTS connection_invites_status ON connection_invites(status);

-- Connections: one row per unordered pair (user_id < connected_user_id for consistency).
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  connected_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, connected_user_id),
  CHECK (user_id < connected_user_id)
);

CREATE INDEX IF NOT EXISTS connections_user_id ON connections(user_id);
CREATE INDEX IF NOT EXISTS connections_connected_user_id ON connections(connected_user_id);

-- User blocks: blocker blocks blocked.
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

CREATE INDEX IF NOT EXISTS user_blocks_blocker_id ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS user_blocks_blocked_id ON user_blocks(blocked_id);
