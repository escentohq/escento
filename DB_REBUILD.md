# DB Rebuild — Escento Schema Reset

## Problem

- Fresh signup → `/onboarding/role` → immediate redirect to `/` (should stay on role picker)
- Root cause: Production DB has trigger or DEFAULT on `user.role` auto-setting it on INSERT
- No migrations in repo (deleted `supabase/` dir), schema unknown
- Need clean rebuild with cascade deletes

## Solution

Drop all tables + recreate with clean schema. No role DEFAULT. All FKs CASCADE DELETE.

## Steps

1. Go to Supabase dashboard → Escento project → SQL editor
2. Run the SQL below (entire block as one query)
3. Verify: Check `user` table exists, `role` column has no DEFAULT
4. Restart Claude Code session → run `npm run dev`
5. Test signup flow: fresh account → should land on `/onboarding/role` (NOT redirect)
6. Test role pick: MUSICIAN → `/profile/create`; CREATOR → `/gigs/manage`

## SQL to Run

```sql
-- Drop all (reverse dependency order)
DROP TABLE IF EXISTS gig_genre CASCADE;
DROP TABLE IF EXISTS gig_instrument CASCADE;
DROP TABLE IF EXISTS gig CASCADE;
DROP TABLE IF EXISTS musician_genre CASCADE;
DROP TABLE IF EXISTS musician_instrument CASCADE;
DROP TABLE IF EXISTS musician_profile CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS genre CASCADE;
DROP TABLE IF EXISTS instrument CASCADE;

-- 1. instrument
CREATE TABLE instrument (
  id    TEXT PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE
);

-- 2. genre
CREATE TABLE genre (
  id    TEXT PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE
);

-- 3. user (NO DEFAULT on role — must be null on fresh insert)
CREATE TABLE "user" (
  id               TEXT PRIMARY KEY,
  email            TEXT NOT NULL UNIQUE,
  name             TEXT,
  image            TEXT,
  supabase_user_id TEXT UNIQUE,
  role             TEXT CHECK (role IN ('MUSICIAN', 'CREATOR'))
);

-- 4. musician_profile
CREATE TABLE musician_profile (
  id                TEXT PRIMARY KEY,
  user_id           TEXT NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  display_name      TEXT,
  bio               TEXT,
  school            TEXT,
  location          TEXT,
  is_remote         BOOLEAN NOT NULL DEFAULT false,
  seeking_paid      BOOLEAN NOT NULL DEFAULT false,
  seeking_unpaid    BOOLEAN NOT NULL DEFAULT false,
  years_experience  INTEGER,
  availability_text TEXT,
  contact_email     TEXT,
  instagram_url     TEXT,
  youtube_url       TEXT,
  spotify_url       TEXT,
  soundcloud_url    TEXT,
  website_url       TEXT,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. musician_instrument
CREATE TABLE musician_instrument (
  id                   TEXT PRIMARY KEY,
  musician_profile_id  TEXT NOT NULL REFERENCES musician_profile(id) ON DELETE CASCADE,
  instrument_id        TEXT NOT NULL REFERENCES instrument(id) ON DELETE CASCADE,
  UNIQUE (musician_profile_id, instrument_id)
);

-- 6. musician_genre
CREATE TABLE musician_genre (
  id                   TEXT PRIMARY KEY,
  musician_profile_id  TEXT NOT NULL REFERENCES musician_profile(id) ON DELETE CASCADE,
  genre_id             TEXT NOT NULL REFERENCES genre(id) ON DELETE CASCADE,
  UNIQUE (musician_profile_id, genre_id)
);

-- 7. gig
CREATE TABLE gig (
  id                   TEXT PRIMARY KEY,
  creator_id           TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title                TEXT NOT NULL,
  description          TEXT,
  project_type         TEXT,
  location             TEXT,
  is_remote            BOOLEAN NOT NULL DEFAULT false,
  compensation_type    TEXT,
  compensation_details TEXT,
  deadline             TEXT,
  status               TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. gig_instrument
CREATE TABLE gig_instrument (
  id            TEXT PRIMARY KEY,
  gig_id        TEXT NOT NULL REFERENCES gig(id) ON DELETE CASCADE,
  instrument_id TEXT NOT NULL REFERENCES instrument(id) ON DELETE CASCADE,
  UNIQUE (gig_id, instrument_id)
);

-- 9. gig_genre
CREATE TABLE gig_genre (
  id       TEXT PRIMARY KEY,
  gig_id   TEXT NOT NULL REFERENCES gig(id) ON DELETE CASCADE,
  genre_id TEXT NOT NULL REFERENCES genre(id) ON DELETE CASCADE,
  UNIQUE (gig_id, genre_id)
);
```

## Schema Map

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `user` | Auth + app users | id, email, role (null until onboarding) |
| `musician_profile` | Musician public profile | user_id (unique FK), bio, location, urls |
| `musician_instrument` | Many-to-many | musician_profile_id → instrument_id |
| `musician_genre` | Many-to-many | musician_profile_id → genre_id |
| `gig` | Creator-posted gigs | creator_id (FK), title, status (OPEN/CLOSED) |
| `gig_instrument` | Many-to-many | gig_id → instrument_id |
| `gig_genre` | Many-to-many | gig_id → genre_id |
| `instrument` | Tag library | id, name (unique) |
| `genre` | Tag library | id, name (unique) |

## Code Verification

No app code changes needed. Service layer + auth guards already correct:
- `src/lib/api/users.ts` — `createUser` never sets role ✓
- `src/lib/auth/sync-app-user.ts` — syncs with no role set ✓
- `src/lib/auth-guards.ts` — `requireUser` redirects to `/onboarding/role` if role null ✓
- `src/app/onboarding/role/page.tsx` — guard: if role already set, redirect to `/` ✓

## After New Session

```bash
npm run dev       # Start dev server
npm run lint      # Verify lint passes
npm run build     # Verify build passes
```

Test: signup → `/onboarding/role` stays (no redirect). Pick role → correct landing page.
