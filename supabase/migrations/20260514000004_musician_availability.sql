CREATE TABLE IF NOT EXISTS musician_availability (
  id TEXT PRIMARY KEY,
  musician_profile_id TEXT NOT NULL REFERENCES musician_profile(id) ON DELETE CASCADE,
  available_from_date DATE NOT NULL,
  available_to_date DATE NOT NULL,
  min_booking_days_advance INTEGER DEFAULT 14,
  status TEXT DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
