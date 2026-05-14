CREATE TABLE IF NOT EXISTS musician_equipment (
  id TEXT PRIMARY KEY,
  musician_profile_id TEXT NOT NULL REFERENCES musician_profile(id) ON DELETE CASCADE,
  equipment_name TEXT NOT NULL,
  equipment_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(musician_profile_id, equipment_name)
);
