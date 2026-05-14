ALTER TABLE musician_profile
  ADD COLUMN IF NOT EXISTS resume_pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS video_portfolio_url TEXT,
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS willing_to_travel BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS travel_radius_miles INTEGER,
  ADD COLUMN IF NOT EXISTS tour_start_date DATE,
  ADD COLUMN IF NOT EXISTS tour_end_date DATE,
  ADD COLUMN IF NOT EXISTS min_notice_days INTEGER DEFAULT 14,
  ADD COLUMN IF NOT EXISTS is_searchable BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_event_invitations BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS newsletter_opt_in BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;
