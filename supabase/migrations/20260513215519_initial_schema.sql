-- Create enums
CREATE TYPE user_role AS ENUM ('MUSICIAN', 'CREATOR');
CREATE TYPE compensation_type AS ENUM ('PAID', 'UNPAID', 'NEGOTIABLE');
CREATE TYPE project_type AS ENUM ('FILM', 'LIVE_EVENT', 'PODCAST', 'GAME', 'YOUTUBE', 'OTHER');

-- Create users table
CREATE TABLE "user" (
  id TEXT PRIMARY KEY,
  supabase_user_id TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role user_role,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create musician_profile table
CREATE TABLE "musician_profile" (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  school TEXT,
  location TEXT,
  is_remote BOOLEAN DEFAULT true,
  seeking_paid BOOLEAN DEFAULT true,
  seeking_unpaid BOOLEAN DEFAULT true,
  years_experience INTEGER,
  availability_text TEXT,
  contact_email TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  spotify_url TEXT,
  soundcloud_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- Create instrument table
CREATE TABLE "instrument" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

-- Create genre table
CREATE TABLE "genre" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

-- Create musician_instrument table
CREATE TABLE "musician_instrument" (
  id TEXT PRIMARY KEY,
  musician_profile_id TEXT NOT NULL,
  instrument_id TEXT NOT NULL,
  proficiency TEXT,
  FOREIGN KEY (musician_profile_id) REFERENCES "musician_profile"(id) ON DELETE CASCADE,
  FOREIGN KEY (instrument_id) REFERENCES "instrument"(id) ON DELETE CASCADE
);

-- Create musician_genre table
CREATE TABLE "musician_genre" (
  id TEXT PRIMARY KEY,
  musician_profile_id TEXT NOT NULL,
  genre_id TEXT NOT NULL,
  FOREIGN KEY (musician_profile_id) REFERENCES "musician_profile"(id) ON DELETE CASCADE,
  FOREIGN KEY (genre_id) REFERENCES "genre"(id) ON DELETE CASCADE
);

-- Create portfolio_item table
CREATE TABLE "portfolio_item" (
  id TEXT PRIMARY KEY,
  musician_profile_id TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  FOREIGN KEY (musician_profile_id) REFERENCES "musician_profile"(id) ON DELETE CASCADE
);

-- Create gig table
CREATE TABLE "gig" (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  project_type project_type NOT NULL,
  location TEXT,
  is_remote BOOLEAN DEFAULT true,
  compensation_type compensation_type NOT NULL,
  compensation_details TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'OPEN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (creator_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- Create gig_instrument table
CREATE TABLE "gig_instrument" (
  id TEXT PRIMARY KEY,
  gig_id TEXT NOT NULL,
  instrument_id TEXT NOT NULL,
  FOREIGN KEY (gig_id) REFERENCES "gig"(id) ON DELETE CASCADE,
  FOREIGN KEY (instrument_id) REFERENCES "instrument"(id) ON DELETE CASCADE
);

-- Create gig_genre table
CREATE TABLE "gig_genre" (
  id TEXT PRIMARY KEY,
  gig_id TEXT NOT NULL,
  genre_id TEXT NOT NULL,
  FOREIGN KEY (gig_id) REFERENCES "gig"(id) ON DELETE CASCADE,
  FOREIGN KEY (genre_id) REFERENCES "genre"(id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX idx_user_supabase_user_id ON "user"(supabase_user_id);
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_musician_profile_user_id ON "musician_profile"(user_id);
CREATE INDEX idx_musician_instrument_musician_profile_id ON "musician_instrument"(musician_profile_id);
CREATE INDEX idx_musician_instrument_instrument_id ON "musician_instrument"(instrument_id);
CREATE INDEX idx_musician_genre_musician_profile_id ON "musician_genre"(musician_profile_id);
CREATE INDEX idx_musician_genre_genre_id ON "musician_genre"(genre_id);
CREATE INDEX idx_gig_creator_id ON "gig"(creator_id);
CREATE INDEX idx_gig_instrument_gig_id ON "gig_instrument"(gig_id);
CREATE INDEX idx_gig_instrument_instrument_id ON "gig_instrument"(instrument_id);
CREATE INDEX idx_gig_genre_gig_id ON "gig_genre"(gig_id);
CREATE INDEX idx_gig_genre_genre_id ON "gig_genre"(genre_id);
