CREATE TABLE IF NOT EXISTS gig_application_questions (
  id TEXT PRIMARY KEY,
  gig_id TEXT NOT NULL REFERENCES gig(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'text',
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
