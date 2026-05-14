CREATE TABLE IF NOT EXISTS musician_rates (
  id TEXT PRIMARY KEY,
  musician_profile_id TEXT NOT NULL REFERENCES musician_profile(id) ON DELETE CASCADE,
  rate_type TEXT NOT NULL,
  amount DECIMAL(10,2),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(musician_profile_id, rate_type)
);
