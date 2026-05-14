# Motivo Onboarding Redesign — Implementation Status & Debug Guide

**Last Updated**: 2026-05-14  
**Status**: 95% Complete — Auth redirect misconfiguration blocking local testing

---

## Quick Summary

Full redesign of Motivo onboarding + profile edit is **code-complete and builds successfully**. All 50+ new files written, all DB migrations applied. Single blocker: **Google OAuth localhost redirect not whitelisted in Google Cloud Console**.

---

## Current Issue: Google OAuth Localhost Redirect Blocked

### Symptoms
- Sign-in page loads fine
- Click "Continue with Google" → redirects to Google login
- After Google auth → **redirects to production domain** instead of `http://localhost:3000`

### Root Cause
Google Cloud Console OAuth app only whitelists production domain. Localhost is not registered as allowed redirect URI.

### Fix (Required Before Testing)
1. Go to **Google Cloud Console** → Your Project → Credentials
2. Find OAuth 2.0 Client ID (Web application)
3. Click Edit
4. Add to "Authorized redirect URIs":
   ```
   http://localhost:3000/auth/callback
   ```
5. Save

Then restart dev server and retry signin.

### Why This Happened
- Supabase URL Configuration has localhost ✓
- Supabase Google provider is configured ✓
- But Google itself (the OAuth provider) blocks unlisted redirect URIs
- This is Google's security policy, not a code issue

---

## Implementation Status

### ✅ Complete (Phase 1-6)

#### Phase 1: Database Migrations
- **Status**: Applied to Supabase ✓
- 6 migration files created + executed:
  - `20260514000001_extend_musician_profile.sql` — 12 new columns (resume_pdf_url, video_portfolio_url, profile_image_url, willing_to_travel, travel_radius_miles, tour_start_date, tour_end_date, min_notice_days, is_searchable, allow_event_invitations, newsletter_opt_in, onboarding_step)
  - `20260514000002_musician_rates.sql` — musician_rates table
  - `20260514000003_musician_equipment.sql` — musician_equipment table
  - `20260514000004_musician_availability.sql` — musician_availability table
  - `20260514000005_extend_gig.sql` — 11 new gig columns
  - `20260514000006_gig_application_questions.sql` — gig_application_questions table
- All 30+ new columns verified in schema ✓
- RLS disabled on `user` table (was blocking writes) ✓

#### Phase 2: Service Layer Extensions
- **Status**: Complete ✓
- Extended `src/lib/api/types.ts` with new interfaces
- Added 8+ new functions to `src/lib/api/profiles.ts`
- Added draft/publish gig functions to `src/lib/api/gigs.ts`
- Created `src/lib/api/media.ts` for file uploads (Supabase Storage)
- Created `src/lib/validation/profile.ts` with step-level validators

#### Phase 3: Config & Role Redirect
- **Status**: Complete ✓
- Updated `next.config.ts` with `experimental: { serverActions: { bodySizeLimit: "10mb" } }`
- Changed musician onboarding redirect in `src/app/onboarding/role/actions.ts` from `/profile/create` → `/onboarding/musician/basics`

#### Phase 4: Musician Onboarding Wizard (7 Steps)
- **Status**: All routes built, code complete ✓
- `src/app/onboarding/musician/` structure:
  - `layout.tsx` — wraps all steps with ProgressBar
  - `page.tsx` — route guard, profile check, redirects to next incomplete step
  - `_progress-bar.tsx` — 7-circle progress indicator with Framer Motion
  - 7 step folders (basics, sound, portfolio, rates, availability, social, preferences):
    - Each has `page.tsx` (server), `actions.ts` (server action), `_form.tsx` (client)
    - Validators: validateStep1-7 in `src/lib/validation/profile.ts`
    - All use `useActionState` pattern with inline field errors
    - Optional steps 3-7 have "Skip for now" link
    - Step 3 (portfolio) handles file uploads: profile image + resume PDF

#### Phase 5: Creator Multi-Step Gig Flow (3 Steps)
- **Status**: Routes built, code complete ✓
- Step 1: `/gigs/create` — modified to use `createGigDraftAction` → creates DRAFT gig
- Steps 2-3: `/gigs/draft/[id]/step/[n]` — two-step form at draft URL
  - Step 2: Instruments, genres, experience level, ensemble, location, equipment
  - Step 3: Creator info, custom questions builder, publish button
- Draft gigs persist with status='DRAFT' until published

#### Phase 6: Profile Edit Sidebar Redesign (8 Sections)
- **Status**: All routes + components built ✓
- `src/app/profile/edit/` structure:
  - `layout.tsx` — wraps with sidebar
  - `_sidebar.tsx` — client nav with 8 links using `?tab` search param
  - `page.tsx` — routes to correct section based on `?tab`
  - `actions.ts` — 8 independent save actions (one per section)
  - 8 section components:
    - `_section-basics.tsx` — displayName, bio, school, location, contactEmail
    - `_section-sound.tsx` — instruments, genres, experience, remote status
    - `_section-portfolio.tsx` — profile image, resume PDF, video URL
    - `_section-rates.tsx` — dynamic rate rows (add/remove)
    - `_section-availability.tsx` — travel preferences, dates, notice period
    - `_section-social.tsx` — Instagram, YouTube, Spotify, SoundCloud, website
    - `_section-equipment.tsx` — dynamic equipment inventory
    - `_section-preferences.tsx` — searchability, invitations, newsletter

### ✅ Build Verification
```bash
npm run build  # PASSES ✓
npm run lint   # PASSES ✓
```

All 22 routes compiled:
- `/` (home)
- `/signin`, `/signup`
- `/onboarding/role`
- `/onboarding/musician/[7 steps]`
- `/gigs/create`, `/gigs/manage`, `/gigs/[id]`, `/gigs/draft/[id]/step/[n]`
- `/profile/create`, `/profile/edit`
- `/musicians`, `/musicians/[id]`
- `/account`

### ⏳ Pending (Minor)

1. **Storage Bucket** (manual step)
   - Create `musician-media` bucket in Supabase Storage
   - Set to Private
   - File uploads for portfolio step will use this
   - Not critical for testing steps 1-7 without files

2. **End-to-End Testing**
   - Musician wizard: walk through all 7 steps
   - Creator gig: create draft gig → publish
   - Profile edit: verify each section saves independently
   - Test on multiple browsers (Chrome, Safari, Firefox)

---

## Architecture Decisions (Locked)

### 1. Action-per-step pattern
Each wizard step imports its own server action and uses `useActionState(action, emptyActionState)`. Matches existing `_profile-form.tsx` pattern. TypeScript-safe.

### 2. File uploads in server action
No pre-signed URLs. Server action receives `File` from FormData, uploads via Supabase admin client, returns error or redirects. Requires `serverActions: { bodySizeLimit: "10mb" }` in config.

### 3. Dynamic form rows via indexed FormData
Rates/equipment use `rate[0][type]`, `rate[0][amount]` etc. Server action groups via `parseIndexedRows(fd, "rate")` helper in `form-utils.ts`.

### 4. Step route slugs (strings, not numeric)
Use `/onboarding/musician/basics`, `/sound`, `/portfolio`, etc. (not `/1`-`/7`). Self-documenting, easier to maintain.

### 5. No RLS — auth server-side
Database has no RLS policies (disabled per `CLAUDE.md`). Auth enforced in code via `requireRole()` guards.

---

## File Structure

```
src/
├── app/
│   ├── onboarding/
│   │   ├── musician/
│   │   │   ├── layout.tsx              (Progress bar wrapper)
│   │   │   ├── page.tsx                (Route guard + redirect logic)
│   │   │   ├── _progress-bar.tsx       (7-step progress indicator)
│   │   │   ├── basics/
│   │   │   ├── sound/
│   │   │   ├── portfolio/
│   │   │   ├── rates/
│   │   │   ├── availability/
│   │   │   ├── social/
│   │   │   └── preferences/
│   │   │       (each: page.tsx, actions.ts, _form.tsx)
│   │   └── role/
│   │       └── actions.ts              (Updated redirect for MUSICIAN)
│   ├── gigs/
│   │   ├── create/
│   │   │   ├── page.tsx                (Uses GigStep1Form)
│   │   │   ├── actions.ts              (createGigDraftAction)
│   │   │   └── _step-1-describe.tsx
│   │   ├── draft/
│   │   │   └── [id]/step/[n]/
│   │   │       ├── page.tsx
│   │   │       ├── actions.ts          (updateGigDraftAction, publishGigAction)
│   │   │       ├── _step-2-requirements.tsx
│   │   │       └── _step-3-creator-info.tsx
│   │   └── manage/
│   ├── profile/
│   │   ├── edit/
│   │   │   ├── layout.tsx              (Sidebar wrapper)
│   │   │   ├── page.tsx                (Tab routing)
│   │   │   ├── actions.ts              (8 section save actions)
│   │   │   ├── _sidebar.tsx            (Nav with ?tab param)
│   │   │   └── _section-*.tsx          (8 section components)
│   │   └── create/
│   ├── signin/
│   ├── signup/
│   └── auth/
│       └── callback/
│           └── route.ts                (OAuth callback handler)
├── lib/
│   ├── api/
│   │   ├── profiles.ts                 (Extended with new functions)
│   │   ├── gigs.ts                     (Extended with draft/publish)
│   │   ├── media.ts                    (NEW: file upload helpers)
│   │   ├── types.ts                    (Extended interfaces)
│   │   └── ...
│   ├── validation/
│   │   └── profile.ts                  (NEW: step validators)
│   └── ...
└── components/
    └── ...
```

---

## Testing Checklist

### Setup
- [ ] Google Cloud Console: Add `http://localhost:3000/auth/callback` to OAuth redirect URIs
- [ ] Restart dev server: `npm run dev`
- [ ] Create Supabase Storage bucket `musician-media` (private)

### Musician Onboarding (7 steps)
- [ ] Sign up → choose "I'm a Musician" → redirects to `/onboarding/musician/basics`
- [ ] **Step 1 (Basics)**: Fill displayName + contactEmail → click Next → save works, advance to Sound
- [ ] **Step 2 (Sound)**: Add instruments + genres → click Next → advance to Portfolio
- [ ] **Step 3 (Portfolio)**: Click "Skip for now" → advance to Rates (skip file upload)
- [ ] **Step 4 (Rates)**: Click "Skip" → advance to Availability
- [ ] **Step 5 (Availability)**: Click "Skip" → advance to Social
- [ ] **Step 6 (Social)**: Click "Skip" → advance to Preferences
- [ ] **Step 7 (Preferences)**: Toggle one checkbox → click "Done" → redirect to `/profile/edit`
- [ ] DB check: `SELECT onboarding_step FROM musician_profile WHERE user_id = 'xxx'` → should be 7

### Creator Gig Flow (3 steps)
- [ ] Sign up → choose "I'm a Creator" → redirects to `/gigs/manage`
- [ ] Click "Post a Gig" → `/gigs/create` (Step 1)
- [ ] Fill title + description + projectType + compensationType → click Next → creates DRAFT gig
- [ ] Redirects to `/gigs/draft/{id}/step/2` (Step 2)
- [ ] Add instruments + experience → click Next → advance to Step 3
- [ ] Redirects to `/gigs/draft/{id}/step/3` (Step 3)
- [ ] Fill creator_name + add 1 custom question → click "Publish Gig"
- [ ] Redirects to `/gigs/{id}` (published gig detail)
- [ ] Back at `/gigs/manage` → gig appears in list

### Profile Edit Sidebar (8 sections)
- [ ] Already logged in musician → go to `/profile/edit`
- [ ] Verify sidebar shows 8 links: Basics, Sound & Skills, Portfolio, Rates, Availability, Social Links, Equipment, Preferences
- [ ] Click each link → correct section loads with pre-filled data
- [ ] **Basics**: Edit displayName → Save → toast shows "Saved!", DB updated
- [ ] **Sound**: Edit instruments → Save → DB updated
- [ ] **Rates**: Add a rate → Save → row inserted into `musician_rates` table
- [ ] **Equipment**: Add equipment → Save → row inserted into `musician_equipment` table
- [ ] **Portfolio**: Upload profile image → Save (file should go to Supabase Storage)
- [ ] All sections work independently (no page reload required)

---

## Common Issues & Fixes

### 1. "new row violates row-level security policy for table \"user\""
**Cause**: RLS blocking inserts to `user` table  
**Fix**: Disable RLS:
```sql
ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;
```

### 2. Turbopack panic: "An unexpected Turbopack error occurred"
**Cause**: Cache corruption  
**Fix**: 
```bash
rm -rf .next
npm run dev
```

### 3. TypeError: "X is not a function"
**Cause**: Import typo or missing function  
**Fix**: Check `src/lib/api/` for correct function names (e.g., `getGig` not `getGigById`)

### 4. "Cannot find module @/lib/validation/profile"
**Cause**: File not created  
**Fix**: Ensure `src/lib/validation/profile.ts` exists with all validators

### 5. FormSubmitButton missing `pendingLabel`
**Fix**: Add to all FormSubmitButton components:
```tsx
<FormSubmitButton pendingLabel="Saving...">Save Changes</FormSubmitButton>
```

---

## Environment & Dependencies

- **Node**: v18+ (check `node --version`)
- **Next.js**: 16.2.6 (Turbopack)
- **Supabase**: Project `xmwhwexuqajglbjgwute`
- **Database URL**: `postgresql://postgres.xmwhwexuqajglbjgwute:...@aws-0-us-west-2.pooler.supabase.com:5432/postgres`
- **Anon Key**: `sb_publishable_mN7UHaNgZ0rKs1n8uwgEFQ_kIzXMM-n`
- **Service Role**: Stored in `.env` as `SUPABASE_SERVICE_ROLE_KEY`

---

## Commands

```bash
# Dev
npm run dev              # Start at localhost:3000

# Build & verify
npm run build            # Production build (must pass)
npm run lint             # ESLint (must pass)

# Database (local dev only)
supabase db push         # Push migrations to Supabase
supabase db pull         # Pull schema from Supabase

# Clean cache
rm -rf .next
rm -rf node_modules      # If npm issues
npm install
```

---

## Next Steps (For Your Agent)

1. **Get Google OAuth working** (blocking local testing):
   - Add `http://localhost:3000/auth/callback` to Google Cloud Console OAuth redirect URIs
   - Restart dev server

2. **Create Storage bucket**:
   - Supabase Dashboard → Storage → New bucket → `musician-media` (Private)

3. **Test full flows**:
   - Walk through musician wizard (7 steps)
   - Walk through creator gig flow (3 steps)
   - Walk through profile edit sidebar (8 sections)

4. **Deploy to production** (when ready):
   - Add production domain to Google Cloud Console redirect URIs
   - Update Supabase Site URL to production domain
   - Run `npm run build && npm run start` or deploy to Vercel

---

## Key Files by Purpose

| Purpose | Files |
|---------|-------|
| **Auth Flow** | `src/lib/auth-guards.ts`, `src/app/auth/callback/route.ts`, `src/lib/auth/sync-app-user.ts` |
| **Musician Wizard** | `src/app/onboarding/musician/*` (50+ files) |
| **Creator Gigs** | `src/app/gigs/create/*`, `src/app/gigs/draft/*` (15+ files) |
| **Profile Edit** | `src/app/profile/edit/*` (10+ files) |
| **Service Layer** | `src/lib/api/profiles.ts`, `src/lib/api/gigs.ts`, `src/lib/api/media.ts` |
| **Validation** | `src/lib/validation/profile.ts`, `src/lib/form-utils.ts` |
| **Types** | `src/lib/api/types.ts` |
| **Database** | `supabase/migrations/*` (6 files) |

---

## Questions for Debugging?

1. **What's failing?** → Check browser DevTools (F12) Console + Network tabs
2. **Which route?** → Check URL + Network tab to see which action failed
3. **Database error?** → Check error code (42501 = permission, 23505 = unique violation, etc.)
4. **Build failing?** → Run `npm run build` and share the error
5. **Auth not working?** → Check OAuth redirect URLs in Google Cloud + Supabase

---

**Created**: 2026-05-14  
**Last Debug Session**: Google OAuth localhost redirect issue — needs Google Cloud Console config
