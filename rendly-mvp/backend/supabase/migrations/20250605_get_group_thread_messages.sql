-- Fast group thread: filter and limit in DB (no full blob transfer). Target < 500ms typical, max 2000ms.
-- Returns JSONB: { "messages": [...], "deleted_ids": [...], "view_once_consumed": [...] }.

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
  v_messages jsonb := '[]'::jsonb;
  v_deleted_ids text[] := '{}';
  v_view_once_consumed text[] := '{}';
  v_since timestamptz := now() - interval '30 days';
  v_group_data jsonb;
  v_user_data jsonb;
  v_filtered jsonb;
BEGIN
  -- Single row read: group messages only
  SELECT data->'messages' INTO v_group_data
  FROM group_chat_data
  WHERE group_id = p_group_id;

  v_group_data := COALESCE(v_group_data, '[]'::jsonb);

  -- Only process the last p_limit elements by array position (reduces work when array is large).
  SELECT jsonb_agg(sub.elem ORDER BY sub.ts)
  INTO v_filtered
  FROM (
    SELECT t.elem AS elem,
           COALESCE((t.elem->>'created_at')::timestamptz, ((t.elem->>'date') || ' ' || COALESCE(t.elem->>'time', '00:00'))::timestamptz) AS ts
    FROM jsonb_array_elements(v_group_data) WITH ORDINALITY AS t(elem, ord)
    WHERE t.ord > GREATEST(0, jsonb_array_length(v_group_data) - p_limit)
      AND ( (t.elem->>'created_at')::timestamptz >= v_since OR t.elem->>'created_at' IS NULL )
  ) sub;

  v_messages := COALESCE(v_filtered, '[]'::jsonb);

  -- User meta: single row read, only the keys we need
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

-- Ensure PostgREST/API can call the function (service_role key used by chat-service).
GRANT EXECUTE ON FUNCTION public.get_group_thread_messages(uuid, uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_group_thread_messages(uuid, uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_thread_messages(uuid, uuid, integer) TO anon;
