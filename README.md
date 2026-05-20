# Motivo

Platform connecting student musicians with student creators for film, podcasts, live events, games, YouTube videos, and creative projects.

**Vision:** Students can find collaborators fast. Musicians discover opportunities. Creators cast talent.

## Features

### User Management
- Email/password sign-up with confirmation
- Sign-in with email/password
- Password reset flow via email
- Password change in account settings
- Profile avatars in navigation (image → initials → icon fallback)
- Account settings page (update name, view email, delete account)
- Role-based access (Musician / Creator)

### Musician Features
- Build public musician profiles with bio, instruments, genres, years of experience
- Upload portfolio items (links to past work)
- Browse and apply to open gigs
- Filter gigs by instrument, genre, project type, compensation

### Creator Features
- Post gigs with project details, compensation, deadline, location
- Specify required instruments and genres
- Manage posted gigs (close, edit, delete)
- Browse musician directory with filters

### Discovery
- Musician directory with searchable profiles
- Gig listing with advanced filters (project type, instruments, genres, compensation)
- Role-aware navigation (different menu for musicians vs. creators)

## Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router, Server Components)
- **Language:** TypeScript 5.9+
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Animations:** Framer Motion, GSAP + ScrollTrigger
- **UI Primitives:** Radix UI (`@radix-ui/react-*` for dropdowns, dialogs, etc.)
- **Icons:** Lucide React
- **3D (hero only):** React Three Fiber + Drei

### Backend
- **Auth:** Supabase (email/password + JWT in httpOnly cookies)
- **Database:** PostgreSQL (via Supabase)
- **ORM:** None (raw Supabase client)
- **Mutations:** Server Actions (no REST API routes)

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout (NavBar, Footer)
│   ├── page.tsx                 # Landing page
│   ├── account/                 # User account settings
│   │   ├── page.tsx
│   │   ├── actions.ts
│   │   ├── _update-name-form.tsx
│   │   └── _delete-account-button.tsx
│   ├── update-password/         # Change password (authenticated)
│   │   ├── page.tsx
│   │   ├── actions.ts
│   │   └── _update-password-form.tsx
│   ├── signin/                  # Email/password sign in
│   │   ├── page.tsx
│   │   ├── actions.ts
│   │   └── _signin-form.tsx
│   ├── signup/                  # Email/password sign up
│   │   ├── page.tsx
│   │   ├── actions.ts
│   │   └── _signup-form.tsx
│   ├── forgot-password/         # Password reset request
│   │   ├── page.tsx
│   │   ├── actions.ts
│   │   └── _forgot-password-form.tsx
│   ├── musicians/               # Musician directory
│   │   ├── page.tsx
│   │   └── [id]/page.tsx       # Public musician profile
│   ├── gigs/                    # Gig management
│   │   ├── page.tsx            # Browse gigs
│   │   ├── [id]/page.tsx       # Gig detail
│   │   ├── [id]/edit/          # Edit gig (Creator only)
│   │   ├── create/             # Post gig (Creator only)
│   │   └── manage/             # Manage my gigs (Creator only)
│   ├── profile/                 # Musician profile editor
│   │   ├── create/             # Create profile (MUSICIAN role)
│   │   └── edit/               # Edit profile (MUSICIAN role)
│   ├── onboarding/              # Role selection
│   │   └── role/page.tsx
│   ├── auth/callback/           # OAuth callback handler
│   └── api/auth/[...auth]/      # Auth API routes
│
├── lib/
│   ├── api/                     # Service layer (DB operations)
│   │   ├── users.ts            # User CRUD (app_user table)
│   │   ├── profiles.ts         # Musician profile CRUD
│   │   ├── gigs.ts             # Gig CRUD + queries
│   │   ├── tags.ts             # Instrument/Genre upsert
│   │   └── types.ts            # TypeScript interfaces
│   ├── supabase/
│   │   ├── server.ts           # Server-side Supabase client
│   │   └── client.ts           # Browser-side Supabase client
│   ├── auth/
│   │   └── sync-app-user.ts   # Sync Supabase user → app user (legacy)
│   ├── auth-guards.ts          # Session checks + redirects
│   ├── password.ts             # Password validation
│   ├── form-utils.ts           # CSV parsing, validation
│   └── middleware.ts           # JWT refresh
│
├── components/
│   ├── home/
│   │   ├── HomeLanding.tsx     # Landing page hero (bright theme)
│   │   └── StageLightsScene.tsx # 3D scene (R3F, only file allowed)
│   ├── ui/
│   │   ├── nav-bar.tsx         # Top navigation
│   │   ├── _user-menu.tsx      # Profile avatar dropdown
│   │   ├── footer.tsx
│   │   ├── primary-cta.tsx
│   │   ├── secondary-cta.tsx
│   │   ├── page-shell.tsx      # Page layout wrapper
│   │   ├── page-loading.tsx    # Skeleton loading
│   │   ├── section-card.tsx    # Card component
│   │   └── [other UI primitives]
│   └── auth/
│       ├── sign-out-button.tsx
│       └── password-field.tsx
│
└── types/                       # Ambient types
```

## Database Schema

**Core tables:**
- `app_user` — App user metadata (id: TEXT matching auth.users, email, name, image, role, created_at, updated_at)
- `auth.users` — Supabase-managed auth (email, password hash, email_confirmed_at, managed by Supabase)
- `musician_profile` — Musician-specific data (bio, instruments, genres, links)
- `gig` — Posted opportunities (title, description, instruments, genres, compensation)
- `instrument` — Tag reference (upserted on use)
- `genre` — Tag reference (upserted on use)
- `musician_instrument` — Junction (musician_profile → instruments)
- `musician_genre` — Junction (musician_profile → genres)
- `gig_instrument` — Junction (gig → required instruments)
- `gig_genre` — Junction (gig → required genres)

All cascade deletes on app_user → deletes profiles, gigs, and junction rows.

## Authentication Flow

1. User signs up at `/signup` with email/password
2. Supabase sends confirmation email (via `NEXT_PUBLIC_APP_URL`)
3. User confirms email, then signs in at `/signin`
4. `middleware.ts` refreshes JWT on every request via `supabase.auth.getUser()`
5. Every protected page calls auth guard: `getCurrentSession()` → `requireSignedIn()` → `requireUser()` → `requireRole()`
6. First login: user onboarding at `/onboarding/role` to choose Musician or Creator
7. Role persists in `app_user.role` column
8. Password reset via `/forgot-password` → email link → `/account/update-password`

**Session shape:**
```ts
{ user: { id, email, role, name, image } }  // id = Supabase auth user id
```

**Auth tables:**
- `auth.users` — Supabase-managed (email, password hash, email_confirmed_at)
- `app_user` — App-specific metadata (role, name, image)
- `app_user.id` matches `auth.users.id` (TEXT)

## Key Patterns

### Server Components by Default
- Every `page.tsx` and `layout.tsx` is a Server Component
- They `await getCurrentSession()` and call API functions
- Only add `"use client"` when needed (forms, modals, animations)

### Mutations via Server Actions
- All writes go through `"use server"` functions in `actions.ts`
- Session + role re-checked inside each action
- After mutation: `revalidatePath()` + `redirect()`
- No REST API routes (except `/api/auth/[...nextauth]`)

### API Layer (`src/lib/api/*`)
- Centralized DB operations (no direct Supabase calls in pages)
- Handles snake_case ↔ camelCase transformation
- Flattens junction tables (instruments/genres as `string[]`)

### Design System
**Tokens** (no zinc/violet, only bright theme):
- Page: `#FAFAFA`
- Ink: `#0F172A`
- Accents: `#0055FF` (blue), `#FF3366` (pink), `#FFB000` (gold)
- Focus ring: `outline-2 outline-[#0055FF] outline-offset-2`
- Radius: `rounded-full` (pills), `rounded-3xl` (cards), `rounded-2xl` (inputs)

**Component Patterns:**
- Primary CTA: `rounded-full h-14 px-8 bg-[#0F172A] text-white`
- Secondary CTA: `rounded-full border-2 border-[#E2E8F0] bg-white`
- Destructive: `border-[#FF3366] text-[#FF3366] hover:bg-[#FF3366]/10`

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase project (free tier OK)
- Email service enabled in Supabase (for password reset confirmations)

### Local Setup

1. **Clone & install:**
   ```bash
   git clone <repo>
   cd gig-forge
   npm install
   ```

2. **Environment variables** (`.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...   # server-only; required for account deletion
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Run dev server:**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

### Database Setup

1. Create PostgreSQL DB in Supabase
2. Migrations auto-apply from `supabase/migrations/`
3. Or manually run SQL schema from `supabase/migrations/*.sql`

## Commands

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build           # Next.js production build
npm run lint            # ESLint checks
npm run prisma:generate # Generate Prisma types (if schema changes)
```

## File Naming Conventions

| Type | Location | Pattern |
|---|---|---|
| Route page | `src/app/<segment>/` | `page.tsx` |
| Route layout | `src/app/<segment>/` | `layout.tsx` |
| Server action | `src/app/<segment>/` | `actions.ts` |
| Co-located form | `src/app/<segment>/` | `_<name>.tsx` |
| UI component | `src/components/ui/` | `kebab-case.tsx` |
| Feature component | `src/components/<feature>/` | `PascalCase.tsx` |

Underscore prefix (`_`) opts out of routing — use for co-located forms and helpers.

## Security Checklist

- [ ] Session + role re-checked in every server action
- [ ] Ownership verified on edit/delete (`record.userId === session.user.id`)
- [ ] Inputs validated (length, enum membership, URL format)
- [ ] No `dangerouslySetInnerHTML`
- [ ] External links use `rel="noopener noreferrer"`
- [ ] No secrets in client bundle

## Known Issues & TODOs

- JWT callback hits DB on every request (perf issue)
- Tag names lack `@unique` constraint (case-sensitive collisions possible)
- Status on Gig is `STRING` (should be enum)
- `PortfolioItem` and `MusicianInstrument.proficiency` are dead code
- No `revalidatePath` after some mutations (cache inconsistency risk)

## Deployment

**Vercel:**
1. Connect repo to Vercel
2. Set env vars (Supabase URL, keys, Google OAuth credentials)
3. Deploy (`git push` triggers automatic build)

**Database:** Supabase (managed PostgreSQL)
**Auth:** Supabase + Google OAuth (no additional infra)

## Contributing

1. Read `ai-context/AGENTS.md` for conventions
2. Create feature branch from `main`
3. Follow commit style: `feat(scope): description`
4. `npm run lint && npm run build` must pass
5. Create PR with test plan

## Resources

- **API docs:** `ai-context/DATABASE.md` (all service layer functions)
- **Design system:** `ai-context/DESIGN.md` (colors, tokens, motion)
- **UX rules:** `ai-context/UX_RULES.md` (forms, loading states, accessibility)
- **Architecture:** `ai-context/FRONTEND_ARCH.md` (patterns, auth, data fetching)
- **Components:** `ai-context/COMPONENTS.md` (reusable UI recipes)

## License

MIT
