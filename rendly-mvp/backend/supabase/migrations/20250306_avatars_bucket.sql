-- Avatars storage bucket for profile photos (public read; upload/update/delete via service role).
-- Path pattern: {userId}/avatar.jpg (or .webp) — one object per user, upsert overwrites.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  gen_random_uuid(),
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (name) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Allow public read for objects in the avatars bucket (anyone with URL can view).
-- Upload/update/delete: backend uses service_role key, which bypasses RLS.
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'avatars'));
