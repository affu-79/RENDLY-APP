-- Fast whisper thread: merge and filter in DB, return only messages + meta (no full blob transfer).
-- Returns JSONB: { "messages": [...], "deleted_ids": [...], "view_once_consumed": [...] }.

CREATE OR REPLACE FUNCTION get_whisper_thread_messages(
  p_user_id UUID,
  p_other_user_id UUID,
  p_limit INT DEFAULT 100
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_row_a user_chat_data%ROWTYPE;
  v_row_b user_chat_data%ROWTYPE;
  v_messages jsonb := '[]'::jsonb;
  v_deleted_ids text[] := '{}';
  v_view_once_consumed text[] := '{}';
  v_since timestamptz := now() - interval '30 days';
  v_from_a jsonb;
  v_from_b jsonb;
  v_combined jsonb;
  v_limited jsonb;
BEGIN
  -- Allow up to 30s for large threads (default statement_timeout can be 8s and JSONB work can be slow).
  SET LOCAL statement_timeout = '30s';

  SELECT * INTO v_row_a FROM user_chat_data WHERE user_id = p_user_id;
  SELECT * INTO v_row_b FROM user_chat_data WHERE user_id = p_other_user_id;

  -- From A: messages where sent_to_id = p_other_user_id, within 30 days
  SELECT COALESCE(
    jsonb_agg(elem ORDER BY COALESCE((elem->>'created_at')::timestamptz, ((elem->>'date') || ' ' || COALESCE(elem->>'time', '00:00'))::timestamptz)),
    '[]'::jsonb
  ) INTO v_from_a
  FROM jsonb_array_elements(COALESCE(v_row_a.data->'whispers'->'messages', '[]'::jsonb)) AS elem
  WHERE (elem->>'sent_to_id') = p_other_user_id::text
    AND ( (elem->>'created_at')::timestamptz >= v_since OR elem->>'created_at' IS NULL );

  -- From B: messages where sent_to_id = p_user_id, within 30 days
  SELECT COALESCE(
    jsonb_agg(elem ORDER BY COALESCE((elem->>'created_at')::timestamptz, ((elem->>'date') || ' ' || COALESCE(elem->>'time', '00:00'))::timestamptz)),
    '[]'::jsonb
  ) INTO v_from_b
  FROM jsonb_array_elements(COALESCE(v_row_b.data->'whispers'->'messages', '[]'::jsonb)) AS elem
  WHERE (elem->>'sent_to_id') = p_user_id::text
    AND ( (elem->>'created_at')::timestamptz >= v_since OR elem->>'created_at' IS NULL );

  -- Combine, sort by time, take last p_limit
  v_combined := v_from_a || v_from_b;
  SELECT jsonb_agg(ordered.elem ORDER BY ordered.ts)
  INTO v_limited
  FROM (
    SELECT elem,
           COALESCE((elem->>'created_at')::timestamptz, ((elem->>'date') || ' ' || COALESCE(elem->>'time', '00:00'))::timestamptz) AS ts
    FROM jsonb_array_elements(v_combined) AS elem
    ORDER BY COALESCE((elem->>'created_at')::timestamptz, ((elem->>'date') || ' ' || COALESCE(elem->>'time', '00:00'))::timestamptz) DESC
    LIMIT p_limit
  ) ordered;

  -- Re-order ASC for client (v_limited is last N messages DESC; re-aggregate ASC)
  v_limited := COALESCE(v_limited, '[]'::jsonb);
  SELECT jsonb_agg(elem ORDER BY COALESCE((elem->>'created_at')::timestamptz, ((elem->>'date') || ' ' || COALESCE(elem->>'time', '00:00'))::timestamptz))
  INTO v_messages
  FROM jsonb_array_elements(v_limited) AS elem;

  v_messages := COALESCE(v_messages, '[]'::jsonb);

  -- Meta from current user's row
  IF v_row_a.data IS NOT NULL AND v_row_a.data->'whispers' ? 'deleted_ids' THEN
    SELECT array_agg(x::text) INTO v_deleted_ids
    FROM jsonb_array_elements_text(v_row_a.data->'whispers'->'deleted_ids') AS x;
  END IF;
  IF v_row_a.data IS NOT NULL AND v_row_a.data->'whispers' ? 'view_once_consumed' THEN
    SELECT array_agg(x::text) INTO v_view_once_consumed
    FROM jsonb_array_elements_text(v_row_a.data->'whispers'->'view_once_consumed') AS x;
  END IF;

  RETURN jsonb_build_object(
    'messages', COALESCE(v_messages, '[]'::jsonb),
    'deleted_ids', to_jsonb(COALESCE(v_deleted_ids, '{}')),
    'view_once_consumed', to_jsonb(COALESCE(v_view_once_consumed, '{}'))
  );
END;
$$;
