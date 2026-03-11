-- User settings (permission toggles). One row per user.
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  camera_allowed BOOLEAN NOT NULL DEFAULT true,
  microphone_allowed BOOLEAN NOT NULL DEFAULT true,
  notifications_allowed BOOLEAN NOT NULL DEFAULT true,
  location_allowed BOOLEAN NOT NULL DEFAULT false,
  popups_redirects_allowed BOOLEAN NOT NULL DEFAULT false,
  sound_allowed BOOLEAN NOT NULL DEFAULT true,
  auto_verify BOOLEAN NOT NULL DEFAULT false,
  on_device_site_data BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reports (harassment, fraud, other). Reporter is the logged-in user.
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('harassment', 'fraud', 'spam', 'other')),
  description TEXT,
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS reports_created_at ON reports(created_at);

-- Contact form submissions (contact us).
CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_requests_created_at ON contact_requests(created_at);
