-- Chat performance: RPCs to avoid full table scan and heavy JSON transfer for conversation list and unread count.
-- list_conversation_partner_ids: returns partner user_ids in DB (no JSON to app).
-- get_whisper_unread_count: returns unread count in DB using last_read_at (no thread fetch to app).

CREATE OR REPLACE FUNCTION list_conversation_partner_ids(p_user_id UUID)
RETURNS SETOF UUID AS $$
  SELECT DISTINCT partner_id FROM (
    SELECT (elem->>'sent_to_id')::uuid AS partner_id
    FROM user_chat_data, jsonb_array_elements(COALESCE(data->'whispers'->'messages', '[]'::jsonb)) AS elem
    WHERE user_id = p_user_id
      AND (elem->>'sent_to_id') IS NOT NULL
      AND (elem->>'sent_to_id')::uuid != p_user_id
    UNION
    SELECT user_id AS partner_id
    FROM user_chat_data, jsonb_array_elements(COALESCE(data->'whispers'->'messages', '[]'::jsonb)) AS elem
    WHERE user_id != p_user_id
      AND (elem->>'sent_to_id') = p_user_id::text
  ) t WHERE partner_id IS NOT NULL;
$$ LANGUAGE sql STABLE;

-- Unread count: sender-only storage, so messages from other are in other's row (sent_to_id = me). Count those after last_read_at (single pass, no loop).
CREATE OR REPLACE FUNCTION get_whisper_unread_count(p_user_id UUID, p_other_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::integer
  FROM user_chat_data u
  CROSS JOIN LATERAL jsonb_array_elements(COALESCE(u.data->'whispers'->'messages', '[]'::jsonb)) AS elem
  LEFT JOIN user_conversation_meta m ON m.user_id = p_user_id AND m.other_user_id = p_other_user_id
  WHERE u.user_id = p_other_user_id
    AND (elem->>'sent_to_id') = p_user_id::text
    AND ( m.last_read_at IS NULL
          OR COALESCE((elem->>'created_at')::timestamptz, ((elem->>'date') || ' ' || COALESCE(elem->>'time', '00:00'))::timestamptz) > m.last_read_at );
$$ LANGUAGE sql STABLE;
