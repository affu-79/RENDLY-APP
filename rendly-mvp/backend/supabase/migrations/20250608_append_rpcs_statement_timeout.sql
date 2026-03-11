-- Allow append RPCs to run up to 60s so large JSONB blobs (e.g. long whisper history) don't hit default statement_timeout (57014).

CREATE OR REPLACE FUNCTION append_user_whisper_message(p_message JSONB, p_user_id UUID)
RETURNS void AS $$
BEGIN
  SET LOCAL statement_timeout = '60s';
  INSERT INTO user_chat_data (user_id, data, updated_at)
  VALUES (p_user_id, '{"v":1,"whispers":{"messages":[],"call_logs":[],"deleted_ids":[],"view_once_consumed":[]},"group":{"messages":[]},"meta":{}}'::jsonb, now())
  ON CONFLICT (user_id) DO NOTHING;
  UPDATE user_chat_data
  SET data = jsonb_set(data, '{whispers,messages}', COALESCE(data->'whispers'->'messages', '[]'::jsonb) || jsonb_build_array(p_message)),
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION append_user_call_log(p_log JSONB, p_user_id UUID)
RETURNS void AS $$
BEGIN
  SET LOCAL statement_timeout = '60s';
  INSERT INTO user_chat_data (user_id, data, updated_at)
  VALUES (p_user_id, '{"v":1,"whispers":{"messages":[],"call_logs":[],"deleted_ids":[],"view_once_consumed":[]},"group":{"messages":[]},"meta":{}}'::jsonb, now())
  ON CONFLICT (user_id) DO NOTHING;
  UPDATE user_chat_data
  SET data = jsonb_set(data, '{whispers,call_logs}', COALESCE(data->'whispers'->'call_logs', '[]'::jsonb) || jsonb_build_array(p_log)),
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION append_group_message(p_message JSONB, p_group_id UUID)
RETURNS void AS $$
BEGIN
  SET LOCAL statement_timeout = '60s';
  INSERT INTO group_chat_data (group_id, data, updated_at)
  VALUES (p_group_id, '{"v":1,"messages":[],"meta":{}}'::jsonb, now())
  ON CONFLICT (group_id) DO NOTHING;
  UPDATE group_chat_data
  SET data = jsonb_set(data, '{messages}', COALESCE(data->'messages', '[]'::jsonb) || jsonb_build_array(p_message)),
      updated_at = now()
  WHERE group_id = p_group_id;
END;
$$ LANGUAGE plpgsql;
