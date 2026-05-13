# DATABASE.md — Motivo Backend

Centralized API service layer for all database operations. No direct Supabase calls in page files or server actions.

---

## Architecture

```
src/lib/api/
├── types.ts      ← shared TypeScript interfaces
├── gigs.ts       ← gig CRUD + queries
├── profiles.ts   ← musician profile CRUD + queries
├── users.ts      ← user CRUD + queries
├── tags.ts       ← instrument + genre CRUD
```

**Data flow:** Page/Action → API function → Supabase → response (snake_case raw) → transform to camelCase → return typed object.

---

## Types (`src/lib/api/types.ts`)

Shared TypeScript interfaces. All API functions return these types.

### `Tag`
```ts
export interface Tag {
  id: string;
  name: string;
}
```

### `AppUser`
```ts
export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  supabaseUserId: string | null;
  role: "MUSICIAN" | "CREATOR" | null;
}
```

### `Gig`
```ts
export interface Gig {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  projectType: string;
  location: string | null;
  isRemote: boolean;
  compensationType: string;
  compensationDetails: string | null;
  deadline: string | null;  // ISO date YYYY-MM-DD
  status: string;           // "OPEN" | "CLOSED"
  createdAt: string;
  updatedAt: string;
  instruments?: string[];   // flattened tag names
  genres?: string[];        // flattened tag names
  creator?: { name: string | null; email: string };
}
```

Input types:
```ts
export interface CreateGigInput {
  creatorId: string;
  title: string;
  description: string;
  projectType: string;
  location: string | null;
  isRemote: boolean;
  compensationType: string;
  compensationDetails: string | null;
  deadline: Date | string | null;  // accepts both
}

export interface UpdateGigInput {
  title?: string;
  description?: string;
  projectType?: string;
  location?: string | null;
  isRemote?: boolean;
  compensationType?: string;
  compensationDetails?: string | null;
  deadline?: Date | string | null;
}
```

### `MusicianProfile`
```ts
export interface MusicianProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  school: string | null;
  location: string | null;
  isRemote: boolean;
  seekingPaid: boolean;
  seekingUnpaid: boolean;
  yearsExperience: number | null;
  availabilityText: string | null;
  contactEmail: string;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  spotifyUrl: string | null;
  soundcloudUrl: string | null;
  websiteUrl: string | null;
  updatedAt: string;
  instruments?: string[];
  genres?: string[];
}
```

Input types:
```ts
export interface CreateProfileInput { /* same fields as MusicianProfile, no id/userId */ }
export interface UpdateProfileInput { /* all fields optional */ }
```

---

## Gigs API (`src/lib/api/gigs.ts`)

Handles all gig CRUD + queries. DB-level filtering for `projectType`; client-side filtering for `instrument`/`genre`.

### Read functions

**`getGig(id: string): Promise<Gig | null>`**
- Fetch single gig by ID
- Includes nested: instruments, genres, creator (user name + email)
- Returns `null` if not found

**`listOpenGigs(filters?: { projectType?: string; instrument?: string; genre?: string }): Promise<Gig[]>`**
- Fetch all gigs with `status = "OPEN"`
- DB-level filter: `projectType`
- Client-side filter: `instrument`, `genre` (after flattening junction rows)
- Ordered by `created_at DESC`
- Capped at 50 results

**`listGigsByCreator(creatorId: string): Promise<Gig[]>`**
- Fetch all gigs (any status) for a creator
- Ordered by `updated_at DESC`
- Used in `/gigs/manage`

### Write functions

**`createGig(input: CreateGigInput, instrumentNames: string[], genreNames: string[]): Promise<Gig>`**
- Insert gig + junction rows
- Auto-ensures instruments/genres exist via `ensureInstruments()`/`ensureGenres()`
- Normalizes deadline to ISO date string
- Returns full Gig object

**`updateGig(id: string, input: UpdateGigInput, instrumentNames?: string[], genreNames?: string[]): Promise<Gig>`**
- Update gig fields
- If `instrumentNames` or `genreNames` provided: delete old junctions, insert new
- Returns full updated Gig object

**`closeGig(id: string): Promise<void>`**
- Set `status = "CLOSED"` (gig is marked filled)

**`deleteGig(id: string): Promise<void>`**
- Hard delete gig + junctions

---

## Profiles API (`src/lib/api/profiles.ts`)

Handles musician profile CRUD + queries.

### Read functions

**`getProfile(id: string): Promise<MusicianProfile | null>`**
- Fetch single profile by ID
- Includes nested: instruments, genres

**`getProfileByUserId(userId: string): Promise<MusicianProfile | null>`**
- Fetch profile for a user
- Used in `/profile/create` and `/profile/edit` to check if profile exists

**`listProfiles(filters?: { instrument?: string; genre?: string }): Promise<MusicianProfile[]>`**
- Fetch all profiles
- Client-side filtering by instrument/genre
- Ordered by `updated_at DESC`
- Capped at 50 results

### Write functions

**`createProfile(userId: string, input: CreateProfileInput, instrumentNames: string[], genreNames: string[]): Promise<MusicianProfile>`**
- Insert profile + junctions
- Auto-ensures instruments/genres exist

**`updateProfile(id: string, input: UpdateProfileInput, instrumentNames?: string[], genreNames?: string[]): Promise<MusicianProfile>`**
- Update profile fields
- If `instrumentNames` or `genreNames` provided: delete old junctions, insert new

---

## Users API (`src/lib/api/users.ts`)

Handles user CRUD. Used by `src/lib/auth/sync-app-user.ts` to sync auth state → DB.

### Read functions

**`getUserBySupabaseId(supabaseId: string): Promise<AppUser | null>`**
- Lookup user by Supabase UUID

**`getUserByEmail(email: string): Promise<AppUser | null>`**
- Lookup user by email

**`getUserById(id: string): Promise<AppUser | null>`**
- Lookup user by app user ID

### Write functions

**`createUser(input: CreateUserInput): Promise<AppUser>`**
- Insert user from auth provider
- Called during signup flow

**`updateUser(id: string, input: UpdateUserInput): Promise<AppUser>`**
- Update user fields (name, image, role, etc.)
- Called during role selection onboarding

---

## Tags API (`src/lib/api/tags.ts`)

Manages instruments and genres using atomic upsert. Replaces old `tag-utils.ts` (SELECT-then-INSERT pattern → race condition).

### Functions

**`ensureInstruments(names: string[]): Promise<Tag[]>`**
- Upsert instruments by name
- Uses Supabase `.upsert()` with `onConflict: "name"` (atomic, no race condition)
- Normalizes names via `form-utils.normalizeTagName()`
- Returns Tag objects with IDs

**`ensureGenres(names: string[]): Promise<Tag[]>`**
- Same pattern as `ensureInstruments()`

**`listInstruments(): Promise<Tag[]>`**
- Fetch all instruments, ordered by name

**`listGenres(): Promise<Tag[]>`**
- Fetch all genres, ordered by name

---

## Data Transformation Pattern

Each API module has a private `toX()` function that converts raw Supabase rows (snake_case) → typed camelCase objects:

```ts
// Example: gigs.ts
function toGig(raw: any): Gig {
  return {
    id: raw.id,
    creatorId: raw.creator_id,
    title: raw.title,
    // ... all fields explicitly mapped
    instruments: raw.gig_instrument?.map((x: any) => x.instrument?.name).filter(Boolean) ?? [],
    genres: raw.gig_genre?.map((x: any) => x.genre?.name).filter(Boolean) ?? [],
  };
}
```

**Why explicit mapping?**
- No generic snake_case converter (removed `case-conversion.ts`)
- Every field visible in code
- Type-safe: TypeScript catches missing/misnamed fields
- Junction flattening: `gig_instrument` rows → `string[]` of names

---

## Usage example

**Old pattern (scattered Supabase calls):**
```ts
// src/app/gigs/page.tsx
const { data } = await supabase
  .from("gig")
  .select("*, gig_instrument(*, instrument(*)), ...")
  .eq("status", "OPEN");
const gigs = data?.map(raw => ({
  id: raw.id,
  creatorId: raw.creator_id,
  // ... manual conversion
})) ?? [];
```

**New pattern (API layer):**
```ts
// src/app/gigs/page.tsx
import { listOpenGigs } from "@/lib/api/gigs";

const gigs = await listOpenGigs({ projectType: "FILM" });
// gigs is typed as Gig[], ready to use
```

---

## Error handling

API functions **throw on DB errors** (auth failures, constraint violations). Pages/actions **must catch** and handle.

```ts
try {
  const gig = await getGig(id);
} catch (err) {
  // Log, show user error, etc.
}
```

Supabase "not found" (code `PGRST116`) returns `null`, not thrown.

---

## Future extensions

Service layer scales cleanly:
- Add filtering complexity (date range, compensation type) → implement in `listOpenGigs()` / `listProfiles()` once
- Add new entity type → create `newEntity.ts` with same pattern
- Migrate from Supabase REST → RPC / Postgres functions → no page/action code changes, only `api/` internals
