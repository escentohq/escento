# Onboarding Flows: Musician vs Creator

Current state of two onboarding paths triggered after user signup. Documents complete journeys: all components, form fields, validation, DB operations, and redirects.

---

## MUSICIAN ONBOARDING FLOW

### Stage 1: Role Selection (`/onboarding/role`)

**Route**: `src/app/onboarding/role/page.tsx`

**Entry Requirements**:
- User must be signed in (no `session?.user?.id` → redirect to `/signin?callbackUrl=/onboarding/role`)
- User must NOT have role set (`session.user.role` exists → redirect to `/`)

**Components**:
- `PageShell` (wrapper)
  - eyebrow: "Soundcheck"
  - title: "Choose your role"
  - body: "Pick the side you are using today. Escento keeps the tools focused around that choice."

**UI Elements**:
- Two card buttons in 2-column grid (responsive: full width on mobile, side-by-side on md+)
  - Left card: "I'm a Musician" (blue accent #0055FF)
    - Icon: `Music` from lucide-react
    - Description: "Build a profile, list your sound, and get found by creators."
    - CTA text: "Take the stage →"
  - Right card: "I'm a Creator" (pink accent #FF3366)
    - Icon: `Video` from lucide-react
    - Description: "Post a gig, name the brief, and find the right musician."
    - CTA text: "Run the set →"

**Form Submission**:
- Click "I'm a Musician" button → inline server action `setRole("MUSICIAN")`

**Server Action**: `setRole("MUSICIAN")` in `src/app/onboarding/role/actions.ts`
1. Calls `requireSignedIn("/onboarding/role")` (auth guard)
2. Updates `user` table: `role = "MUSICIAN"` via `updateUser(session.user.id, { role })`
3. Invalidates cache: `revalidatePath("/")`
4. Redirects to `/profile/create`

**DB Updates**:
- `user` table: `role` field set to `MUSICIAN`

---

### Stage 2: Profile Creation (`/profile/create`)

**Route**: `src/app/profile/create/page.tsx`

**Entry Requirements**:
- User must have MUSICIAN role (enforced by `requireRole("MUSICIAN", "/profile/create")`)
- User must NOT have existing profile (checked via `getProfileByUserId()` → if exists, redirect to `/profile/edit`)

**Components**:
- `PageShell` (wrapper)
  - eyebrow: "On stage"
  - title: "Create Profile"
  - body: "Put your sound where creators can find it. Keep it specific and make it easy to start a conversation."
- `ProfileForm` (client component, `src/app/profile/_profile-form.tsx`)
  - mode: "create"
  - initial values: `{ isRemote: true, seekingPaid: true, seekingUnpaid: true }`

**Form Fields** (in ProfileForm):

**Basic Info Section**:
- `displayName` (text input, required)
  - Validation: non-empty, max 80 characters
  - Placeholder: implied from label
  - Error: "Add the name creators should see." / "Keep the display name under 80 characters."

- `bio` (textarea, optional)
  - Validation: max 1,200 characters
  - Error: "Keep the bio under 1,200 characters."

- `contactEmail` (email input, required)
  - Validation: non-empty, valid email format
  - Error: "Add a contact email." / "Use a valid email address."

**Location & Availability**:
- `location` (text input, optional)
  - Suggested city/region

- `isRemote` (checkbox, default: true)
  - Label: "Available for remote work"

- `yearsExperience` (number input, optional)
  - Validation: whole number ≥ 0
  - Error: "Use a whole number." / "Experience cannot be negative."

- `availabilityText` (text input, optional)
  - Free-form availability details

**Sound & Skills**:
- `instrumentsCsv` (comma-separated text, required)
  - Validation: at least 1 instrument
  - Normalization: `normalizeTagName` + `ensureInstruments`
  - Error: "Add at least one instrument."
  - Example: "Piano, Violin, Drums"

- `genresCsv` (comma-separated text, required)
  - Validation: at least 1 genre
  - Normalization: `normalizeTagName` + `ensureGenres`
  - Error: "Add at least one genre."
  - Example: "Classical, Jazz, Indie"

**Compensation Preferences** (dual checkbox, mutually required):
- `seekingPaid` (checkbox, default: true)
  - Label: "Open to paid gigs"

- `seekingUnpaid` (checkbox, default: true)
  - Label: "Open to unpaid gigs"
  - Validation: at least one must be checked
  - Error: "Choose at least one compensation preference."

**Social & Portfolio Links** (all optional):
- `instagramUrl` (URL input)
  - Validation: valid http/https URL or empty
  - Error: "Use a full http:// or https:// URL."

- `youtubeUrl` (URL input)
  - Validation: valid http/https URL or empty
  - Error: "Use a full http:// or https:// URL."

- `spotifyUrl` (URL input)
  - Validation: valid http/https URL or empty
  - Error: "Use a full http:// or https:// URL."

- `soundcloudUrl` (URL input)
  - Validation: valid http/https URL or empty
  - Error: "Use a full http:// or https:// URL."

- `websiteUrl` (URL input)
  - Validation: valid http/https URL or empty
  - Error: "Use a full http:// or https:// URL."

**Form UI**:
- Error banner at top (if validation fails): "Tighten the set before saving." (styled in #FF3366 red)
- Card container: rounded-3xl, border #F1F5F9, white bg, shadow
- Fields organized in sections with fieldset + legend pattern
- Submit button: `FormSubmitButton`
  - Submit label: (context-dependent, but "Create Profile" implied)
  - Pending label: (implied from form pattern, "Creating..." likely)

**Form Submission** (`createMusicianProfileAction` in `src/app/profile/create/actions.ts`):
1. Calls `requireRole("MUSICIAN", "/profile/create")` (auth guard)
2. Re-checks no existing profile; if exists, redirect to `/profile/edit`
3. Validates all form fields (returns errors if validation fails)
4. Calls `createProfile(userId, profileData, instruments, genres)` service layer
   - Creates `profile` row
   - Deletes & re-inserts all `gig_instrument` junction rows for this profile
   - Deletes & re-inserts all `gig_genre` junction rows for this profile
5. Invalidates cache: `revalidatePath("/")` + `revalidatePath("/musicians")`
6. Redirects to `/profile/edit`

**DB Updates**:
- `profile` table: INSERT new row with user ID + all profile data
- `profile_instrument` table: INSERT rows mapping profile to each instrument (tags deduplicated via `normalizeTagName`)
- `profile_genre` table: INSERT rows mapping profile to each genre (tags deduplicated via `normalizeTagName`)

**Success Redirect**: `/profile/edit`

---

## CREATOR ONBOARDING FLOW

### Stage 1: Role Selection (`/onboarding/role`)

**Route**: `src/app/onboarding/role/page.tsx` (same as musician)

**Components**: (identical to musician flow)
- Same `PageShell` and two role cards

**Form Submission**:
- Click "I'm a Creator" button → inline server action `setRole("CREATOR")`

**Server Action**: `setRole("CREATOR")` in `src/app/onboarding/role/actions.ts`
1. Calls `requireSignedIn("/onboarding/role")` (auth guard)
2. Updates `user` table: `role = "CREATOR"` via `updateUser(session.user.id, { role })`
3. Invalidates cache: `revalidatePath("/")`
4. Redirects to `/gigs/manage`

**DB Updates**:
- `user` table: `role` field set to `CREATOR`

---

### Stage 2: Gig Management Hub (`/gigs/manage`)

**Route**: `src/app/gigs/manage/page.tsx`

**Entry Requirements**:
- User must have CREATOR role (enforced by `requireRole("CREATOR", "/gigs/manage")`)

**Components**:
- `PageShell` (wrapper)
  - eyebrow: "Stage management"
  - title: "Manage Gigs"
  - body: "Track your open projects, close them when the role is filled, or take them down."
  - action: `PrimaryCta` button → href="/gigs/create"

**Page Logic**:
- Fetches all gigs created by user: `listGigsByCreator(session.user.id)`
- If no gigs exist, shows `EmptyState`

**Empty State** (initial onboarding state):
- eyebrow: "Empty stage"
- title: "No gigs posted yet."
- body: "Post your first project to find musicians."
- CTA: `PrimaryCta` button → href="/gigs/create" with text "Post a Gig"

**Gig Cards** (rendered if gigs exist):
- Grid layout: `gap-6 md:grid-cols-2 lg:grid-cols-3`
- Each card displays:
  - Project type label (mono, uppercase)
  - Status chip: "OPEN" or "CLOSED" (blue if OPEN, neutral if CLOSED)
  - Title (h2)
  - Compensation type chip (gold)
  - Description (clamped to 160 chars)
  - Instrument tags (max visible shown, "+N more" if overflow)
  - Genre tags (max visible shown, "+N more" if overflow)
  - Edit button → `/gigs/{id}/edit`
  - Close Gig button (only if status = "OPEN") → `closeGigAction({id})`
  - Delete button → `deleteGigAction({id})`

**Primary CTA** ("Post a New Gig"):
- Located in PageShell action prop
- Href: `/gigs/create`

**Next Step**: Click "Post a New Gig" or EmptyState CTA → `/gigs/create`

---

### Stage 2b: Create Gig (`/gigs/create`)

**Route**: `src/app/gigs/create/page.tsx`

**Entry Requirements**:
- User must have CREATOR role (enforced by `requireRole("CREATOR", "/gigs/create")`)

**Components**:
- `PageShell` (wrapper)
  - eyebrow: "Backstage"
  - title: "Post a Gig"
  - body: "Name the project, the sound, the timeline, and how musicians should think about compensation."
- `GigForm` (client component, `src/app/gigs/_gig-form.tsx`)
  - action: `createGigAction`
  - submitLabel: "Publish Gig"
  - pendingLabel: "Publishing..."
  - cancelHref: "/gigs"

**Form Fields** (in GigForm):

**Project Section** (legend: "PROJECT"):
- `title` (text input, required)
  - Placeholder: "Composer needed for 10-minute thesis short"
  - Validation: non-empty, max 120 characters
  - Error: "Add a title." / "Keep the title under 120 characters."

- `description` (textarea, required)
  - Validation: non-empty, max 2,400 characters
  - Error: "Add the project details." / "Keep the description under 2,400 characters."

- `projectType` (select/enum, required)
  - Validation: must be valid enum value from `PROJECT_TYPES`
  - Error: "Choose a project type."
  - Options: (defined in `src/lib/display.ts`, e.g., FILM_SCORE, TRAILER, PODCAST, etc.)

**Location & Accessibility**:
- `location` (text input, optional)
  - Suggested city/region

- `isRemote` (checkbox, default: true)
  - Label: "Available for remote work"

**Compensation**:
- `compensationType` (select/enum, required)
  - Validation: must be valid enum value from `COMPENSATION_TYPES`
  - Error: "Choose a compensation type."
  - Options: (e.g., PAID, UNPAID, REVENUE_SHARE, etc.)

- `compensationDetails` (text input, optional)
  - Free-form compensation notes (budget, rate, percentage, etc.)

**Timeline**:
- `deadline` (date input, optional)
  - Validation: valid date format (YYYY-MM-DD) or empty
  - Error: "Use a valid date."

**Sound Requirements**:
- `instrumentsCsv` (comma-separated text)
  - Normalization: `normalizeTagName` + `ensureInstruments`
  - Example: "Piano, Violin, Drums"

- `genresCsv` (comma-separated text)
  - Normalization: `normalizeTagName` + `ensureGenres`
  - Example: "Classical, Jazz, Indie"

**Form UI**:
- Error banner at top (if validation fails): "Tighten the set before publishing."
- Card container: rounded-3xl, border #F1F5F9, white bg, shadow
- Fields organized in sections with fieldset + legend pattern
- Submit button: `FormSubmitButton`
  - Submit label: "Publish Gig"
  - Pending label: "Publishing..."
- Cancel button → `/gigs`

**Form Submission** (`createGigAction` in `src/app/gigs/create/actions.ts`):
1. Calls `requireRole("CREATOR", "/gigs/create")` (auth guard)
2. Validates all form fields (returns errors if validation fails)
3. Calls `createGig(gigData, instruments, genres)` service layer
   - Creates `gig` row with status = "OPEN"
   - Deletes & re-inserts all `gig_instrument` junction rows
   - Deletes & re-inserts all `gig_genre` junction rows
   - Returns created gig object
4. Invalidates cache: `revalidatePath("/gigs")` + `revalidatePath("/gigs/manage")`
5. Redirects to `/gigs/{id}` (gig detail page)

**DB Updates**:
- `gig` table: INSERT new row with creator ID, all gig data, status = "OPEN"
- `gig_instrument` table: INSERT rows mapping gig to each instrument (tags deduplicated)
- `gig_genre` table: INSERT rows mapping gig to each genre (tags deduplicated)

**Success Redirect**: `/gigs/{gig.id}` (gig detail/view page)

---

## COMPARISON TABLE

| Aspect | Musician | Creator |
|--------|----------|---------|
| **Role Selection** | `/onboarding/role` (shared) | `/onboarding/role` (shared) |
| **Role Value** | `MUSICIAN` | `CREATOR` |
| **After Role Selection** | → `/profile/create` | → `/gigs/manage` |
| **Second Page** | Profile creation form | Gig management hub (empty state) |
| **Required to Complete?** | Yes, form must be filled | No, can view empty state; gig creation is optional |
| **Form Type** | ProfileForm | GigForm (if user clicks "Post a Gig") |
| **Form Sections** | Basic Info, Sound/Skills, Social Links | Project, Compensation, Timeline, Sound |
| **Primary DB Table** | `profile` | `gig` |
| **Junction Tables** | `profile_instrument`, `profile_genre` | `gig_instrument`, `gig_genre` |
| **Success Redirect** | `/profile/edit` | `/gigs/{id}` (only if gig created) |
| **Search Visibility** | Listed in `/musicians` | Listed in `/` (gig discovery) |

---

## Auth Guards Summary

All routes enforce auth at page level via one of these guards:

- `getCurrentSession()` — returns session or null
- `requireSignedIn(callbackUrl?)` — enforces sign-in, redirects if not
- `requireUser(callbackUrl?)` — enforces sign-in + role exists (app user created)
- `requireRole(role, callbackUrl?)` — enforces sign-in + specific role

All actions call auth guards first, before any business logic.

---

## Notes for Future Flow Changes

- **Musician onboarding is mandatory**: profile creation form must be completed before accessing musician features
- **Creator onboarding is optional**: role selection lands on gig management hub, but users can view empty state without creating a gig
- **Both flows sync auth → app user**: `syncAppUserFromAuth` is called by auth guards, ensuring `user` table is current
- **Role cannot be changed after selection**: no UI currently exists to switch roles post-onboarding (would require explicit migration)
- **Tag deduplication**: instruments & genres use `normalizeTagName` before insert to prevent duplicates across profiles/gigs
- **Form validation is client-facing**: errors returned via `ActionState` and rendered inline below each field
