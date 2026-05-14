ALTER TABLE gig
  ADD COLUMN IF NOT EXISTS creator_name TEXT,
  ADD COLUMN IF NOT EXISTS creator_phone TEXT,
  ADD COLUMN IF NOT EXISTS creator_bio TEXT,
  ADD COLUMN IF NOT EXISTS creator_contact_method TEXT,
  ADD COLUMN IF NOT EXISTS creator_contact_link TEXT,
  ADD COLUMN IF NOT EXISTS experience_level TEXT,
  ADD COLUMN IF NOT EXISTS ensemble_size TEXT,
  ADD COLUMN IF NOT EXISTS equipment_requirements TEXT,
  ADD COLUMN IF NOT EXISTS location_type TEXT,
  ADD COLUMN IF NOT EXISTS location_detail TEXT,
  ADD COLUMN IF NOT EXISTS other_requirements TEXT,
  ADD COLUMN IF NOT EXISTS notification_frequency TEXT DEFAULT 'immediate';
