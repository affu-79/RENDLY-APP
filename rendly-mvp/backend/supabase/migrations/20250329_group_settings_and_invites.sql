-- Group settings: motive, view_only_mode, priority_user_id.
-- Group invites: allow admins to invite connections to join the group.

ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS motive TEXT,
  ADD COLUMN IF NOT EXISTS view_only_mode BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS priority_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE TABLE IF NOT EXISTS group_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, invited_user_id)
);

CREATE INDEX IF NOT EXISTS group_invites_group_id ON group_invites(group_id);
CREATE INDEX IF NOT EXISTS group_invites_invited_user_id ON group_invites(invited_user_id);
CREATE INDEX IF NOT EXISTS group_invites_status ON group_invites(status);
