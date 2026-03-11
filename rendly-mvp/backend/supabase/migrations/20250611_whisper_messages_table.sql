-- Normalized whisper_messages table for fast 1:1 thread retrieval (indexed LIMIT instead of full JSONB read).
-- get_whisper_thread_messages_fast reads from here; append_user_whisper_message writes to both user_chat_data and here.

CREATE TABLE IF NOT EXISTS whisper_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL,
  user_b UUID NOT NULL,
  message JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT whisper_messages_user_order CHECK (user_a < user_b)
);

CREATE INDEX IF NOT EXISTS whisper_messages_thread_created ON whisper_messages (user_a, user_b, created_at DESC);

GRANT SELECT ON whisper_messages TO service_role;
GRANT SELECT ON whisper_messages TO authenticated;
GRANT SELECT ON whisper_messages TO anon;

-- Backfill: from each user's user_chat_data, extract messages with sent_by_id/sent_to_id; canonical user_a/user_b; dedupe by id on conflict.
INSERT INTO whisper_messages (id, user_a, user_b, message, created_at)
SELECT
  COALESCE((elem->>'id')::uuid, gen_random_uuid()),
  LEAST((elem->>'sent_by_id')::uuid, (elem->>'sent_to_id')::uuid),
  GREATEST((elem->>'sent_by_id')::uuid, (elem->>'sent_to_id')::uuid),
  elem,
  COALESCE(
    (elem->>'created_at')::timestamptz,
    ((elem->>'date') || ' ' || COALESCE(elem->>'time', '00:00'))::timestamptz,
    now()
  )
FROM user_chat_data u,
     jsonb_array_elements(COALESCE(u.data->'whispers'->'messages', '[]'::jsonb)) AS elem
WHERE (elem->>'sent_to_id') IS NOT NULL
  AND (elem->>'sent_by_id') IS NOT NULL
  AND (elem->>'sent_to_id')::uuid != (elem->>'sent_by_id')::uuid
ON CONFLICT (id) DO NOTHING;

-- Dual-write: append_user_whisper_message also inserts into whisper_messages.
CREATE OR REPLACE FUNCTION append_user_whisper_message(p_message JSONB, p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_sent_by uuid;
  v_sent_to uuid;
  v_user_a uuid;
  v_user_b uuid;
  v_created_at timestamptz;
  v_id uuid;
BEGIN
  SET LOCAL statement_timeout = '120s';
  v_sent_by := COALESCE((p_message->>'sent_by_id')::uuid, p_user_id);
  v_sent_to := (p_message->>'sent_to_id')::uuid;
  IF v_sent_to IS NOT NULL AND v_sent_by != v_sent_to THEN
    v_user_a := LEAST(v_sent_by, v_sent_to);
    v_user_b := GREATEST(v_sent_by, v_sent_to);
    v_created_at := COALESCE(
      (p_message->>'created_at')::timestamptz,
      now()
    );
    v_id := COALESCE((p_message->>'id')::uuid, gen_random_uuid());
    INSERT INTO whisper_messages (id, user_a, user_b, message, created_at)
    VALUES (v_id, v_user_a, v_user_b, p_message, v_created_at)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  INSERT INTO user_chat_data (user_id, data, updated_at)
  VALUES (p_user_id, '{"v":1,"whispers":{"messages":[],"call_logs":[],"deleted_ids":[],"view_once_consumed":[]},"group":{"messages":[]},"meta":{}}'::jsonb, now())
  ON CONFLICT (user_id) DO NOTHING;
  UPDATE user_chat_data
  SET data = jsonb_set(data, '{whispers,messages}', COALESCE(data->'whispers'->'messages', '[]'::jsonb) || jsonb_build_array(p_message)),
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Fast read RPC: indexed read from whisper_messages, same return shape as get_whisper_thread_messages.
CREATE OR REPLACE FUNCTION get_whisper_thread_messages_fast(
  p_user_id UUID,
  p_other_user_id UUID,
  p_limit INT DEFAULT 100
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_user_a uuid;
  v_user_b uuid;
  v_messages jsonb;
  v_deleted_ids text[] := '{}';
  v_view_once_consumed text[] := '{}';
  v_user_data jsonb;
  v_since timestamptz := now() - interval '30 days';
BEGIN
  v_user_a := LEAST(p_user_id, p_other_user_id);
  v_user_b := GREATEST(p_user_id, p_other_user_id);

  SELECT jsonb_agg(sub.message ORDER BY sub.created_at ASC)
  INTO v_messages
  FROM (
    SELECT message, created_at
    FROM whisper_messages
    WHERE user_a = v_user_a AND user_b = v_user_b
      AND created_at >= v_since
    ORDER BY created_at DESC
    LIMIT p_limit
  ) sub;

  v_messages := COALESCE(v_messages, '[]'::jsonb);

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

GRANT EXECUTE ON FUNCTION public.get_whisper_thread_messages_fast(uuid, uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_whisper_thread_messages_fast(uuid, uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_whisper_thread_messages_fast(uuid, uuid, integer) TO anon;
