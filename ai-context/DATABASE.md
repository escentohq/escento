# DATABASE.md — Motivo Backend

Centralized API service layer for all database operations. No direct Supabase calls in page files or server actions.

---

## Architecture

```
src/lib/api/
├── types.ts      ← shared TypeScript interfaces
├── gigs.ts       ← gig CRUD + queries
├── profiles.ts   ← musician profile CRUD + queries
├── tags.ts       ← instrument + genre CRUD
├── messaging.ts  ← connection requests, conversations, messages, unread, blocks
```

**Data flow:** Page/Action → API function → Supabase → response (snake_case raw) → transform to camelCase → return typed object.

`app_user` metadata is currently read by `src/lib/auth-guards.ts` and updated by onboarding/account actions directly. There is no `src/lib/api/users.ts` in the current codebase.

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
  id: string;                  // TEXT, matches auth.users.id
  email: string;               // from auth.users
  name: string | null;
  image: string | null;
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
  image: string | null;      // joined from app_user.image
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
- Includes nested: instruments, genres, and joined `app_user.image`

**`getProfileByUserId(userId: string): Promise<MusicianProfile | null>`**
- Fetch profile for a user
- Used in `/profile/create` and `/profile/edit` to check if profile exists

**`listProfiles(filters?: { instrument?: string; genre?: string }): Promise<MusicianProfile[]>`**
- Fetch all profiles
- DB-level filtering by instrument/genre joins
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

## App User Metadata

The current codebase does not have a `users.ts` service module. `app_user` is used as the app metadata table:

- `app_user.id` matches `auth.users.id`
- `app_user.role` drives role guards
- `app_user.name` drives account/nav display
- `app_user.image` stores the public Supabase Storage URL for account avatars

Current write locations:

- `src/app/onboarding/role/actions.ts` updates `app_user.role`
- `src/app/account/actions.ts` updates `app_user.name` and `app_user.image`
- `src/app/account/actions.ts` deletes `app_user` during hard account deletion

Profile pictures are stored in Supabase Storage bucket `profile-pictures`, uploaded by `updateProfilePictureAction()` with the server-only service-role client.

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

## Messaging API (`src/lib/api/messaging.ts`)

Messaging is a backend foundation only for now. No full inbox/thread UI has shipped yet.

### Tables

- `conversation_requests` — requester, recipient, intro text, status lifecycle (`pending`, `accepted`, `rejected`, `cancelled`)
- `conversations` — conversation shell with `type = "direct"` today and `source_request_id`
- `conversation_participants` — per-user membership, `last_read_at`, and per-user soft delete via `deleted_at`
- `messages` — trimmed text messages with soft delete via `deleted_at`
- `user_blocks` — directional blocks; either direction prevents new requests and messages

### Read/write functions

- `createConnectionRequest(requesterId, recipientId, introMessage?)`
- `listIncomingConnectionRequests(userId)`
- `listOutgoingConnectionRequests(userId)`
- `acceptConnectionRequestForUser(userId, requestId)`
- `rejectConnectionRequestForUser(userId, requestId)`
- `cancelConnectionRequestForUser(userId, requestId)`
- `listConversationsForUser(userId)`
- `getConversationForUser(userId, conversationId)`
- `createMessageForUser(userId, conversationId, body)`
- `markConversationReadForUser(userId, conversationId)`
- `deleteConversationForUser(userId, conversationId)`
- `blockUserForUser(userId, blockedUserId)`
- `unblockUserForUser(userId, blockedUserId)`
- `listBlockedUsersForUser(userId)`
- `getUnreadMessageCountForUser(userId)`
- `getUnreadConversationSummariesForUser(userId)`

### Security model

Server actions in `src/app/messages/actions.ts` derive the actor from `requireUser()` and pass that user id into the service layer. The migration also enables RLS on messaging tables, using participant/request/block ownership checks plus triggers for invariants that RLS cannot express cleanly.

Unread counts are computed from `conversation_participants.last_read_at`: messages count as unread when they are in the conversation, not deleted, sent by someone else, and newer than the current participant's `last_read_at`.

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
