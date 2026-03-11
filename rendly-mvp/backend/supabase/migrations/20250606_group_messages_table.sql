-- Normalized group_messages table for fast retrieval (indexed LIMIT instead of full JSONB read).
-- get_group_thread_messages reads from here; append_group_message writes to both group_chat_data and here.

CREATE TABLE IF NOT EXISTS group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  message JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS group_messages_group_created ON group_messages (group_id, created_at DESC);

-- Ensure API roles can read (chat-service uses service_role).
GRANT SELECT ON group_messages TO service_role;
GRANT SELECT ON group_messages TO authenticated;
GRANT SELECT ON group_messages TO anon;

-- Backfill from existing group_chat_data (one-time). Use message id when present to avoid duplicates on re-run.
INSERT INTO group_messages (id, group_id, message, created_at)
SELECT COALESCE((elem->>'id')::uuid, gen_random_uuid()),
       g.group_id,
       elem,
       COALESCE(
         (elem->>'created_at')::timestamptz,
         ((elem->>'date') || ' ' || COALESCE(elem->>'time', '00:00'))::timestamptz,
         now()
       )
FROM group_chat_data g,
     jsonb_array_elements(COALESCE(g.data->'messages', '[]'::jsonb)) AS elem
ON CONFLICT (id) DO NOTHING;

-- Append: also insert into group_messages so future reads are fast.
CREATE OR REPLACE FUNCTION append_group_message(p_message JSONB, p_group_id UUID)
RETURNS void AS $$
DECLARE
  v_created_at timestamptz;
  v_id uuid;
BEGIN
  v_created_at := COALESCE(
    (p_message->>'created_at')::timestamptz,
    now()
  );
  v_id := COALESCE((p_message->>'id')::uuid, gen_random_uuid());
  INSERT INTO group_messages (id, group_id, message, created_at)
  VALUES (v_id, p_group_id, p_message, v_created_at);

  INSERT INTO group_chat_data (group_id, data, updated_at)
  VALUES (p_group_id, '{"v":1,"messages":[],"meta":{}}'::jsonb, now())
  ON CONFLICT (group_id) DO NOTHING;
  UPDATE group_chat_data
  SET data = jsonb_set(data, '{messages}', COALESCE(data->'messages', '[]'::jsonb) || jsonb_build_array(p_message)),
      updated_at = now()
  WHERE group_id = p_group_id;
END;
$$ LANGUAGE plpgsql;

-- Fast read: use normalized table with indexed LIMIT (target < 500ms, max 2000ms).
CREATE OR REPLACE FUNCTION get_group_thread_messages(
  p_group_id UUID,
  p_user_id UUID,
  p_limit INT DEFAULT 100
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_messages jsonb;
  v_deleted_ids text[] := '{}';
  v_view_once_consumed text[] := '{}';
  v_user_data jsonb;
  v_since timestamptz := now() - interval '30 days';
BEGIN
  -- Indexed read: last p_limit messages, 30-day filter
  SELECT jsonb_agg(sub.message ORDER BY sub.created_at ASC)
  INTO v_messages
  FROM (
    SELECT message, created_at
    FROM group_messages
    WHERE group_id = p_group_id
      AND created_at >= v_since
    ORDER BY created_at DESC
    LIMIT p_limit
  ) sub;

  v_messages := COALESCE(v_messages, '[]'::jsonb);

  -- User meta
  SELECT data->'whispers' INTO v_user_data
  FROM user_chat_data
  WHERE user_id = p_user_id;

  IF v_user_data IS NOT NULL AND v_user_data ? 'deleted_ids' THEN
    SELECT array_agg(x::text) INTO v_deleted_ids
    FROM jsonb_array_elements_text(v_user_data->'deleted_ids') AS x;
  END IF;
  IF v_user_data IS NOT NULL AND v_user_data ? 'view_once_consumed' THEN
    SELECT array_agg(x::text) INTO v_view_once_consumed
    FROM jsonb_array_elements_text(v_user_data->'view_once_consumed') AS x;
  END IF;

  RETURN jsonb_build_object(
    'messages', v_messages,
    'deleted_ids', to_jsonb(COALESCE(v_deleted_ids, '{}')),
    'view_once_consumed', to_jsonb(COALESCE(v_view_once_consumed, '{}'))
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_group_thread_messages(uuid, uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_group_thread_messages(uuid, uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_thread_messages(uuid, uuid, integer) TO anon;