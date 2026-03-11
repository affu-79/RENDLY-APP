-- Ensure get_group_thread_messages uses public schema and is clearly the fast (group_messages table) version.
-- Apply this after 20250606. Then run: NOTIFY pgrst, 'reload schema';

CREATE OR REPLACE FUNCTION public.get_group_thread_messages(
  p_group_id UUID,
  p_user_id UUID,
  p_limit INT DEFAULT 100
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_messages jsonb;
  v_deleted_ids text[] := '{}';
  v_view_once_consumed text[] := '{}';
  v_user_data jsonb;
  v_since timestamptz := now() - interval '30 days';
BEGIN
  -- Indexed read from group_messages (fast)
  SELECT jsonb_agg(sub.message ORDER BY sub.created_at ASC)
  INTO v_messages
  FROM (
    SELECT message, created_at
    FROM public.group_messages
    WHERE group_id = p_group_id
      AND created_at >= v_since
    ORDER BY created_at DESC
    LIMIT p_limit
  ) sub;

  v_messages := COALESCE(v_messages, '[]'::jsonb);

  SELECT data->'whispers' INTO v_user_data
  FROM public.user_chat_data
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
