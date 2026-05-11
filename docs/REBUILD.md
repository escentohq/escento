# GigForge — Comprehensive Rebuild Reference

> **Purpose of this document.** This is a single self-contained reference for rebuilding **GigForge** from zero. It documents the product, every screen, every form field, every database column, every server action, every styling token, every known issue, and the engineering decisions worth keeping or replacing. Read this end-to-end before changing the stack or scaffolding the project. An AI agent or new engineer should be able to recreate a functionally equivalent app — or a better one — using only this file plus the visual style guide.
>
> Where the current implementation has problems (security, data integrity, scalability, UX), they are flagged explicitly as **Issue** so a rebuild does not re-inherit them.

---

## Table of Contents

1. [Product Summary](#1-product-summary)
2. [Users, Personas, and Core Flows](#2-users-personas-and-core-flows)
3. [Feature Inventory (Implemented MVP)](#3-feature-inventory-implemented-mvp)
4. [Out-of-Scope / Future Features](#4-out-of-scope--future-features)
5. [Current Tech Stack](#5-current-tech-stack)
6. [Recommended Rebuild Stack](#6-recommended-rebuild-stack)
7. [Repository Layout](#7-repository-layout)
8. [Environment & Local Setup](#8-environment--local-setup)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Data Model (Full Schema)](#10-data-model-full-schema)
11. [Routing Map](#11-routing-map)
12. [Page-by-Page Specification](#12-page-by-page-specification)
13. [Server Actions / API Surface](#13-server-actions--api-surface)
14. [Business Rules & Validation](#14-business-rules--validation)
15. [Visual Design System](#15-visual-design-system)
16. [Component Library](#16-component-library)
17. [State, Caching, and Data Fetching](#17-state-caching-and-data-fetching)
18. [Known Issues & Technical Debt](#18-known-issues--technical-debt)
19. [Security Checklist](#19-security-checklist)
20. [Performance Notes](#20-performance-notes)
21. [Testing Strategy (Missing — Recommended)](#21-testing-strategy-missing--recommended)
22. [Deployment](#22-deployment)
23. [Observability](#23-observability)
24. [Rebuild Phased Plan](#24-rebuild-phased-plan)
25. [Open Product Decisions](#25-open-product-decisions)

---

## 1. Product Summary

GigForge is a directory + listings platform that connects **student musicians** with **student creators** (film students, podcasters, YouTubers, indie game devs, event organizers). It is intentionally not a social network: no feeds, no in-app messaging, no payments, no algorithmic recommendations. The MVP optimizes for the shortest possible path from "I need someone" to "I found them and emailed them."

Two sides:

- **Musicians** create a single public profile listing instruments, genres, location, availability, portfolio links, and a contact email.
- **Creators** post structured gig listings (project type, requirements, location/remote, compensation, deadline) and receive direct email contact from interested musicians.

Tagline currently on the landing page: *"Find the right student musician for your next project."*

Scope discipline matters. Every feature beyond the inventory in §3 is explicitly **excluded** from MVP.

---

## 2. Users, Personas, and Core Flows

### Personas

- **Alex — Film Student (Creator).** Needs a composer for a 10-minute short. Doesn't know musicians personally. Deadline-driven.
- **Maya — Guitarist (Musician).** Wants gigs and collaborations. Currently relies on word of mouth.

### Core Flows

**A. Musician signs up → creates profile**
`/` → Sign in (GitHub or Google) → `/onboarding/role` (choose `MUSICIAN`) → `/profile/create` → fill form → `/profile/edit` (post-save redirect).

**B. Creator signs up → posts gig**
`/` → Sign in → `/onboarding/role` (choose `CREATOR`) → `/gigs/create` → fill form → `/gigs/[id]`.

**C. Anyone discovers a musician**
`/` → `/musicians` (apply filters: instrument, genre) → `/musicians/[id]` → click `mailto:` contact button.

**D. Anyone discovers a gig**
`/` → `/gigs` (apply filters: projectType, instrument, genre) → `/gigs/[id]` → `mailto:` creator.

**E. Creator manages own gigs**
Navbar → `Manage Gigs` (`/gigs/manage`) → Edit / Mark Filled (close) / Delete / View.

Browsing is fully **anonymous** — no auth required to read musicians or gigs.

---

## 3. Feature Inventory (Implemented MVP)

| Feature | Route(s) | Auth | Role |
|---|---|---|---|
| Landing page with role-aware CTAs | `/` | Optional | Any |
| OAuth sign-in (GitHub, Google) | `/signin`, `/api/auth/*` | — | — |
| Role selection (one-time) | `/onboarding/role` | Required | None → set |
| Musician directory + filters | `/musicians` | Optional | Any |
| Musician public profile | `/musicians/[id]` | Optional | Any |
| Create musician profile | `/profile/create` | Required | `MUSICIAN` |
| Edit musician profile | `/profile/edit` | Required | `MUSICIAN` |
| Gig directory + filters | `/gigs` | Optional | Any |
| Gig detail | `/gigs/[id]` | Optional | Any |
| Create gig | `/gigs/create` | Required | `CREATOR` |
| Edit gig | `/gigs/[id]/edit` | Required | Owner `CREATOR` |
| Manage own gigs (list/close/delete) | `/gigs/manage` | Required | `CREATOR` |
| Filtering: instrument, genre (musicians) | `/musicians` | — | — |
| Filtering: projectType, instrument, genre (gigs) | `/gigs` | — | — |
| Contact via `mailto:` (no in-app messaging) | both detail pages | — | — |

**Gigs visible in directory**: only `status = OPEN`. Closed gigs remain at `/gigs/[id]` if linked but are filtered from `/gigs`.

---

## 4. Out-of-Scope / Future Features

Explicitly excluded from MVP (do not add during rebuild unless re-scoped):

- Internal messaging / DMs
- Payment processing / escrow
- Rating / review system
- Recommendation algorithms / match scoring (PRD mentions scoring rules; **not implemented**)
- Mobile apps
- Notifications (email or push)
- Social feeds
- File uploads (audio/video — portfolio is link-only)
- Repeatable portfolio items via `PortfolioItem` table (table exists, **unused**)
- Proficiency display per instrument (column exists, **unused**)
- Dashboard (PRD describes `/dashboard`; **not implemented**)
- Compensation filter on `/gigs` (PRD mentions; **not implemented**)
- Remote toggle filter on either directory (PRD mentions; **not implemented**)
- Search-by-keyword input (PRD mentions; **not implemented**)

---

## 5. Current Tech Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router) | `^16.1.7` |
| Language | TypeScript | `^5.9.2` |
| UI | React | `^19.1.1` |
| Styling | TailwindCSS v4 (`@tailwindcss/postcss`) | `^4.1.13` |
| ORM | Prisma | `^6.16.1` |
| DB | PostgreSQL (Postgres 16 via Docker) | 16 |
| Auth | NextAuth v4 + Prisma Adapter + JWT sessions | `^4.24.11` |
| OAuth | GitHub, Google | — |
| Hosting (intended) | Vercel | — |
| Lint | ESLint + `eslint-config-next` | `^9.35.0` |

Notable patterns:

- **Server Components by default** under `src/app/**`.
- **Server Actions** (`"use server"`) for all mutations (no REST endpoints other than NextAuth's).
- **JWT session strategy** with role refreshed from DB on every JWT callback (see §9 — performance issue flagged).
- **Tailwind v4** consumed via `@import "tailwindcss";` in `src/app/globals.css`. The `tailwind.config.ts` is essentially empty — design tokens live in `globals.css` as utility classes (`.input-base`, `.card`, `.btn-primary`, etc.).
- **No tests.** No Vitest/Jest/Playwright wiring.
- **No CI.** Repo has no `.github/workflows`.
- **`check-db.js`** is a stray utility file at repo root (verify what it does before keeping).
- **`docker-compose.yml`** spins up local Postgres (`postgres:16`, db `gigforge`, user/pass `postgres/postgres`, port `5432`).

---

## 6. Recommended Rebuild Stack

If rebuilding from scratch, **default to keeping** Next.js App Router + Postgres + Prisma — the model and routes fit the framework well. Adjustments worth considering:

| Concern | Current | Recommended Change | Why |
|---|---|---|---|
| Auth | NextAuth v4 | **Auth.js v5 (NextAuth v5)** or **Clerk** | v4 is in maintenance; v5 has cleaner App Router primitives. Clerk removes role/session plumbing entirely. |
| Session strategy | JWT + DB lookup every JWT callback | **DB sessions** OR JWT with role baked at sign-in (no per-request DB hit) | Current code hits DB on every request to refresh role — wasteful. |
| ORM | Prisma | Prisma still fine; consider **Drizzle** if edge runtime needed | Prisma is heavy on cold-start. Edge-friendly alt: Drizzle. |
| Validation | Manual `throw new Error(...)` in server actions | **Zod** schemas shared between client + server | Current validation is ad-hoc, scattered, leaks raw errors to UI. |
| Form handling | Native `<form action={...}>` | Keep native forms; add **`useFormState`** for inline error display | Current errors throw and hit Next.js error boundary. |
| Tag inputs (instruments/genres) | CSV string in a single `<input>` | **Combobox / multi-select with autocomplete** against existing rows | CSV duplicates tags (case-insensitive collisions create dupes — see §18). |
| DB hosting | Local Docker / unspecified prod | **Neon** or **Supabase** Postgres | Free tier, branching, integrates with Vercel. |
| Email contact | `mailto:` only | Keep `mailto:` for MVP; add **Resend** for confirmation later | Avoid building inbox. |
| Image / avatar | None | **Vercel Blob** or **UploadThing** when adding portfolio uploads | Defer until v2. |
| Search | Prisma `where` only | Add **Postgres full-text** or **Meilisearch** when corpus grows | Filters are good enough for MVP. |
| Testing | None | **Vitest** (unit), **Playwright** (e2e) | Add before any rewrite begins. |
| Type-safe envs | None | **`@t3-oss/env-nextjs`** | Prevents missing-env footguns. |
| Rate limiting | None | **Upstash Ratelimit** on mutating server actions | Currently a creator can spam-create gigs. |

If the goal is a **major UX uplift**, consider:

- **shadcn/ui** for accessible component primitives (Dialog, Combobox, Tooltip) — replaces hand-rolled tags.
- **Radix UI** under the hood (shadcn ships it).
- **React Hook Form** for the gig & profile forms — currently stateless `defaultValue` only, no inline validation.

---

## 7. Repository Layout

```
gig-forge/
├── check-db.js                  # Stray utility — audit before keeping
├── docker-compose.yml           # Local Postgres 16
├── eslint.config.mjs
├── middleware.ts                # NextAuth middleware, matches /onboarding/*
├── next.config.ts               # Empty
├── next-env.d.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts           # Empty extend; tokens live in globals.css
├── tsconfig.json
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│       ├── 20260317081258_init/
│       └── 20260317165838_auth/
├── docs/
│   ├── prd.md
│   ├── ui-map.md
│   ├── style-guide.md
│   ├── build-plan.md
│   └── REBUILD.md               # ← this file
└── src/
    ├── auth.ts                  # NextAuthOptions + default export handler
    ├── lib/db.ts                # Prisma singleton
    ├── types/next-auth.d.ts     # Session.user.id + role typing
    └── app/
        ├── layout.tsx           # Root layout, global navbar
        ├── page.tsx             # Landing
        ├── globals.css          # Tailwind import + design tokens
        ├── api/auth/[...nextauth]/route.ts
        ├── signin/
        │   ├── page.tsx
        │   └── SignInButtons.tsx    # client component
        ├── onboarding/role/
        │   ├── page.tsx
        │   └── actions.ts           # setRole(role)
        ├── musicians/
        │   ├── page.tsx             # directory
        │   ├── _ui.tsx              # Chip, SectionCard, PrimaryLink
        │   └── [id]/page.tsx        # public profile
        ├── profile/
        │   ├── _profile-form.tsx    # client form
        │   ├── create/{page,actions}.ts
        │   └── edit/{page,actions}.ts
        └── gigs/
            ├── page.tsx             # directory
            ├── _ui.tsx              # Chip, SectionCard, PrimaryLink (duplicate of musicians/_ui)
            ├── _gig-form.tsx        # gig form (server component)
            ├── create/{page,actions}.ts
            ├── manage/
            │   ├── page.tsx
            │   ├── actions.ts       # closeGig, deleteGig
            │   └── DeleteGigButton.tsx
            └── [id]/
                ├── page.tsx
                └── edit/{page,actions}.ts
```

**Issue**: `musicians/_ui.tsx` and `gigs/_ui.tsx` are **byte-for-byte duplicates**. Move to `src/components/ui/`.

---

## 8. Environment & Local Setup

### Required env vars

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gigforge
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random>
GITHUB_ID=<oauth client id>
GITHUB_SECRET=<oauth client secret>
GOOGLE_CLIENT_ID=<oauth client id>
GOOGLE_CLIENT_SECRET=<oauth client secret>
```

**Issue**: `src/auth.ts` falls back to `""` for OAuth env vars rather than failing fast. Replace with a typed env loader (`@t3-oss/env-nextjs` + Zod).

### Boot sequence

```bash
docker compose up -d            # Postgres on :5432
npm install
npm run prisma:generate
npm run prisma:migrate          # applies init + auth migrations
npm run dev                     # http://localhost:3000
```

Scripts in `package.json`:

```
dev               next dev
build             next build
start             next start
lint              next lint
prisma:validate   prisma validate
prisma:generate   prisma generate
prisma:migrate    prisma migrate dev
```

**Missing scripts (recommended to add):** `typecheck`, `format`, `test`, `test:e2e`, `db:seed`, `db:reset`.

---

## 9. Authentication & Authorization

### Providers

- GitHub OAuth
- Google OAuth

`pages.signIn` → `/signin` (custom UI).

### Session strategy

JWT (`session: { strategy: "jwt" }`).

### JWT callback (`src/auth.ts:24-35`)

```ts
async jwt({ token, user }) {
  if (user) token.role = (user as { role?: string | null }).role ?? null;
  if (token.sub) {
    const dbUser = await db.user.findUnique({
      where: { id: token.sub },
      select: { role: true },
    });
    token.role = dbUser?.role ?? null;
  }
  return token;
}
```

**Issue (performance)**: This runs a Postgres SELECT on **every** JWT callback invocation, which fires for every authenticated server-rendered request. Solutions:

1. Cache role in the JWT and re-issue only on role change (`/onboarding/role` triggers `update()`).
2. Switch to DB session strategy and read role from the session.
3. Add Redis/Upstash session cache.

### Authorization model

- **Public reads**: landing, all directories, all detail pages, signin.
- **Authenticated only**: `/onboarding/role`, `/profile/*`, `/gigs/create`, `/gigs/[id]/edit`, `/gigs/manage`.
- **Role-gated**: `MUSICIAN` for `/profile/*`; `CREATOR` for all gig-mutation pages.
- **Owner-gated**: gig edit/close/delete checks `gig.creatorId === session.user.id`.

Every authenticated server action re-checks session + role inline (no centralized helper). **Recommend** introducing `requireUser({ role?: UserRole })` and `requireGigOwnership(gigId)` helpers in `src/lib/auth-guards.ts`.

### Middleware

`middleware.ts` only protects `/onboarding/:path*`. Everything else does its own session check inside the page/action. **Recommend** expanding the matcher and using middleware as a coarse gate, with fine-grained role checks remaining in the handlers.

### Session type augmentation (`src/types/next-auth.d.ts`)

```ts
interface Session {
  user: { id: string; role: string | null } & DefaultSession["user"];
}
interface JWT { role?: string | null; }
```

Roles are `"MUSICIAN" | "CREATOR" | null`. Null = freshly signed up, has not completed `/onboarding/role`.

---

## 10. Data Model (Full Schema)

Source: `prisma/schema.prisma`. Verbatim model summary with annotations.

### Enums

```prisma
enum UserRole         { MUSICIAN  CREATOR }
enum CompensationType { PAID  UNPAID  NEGOTIABLE }
enum ProjectType      { FILM  LIVE_EVENT  PODCAST  GAME  YOUTUBE  OTHER }
```

### `User`

- `id` cuid PK
- `email` unique, required
- `name` optional
- `role` `UserRole?` — **nullable** so freshly-signed-in users can pick a role
- `emailVerified DateTime?`, `image String?` — NextAuth columns
- `createdAt`, `updatedAt`
- Relations: `MusicianProfile?` (1:1), `Gig[]` (1:N as creator), `Account[]`, `Session[]`

### `Account`, `Session`, `VerificationToken`

Standard NextAuth Prisma adapter tables. `Account` keyed by `(provider, providerAccountId)`. Cascade-deleted with user.

### `MusicianProfile`

| Field | Type | Notes |
|---|---|---|
| `id` | cuid PK | |
| `userId` | `String @unique` | 1:1 with `User` |
| `displayName` | `String` | Required |
| `bio` | `String?` | |
| `school` | `String?` | |
| `location` | `String?` | |
| `isRemote` | `Boolean` default `true` | |
| `seekingPaid` | `Boolean` default `true` | |
| `seekingUnpaid` | `Boolean` default `true` | |
| `yearsExperience` | `Int?` | |
| `availabilityText` | `String?` | Free-form |
| `contactEmail` | `String?` | Required at the application layer (not DB) |
| `instagramUrl`, `youtubeUrl`, `spotifyUrl`, `soundcloudUrl`, `websiteUrl` | `String?` | All optional |
| `createdAt`, `updatedAt` | | |

**Issue**: `contactEmail` is application-required but DB-nullable. Make it `NOT NULL` after backfilling, or accept that profiles without contact email cannot be contacted (current UI handles that branch).

### `Instrument` / `Genre`

- `id` cuid PK
- `name` `String` — **no uniqueness constraint** ⇒ duplicates possible.

**Issue (critical)**: No `@@unique` on `name`. The CSV ingestion code uses `findFirst({ where: { name } })`, which is case-sensitive. Result: `"Guitar"`, `"guitar"`, `" Guitar "` create three rows. Rebuild must: (a) `@@unique` on `name`, (b) normalize on insert (`trim`, lowercase or title-case), (c) consider a `slug` column.

### `MusicianInstrument` / `MusicianGenre`

Join tables. `MusicianInstrument` has an unused `proficiency String?`. **Issue**: no `@@unique([musicianProfileId, instrumentId])` — duplicate joins possible.

### `PortfolioItem`

Defined but **never written or read by any code**. Either wire it up (gallery of titled links) or remove. The current UI uses the five flat URL columns on `MusicianProfile`.

### `Gig`

| Field | Type | Notes |
|---|---|---|
| `id` | cuid PK | |
| `creatorId` | FK → `User.id` | |
| `title`, `description` | `String` | Required |
| `projectType` | `ProjectType` | Required |
| `location` | `String?` | |
| `isRemote` | `Boolean` default `true` | |
| `compensationType` | `CompensationType` | Required |
| `compensationDetails` | `String?` | |
| `deadline` | `DateTime?` | |
| `status` | `String` default `"OPEN"` | Stringly-typed; should be an enum `GigStatus { OPEN, CLOSED }` |
| `createdAt`, `updatedAt` | | |

### `GigInstrument` / `GigGenre`

Join tables, same shape and same uniqueness gap as musician joins.

### Indexing recommendations (currently missing)

- `Instrument.name`, `Genre.name` — unique indexes.
- `Gig (status, createdAt DESC)` — directory query.
- `MusicianProfile (updatedAt DESC)` — directory ordering.
- All FK columns should have explicit indexes (Prisma generates these for `@relation` only on some adapters; verify).

---

## 11. Routing Map

```
/                         landing (server, anonymous-ok)
/signin                   custom signin UI
/api/auth/[...nextauth]   NextAuth handler

/onboarding/role          role selection (auth required, protected by middleware)

/musicians                directory (public)
/musicians/[id]           public musician profile

/profile/create           MUSICIAN only
/profile/edit             MUSICIAN only

/gigs                     directory (public, status=OPEN only)
/gigs/[id]                gig detail (public)
/gigs/create              CREATOR only
/gigs/[id]/edit           CREATOR + owner only
/gigs/manage              CREATOR only
```

Search params:

- `/musicians?instrument=<name>&genre=<name>`
- `/gigs?projectType=<enum>&instrument=<name>&genre=<name>`
- `/signin?callbackUrl=<url>`

---

## 12. Page-by-Page Specification

For each page: route, access, data fetched, layout, components, behaviors.

### 12.1 `/` — Landing (`src/app/page.tsx`)

- Server component. Reads `getServerSession`; if session has user but no role, **redirects to `/onboarding/role`**.
- Reads `MusicianProfile` existence for the signed-in musician to decide whether the "For musicians" CTA says *Create* or *Edit*.
- Two-column hero on `md+`: copy + dual CTA on the left; two illustrative example cards (musician + gig, hand-coded) on the right.
- Three-up info row at the bottom: *How it works*, *Built for campuses*, *MVP, not a social network*.
- Primary CTAs route to `/musicians` and `/gigs`. Secondary CTAs differ per role (musician sees profile path, creator sees `/gigs/create`).

### 12.2 `/signin` (`src/app/signin/page.tsx`)

- Reads `callbackUrl` from search params, defaults to `/`.
- Renders centered card with two buttons (GitHub primary, Google secondary) via `SignInButtons.tsx` client component using `signIn(provider, { callbackUrl })`.
- Includes back-to-home link.

### 12.3 `/onboarding/role` (`src/app/onboarding/role/page.tsx`)

- Auth required. If role already set, redirects to `/`.
- Renders two side-by-side `<form action>` blocks, each invoking inline server action calling `setRole("MUSICIAN" | "CREATOR")`.
- After role set, redirects to `/`.
- **Issue**: role is one-time. There is no UI to switch roles, change role, or hold both roles. PRD does not allow dual role; if a user is both musician and creator this fails. Consider supporting both.

### 12.4 `/musicians` — Directory (`src/app/musicians/page.tsx`)

- Search params: `instrument`, `genre` (both string, both optional).
- Data fetched (parallel):
  - `db.instrument.findMany({ orderBy: { name: "asc" }, select: { name: true } })`
  - `db.genre.findMany(...)`
  - `db.musicianProfile.findMany({ where: { instruments: { some: { instrument: { name: instrument } } }, genres: { some: { genre: { name: genre } } } }, include: { instruments, genres }, orderBy: { updatedAt: "desc" } })`
- Header: title + subtitle + conditional `Create Profile` CTA (shown when anonymous or `role === MUSICIAN`).
- Filter card: 3-column form (`method="GET"`, action `/musicians`) — instrument select, genre select, Apply button + Clear link.
- Result grid: 1/2/3 cols responsive. Each card is a `<Link>` wrapping name + location + remote badge + instrument chips (max 3) + genre chips (max 3) + 160-char clamped bio + `View Profile →`.
- Empty state: card-styled, contextual copy + Clear Filters or Create Profile CTA.
- **Issue**: filters list **every** instrument/genre — no popularity ordering, no debounced search. With 1k+ tags this select degrades. Replace with combobox + autocomplete.

### 12.5 `/musicians/[id]` — Public profile

- Validates id length `>0 && <64`, else `notFound()`.
- Loads profile with full instruments + genres include. `notFound()` if missing.
- Layout: 2-col `lg`, 1-col mobile. Back link at top.
- Left column (`lg:col-span-2`):
  - **Profile** SectionCard: name, location, remote-friendly indicator, bio, instruments & genres as chip rows, experience years, availability text.
  - **Portfolio links** SectionCard: list of `{ Website, YouTube, SoundCloud, Spotify, Instagram }` ordered, each row shows label + external arrow + raw URL.
- Right aside:
  - **Contact** SectionCard: contact email + `mailto:` button styled like `btn-primary`.
  - **Work preferences** SectionCard: remote chip + paid/unpaid chips.

### 12.6 `/profile/create` and `/profile/edit`

- Both gated `MUSICIAN`. Edit pre-populates from existing `MusicianProfile` including instruments/genres joined back into CSV strings (`"Guitar, Vocals"`).
- Render shared `ProfileForm` client component with `mode` and `initial` + bound server action.

**`ProfileForm`** sections (see `src/app/profile/_profile-form.tsx`):

1. **Basic info** — `displayName*`, `bio`, `school`, `location`
2. **Work preferences** — `isRemote` (checkbox, default true), `seekingPaid` (default true), `seekingUnpaid` (default true), `yearsExperience` (numeric text input), `availabilityText`
3. **Instruments & genres** — two CSV `<input>` fields (`instrumentsCsv*`, `genresCsv*`)
4. **Portfolio links** — `youtubeUrl`, `soundcloudUrl`, `spotifyUrl`, `websiteUrl`, `instagramUrl` (all optional, no URL validation)
5. **Contact** — `contactEmail*` (`type="email"` only)

Footer: Cancel link (to `/`) + Save button. Client state: `useState(saving)` toggles label to "Saving…" and disables button.

**Issues**:

- CSV input creates duplicate tags (see §10).
- No URL validation beyond browser default — strings like `"@hello"` pass.
- No length caps — bio could be a megabyte.
- Errors thrown from server actions surface as Next.js error boundaries — no inline UI.

### 12.7 `/gigs` — Directory (`src/app/gigs/page.tsx`)

- Same pattern as `/musicians` directory. Search params: `projectType`, `instrument`, `genre`.
- `where.status = "OPEN"` (hard-coded filter).
- 4-column filter row on desktop. Compensation type is **not** filterable (PRD said it should be — flagged in §4).
- Card shows title, projectType label, comp type badge, location/remote, instrument chips, genre chips, 170-char clamped description.
- Empty state shows Post-a-Gig CTA only when anonymous or creator.

### 12.8 `/gigs/[id]` — Detail

- Validates id length. `notFound()` if missing.
- Loads gig + creator (name, email) + instruments + genres.
- Left column SectionCard: title, status badge (uses `badge-status-open` / `badge-status-closed`), project type, location/remote, comp type, description (whitespace-pre-wrap), instruments + genres chip groups, compensation details, deadline (`toLocaleDateString`).
- Right aside SectionCard: creator name + email + `mailto:` button with subject `GigForge: <title>` URL-encoded.

### 12.9 `/gigs/create` — Form

Renders `GigForm` (server component) bound to `createGig` action. Sections:

1. **Basic project info** — `title*`, `description*` (textarea), `projectType*` (enum select)
2. **Requirements** — `instrumentsCsv`, `genresCsv`
3. **Logistics** — `location`, `isRemote` (default true), `deadline` (`type="date"`)
4. **Compensation** — `compensationType*` (enum select), `compensationDetails`

Cancel link → `/gigs`. Submit label: `Publish Gig`.

### 12.10 `/gigs/[id]/edit` — Edit form

Same `GigForm`, hydrated from existing record. Deadline pre-fills as `yyyy-mm-dd` slice. Cancel → `/gigs/manage`.

### 12.11 `/gigs/manage` — Creator gig list

- CREATOR only. Lists all gigs `where creatorId = me`, regardless of status.
- Each row: title + status badge, project/location/comp summary, top-3 instrument and genre chips, clamped description (120 char), action cluster: Edit / Mark filled (only if OPEN, server action `closeGig`) / Delete (client confirm + `useTransition` + server action `deleteGig`) / View.
- Empty state: Post-a-gig CTA.

---

## 13. Server Actions / API Surface

All mutations go through Server Actions. Public read API is **only** what server components fetch directly via Prisma.

| Action | Location | Args | Effect | Auth |
|---|---|---|---|---|
| `setRole(role)` | `app/onboarding/role/actions.ts` | `"MUSICIAN" \| "CREATOR"` | Update `User.role`; redirect `/` | user |
| `createMusicianProfile(fd)` | `app/profile/create/actions.ts` | FormData | Validate, upsert instruments/genres, create profile, redirect `/profile/edit` | MUSICIAN |
| `updateMusicianProfile(fd)` | `app/profile/edit/actions.ts` | FormData | Validate, delete + recreate instrument/genre joins, update profile, redirect `/profile/edit` | MUSICIAN |
| `createGig(fd)` | `app/gigs/create/actions.ts` | FormData | Validate, upsert tags, create gig, redirect `/gigs/[id]` | CREATOR |
| `updateGig(gigId, fd)` | `app/gigs/[id]/edit/actions.ts` | id + FormData | Validate ownership, recreate joins, update, redirect `/gigs/[id]` | CREATOR + owner |
| `closeGig(gigId)` | `app/gigs/manage/actions.ts` | id | Set `status="CLOSED"`, redirect `/gigs/manage` | CREATOR + owner |
| `deleteGig(gigId)` | `app/gigs/manage/actions.ts` | id | Cascade-delete joins then gig | CREATOR + owner |

The PRD's documented REST endpoints (`POST /api/profile`, `GET /api/musicians`, etc.) **do not exist**. Only `/api/auth/[...nextauth]` exists.

### Standard helpers used inside actions

Each action redefines three helpers (`parseCsv`, `nonEmptyOrNull`, `strOrEmpty`). **Issue**: duplication — extract to `src/lib/form-utils.ts`.

```ts
function parseCsv(input: string) { /* split, trim, dedupe-whitespace */ }
function nonEmptyOrNull(v): string | null { /* "" -> null */ }
function strOrEmpty(v): string { /* coerce */ }
```

### Tag upsert pattern (used in 4 places — extract)

```ts
const ensured = await Promise.all(
  names.map(async (name) => {
    const existing = await tx.instrument.findFirst({ where: { name } });
    return existing ?? tx.instrument.create({ data: { name } });
  }),
);
```

This is **not race-safe** and **case-sensitive**. Replace with `upsert` against a unique `name` index after normalization (`name = name.trim().toLowerCase()` or title-case).

---

## 14. Business Rules & Validation

### Musician profile

- `displayName`: required, no length cap (recommend 80 chars).
- `contactEmail`: required at app layer.
- At least one instrument (CSV non-empty after parse).
- At least one genre.
- `yearsExperience`: optional; if provided must parse as integer.
- All URL fields: optional, **no protocol or hostname validation**.

### Gig

- `title`, `description`, `projectType`, `compensationType`: required.
- `deadline`: optional; if provided must be a valid date.
- Enum coercion: `projectType` and `compensationType` are passed to Prisma cast `as never`. **Issue**: invalid enum strings will throw at runtime rather than yield a friendly error. Validate against the enum list in Zod.

### Status transitions

- `OPEN` → `CLOSED` (manual via "Mark filled").
- No reverse; rebuild should allow `CLOSED → OPEN` toggle.

### Visibility

- All musician profiles visible publicly (no `published` flag). Recommend adding `isPublic` boolean defaulting `true` and allowing the musician to hide.
- Gigs: only `OPEN` listed in directory; both states reachable by URL.

---

## 15. Visual Design System

### Brand feel (per `docs/style-guide.md`)

Modern, creative, energetic, student-friendly, polished but not corporate. Dark mode default. Avoid crypto-dashboard / pure-grayscale / over-animated looks. One strong accent.

### Theming

- **Dark mode only.** `<html className="dark">` hard-coded in `RootLayout`. No light mode toggle.
- Background: `bg-zinc-950`. Body text: `text-zinc-100`. Antialiased.
- Accent: **violet-500** (`rgb(139 92 246)` — used in focus rings, primary buttons, status accents, link hovers).
- Status accents: emerald-400/300 for online/open indicators, amber-200 for closed, red-300/900 for destructive buttons.

### Typography

- System font stack via Tailwind defaults (no custom font yet — recommend Geist or Inter).
- Hierarchy:
  - H1 page: `text-2xl font-semibold tracking-tight text-zinc-50` (landing hero scales to `text-3xl md:text-4xl`).
  - Section H2: `text-sm font-semibold text-zinc-200`.
  - Body: `text-sm text-zinc-300` (primary), `text-zinc-400` (secondary), `text-zinc-500` (meta).
- Tracking: `tracking-tight` on display; `tracking-[0.2em]` uppercase eyebrows; `tracking-wide` on badges.

### Spacing & layout

- Page max width: `max-w-6xl` (≈1152px) for directories and landing, `max-w-4xl` for manage, `max-w-3xl` for forms, `max-w-md / max-w-xl` for auth and role selection.
- Vertical rhythm: `py-6` page padding, `space-y-8` between form sections, `mt-2/3/4/8` for label/field gaps.
- Grid breakpoints:
  - sm: 1-2 columns
  - md: hero split (`md:grid-cols-[minmax(0,2fr),minmax(0,1.4fr)]`)
  - lg: 2/3 + 1/3 detail-page split (`lg:grid-cols-3`)

### Color tokens in use

| Token | Usage |
|---|---|
| `zinc-50` | Headings, brand wordmark |
| `zinc-100` | Body emphasis, button labels (on dark bg) |
| `zinc-200` | Section headings, chip text |
| `zinc-300` | Body copy |
| `zinc-400` | Secondary copy, helper text |
| `zinc-500` | Meta, placeholders |
| `zinc-700` | Dividers (subtle) |
| `zinc-800` | Borders, card edges |
| `zinc-900` | Card secondary surfaces |
| `zinc-950` | App background, card bg with alpha |
| `violet-200/300/500` | Accents, primary CTA, focus ring |
| `emerald-300/400/500/900` | Open status, online indicator |
| `amber-200/900` | Closed status |
| `red-300/800/900/950` | Destructive (Delete) |

### Radius

- Cards: `rounded-2xl` (default), `rounded-3xl` (hero feature cards).
- Inputs / buttons / chips: `rounded-xl` for buttons & inputs, `rounded-full` for badges/chips.

### Shadow

Custom 2-layer shadow on cards:
```
shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_4px_24px_rgba(0,0,0,0.4)]
```
Hero card:
```
shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_30px_80px_rgba(0,0,0,0.6)]
```

### Component tokens (`src/app/globals.css`)

```css
.input-base   { @apply mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2.5 text-zinc-100 placeholder:text-zinc-500 shadow-sm transition-colors focus:border-violet-500/70 focus:outline-0; }
.select-base  { /* same as input-base */ }
.btn-primary  { @apply inline-flex items-center justify-center rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-sm transition-colors hover:bg-violet-400 disabled:pointer-events-none disabled:opacity-60; }
.btn-secondary{ @apply inline-flex items-center justify-center rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-900/50; }
.btn-ghost    { @apply rounded-xl border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-800/50; }
.card         { rounded-2xl border zinc-800 bg-zinc-950/50 + soft shadow }
.card-hover   { same as .card + hover border/bg transitions }
.badge-status-open   { emerald palette, uppercase pill }
.badge-status-closed { amber palette, uppercase pill }
.link-back    { @apply text-sm text-zinc-400 transition-colors hover:text-zinc-200; }
```

Global focus ring (any element):
```css
:focus-visible { outline: 2px solid rgb(139 92 246); outline-offset: 2px; }
```

### Iconography

No icon library. Inline arrows (`→`, `↗`, `←`), dot separator `•`. **Recommend** `lucide-react` for consistency in rebuild.

### Animation

Only `transition-colors` on hovers/focuses. No motion library. The PRD/style guide explicitly say *do not over-animate*.

### Accessibility notes

- Focus ring is global (good).
- No `aria-label` on icon-only links (e.g. back arrow) — fix.
- Color-only status differentiation (open vs closed) — text label is present, so OK.
- Forms lack `id`/`htmlFor` pairing on labels. **Fix**: wire `<label htmlFor>` to input `id`.
- Dark mode only — provide `prefers-color-scheme` support OR document the constraint.

---

## 16. Component Library

Hand-rolled, minimal. Mostly inline JSX. Reusable bits live in `_ui.tsx` files (duplicated between `musicians/` and `gigs/`).

### Existing reusable components

| Component | File | Purpose |
|---|---|---|
| `<Chip>` | `_ui.tsx` (×2 dupes) | Pill badge for instruments/genres |
| `<SectionCard title>` | `_ui.tsx` (×2 dupes) | Card with a heading + body slot |
| `<PrimaryLink href>` | `_ui.tsx` (×2 dupes) | Link styled as primary button |
| `<ProfileForm>` | `profile/_profile-form.tsx` | Client-side musician form |
| `<GigForm>` | `gigs/_gig-form.tsx` | Server-side gig form |
| `<SignInButtons callbackUrl>` | `signin/SignInButtons.tsx` | OAuth client buttons |
| `<DeleteGigButton gigId>` | `gigs/manage/DeleteGigButton.tsx` | Confirm + `useTransition` delete |
| Navbar | inline in `app/layout.tsx` | App-wide top bar |

### Recommended consolidation for rebuild

Move all primitives to `src/components/ui/`:

- `button.tsx` (`variant: primary | secondary | ghost | destructive`)
- `chip.tsx`
- `card.tsx` (`Card`, `CardHeader`, `CardBody`, `CardFooter`)
- `section-card.tsx`
- `input.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx`
- `badge-status.tsx`
- `empty-state.tsx`
- `filter-bar.tsx`
- `tag-input.tsx` (autocomplete combobox replacing CSV inputs)
- `navbar.tsx`
- `back-link.tsx`

Use **shadcn/ui** as the foundation. Compose existing visual tokens on top.

---

## 17. State, Caching, and Data Fetching

- All reads are **server-side** via Prisma in server components — no client-side fetching.
- No SWR / React Query / Apollo. None needed at current scope.
- No Next.js `revalidate` on routes (so every request hits the DB). Acceptable for now; consider `revalidate = 60` on directory pages once a CDN is in front.
- No mutation cache invalidation calls (`revalidatePath` / `revalidateTag`) — current code just `redirect`s after mutations. **Issue**: if a directory page is cached, edits won't appear until refresh. Add `revalidatePath('/musicians')` etc. after profile create/update; `revalidatePath('/gigs')` after gig CRUD.
- Search filters are GET-query-based — bookmarkable + shareable.
- No optimistic UI. `<DeleteGigButton>` uses `useTransition` for pending state but no rollback.

---

## 18. Known Issues & Technical Debt

A prioritized list. Each entry is an opportunity to fix on rebuild.

### Critical

1. **Tag duplication on `Instrument` and `Genre`.** No `@@unique` on `name`; `findFirst` is case-sensitive. Two musicians typing `"Guitar"` and `"guitar"` create separate tags, breaking filters silently.
2. **No tag normalization.** `parseCsv` trims and collapses whitespace but does not lowercase or canonicalize.
3. **No CSRF protection** on server actions explicitly — Next.js provides some, but custom hardening (origin check, double-submit) is missing.
4. **`@@unique` missing on join tables.** A musician edit re-runs the upsert pattern: delete all joins, recreate. That patch hides the issue, but a malformed concurrent request could still produce duplicates.
5. **NextAuth v4 JWT callback DB-hits every request** (see §9). Cache or migrate to v5.
6. **`emailVerified` is collected but never enforced.** Anyone with an OAuth account can post unlimited gigs / create a profile. Add rate limiting and optionally email verification.
7. **Throwing `Error("…")` from server actions** crashes into Next.js error boundary instead of returning inline form errors. Migrate to `useFormState` + return objects.

### High

8. **Duplicate `_ui.tsx`** between `musicians/` and `gigs/`. Consolidate.
9. **CSV input UX is bad.** Replace with autocomplete multi-select.
10. **`tailwind.config.ts` is empty.** Tokens are bolted into globals.css. Move palette + spacing to config or a `theme.css` with CSS custom properties.
11. **No URL validation on portfolio links.** Fix with Zod `.url()`.
12. **`status` on `Gig` is a string, not enum.** Convert to `enum GigStatus { OPEN, CLOSED }`.
13. **`PortfolioItem` is dead code.** Either implement repeatable links UI or drop the table.
14. **`MusicianInstrument.proficiency`** column is dead. Use it or drop it.
15. **Hard-coded role one-shot.** No way to switch roles or be both. Refactor as a `MUSICIAN`/`CREATOR` capability set on `User` rather than a single enum.
16. **`middleware.ts` only protects `/onboarding/*`** but every other authenticated route relies on per-page checks. Expand matcher.
17. **`check-db.js`** stray script at repo root. Audit; either move into `scripts/` or remove.

### Medium

18. **No `revalidatePath`** after mutations.
19. **No DB seed.** New env starts with empty instrument/genre lists. Provide a seed script.
20. **Forms lack `id`/`htmlFor` pairing.** Accessibility regression.
21. **No `sitemap.xml` / `robots.txt`.** Add for SEO.
22. **`metadata` minimal.** No `openGraph`, no `twitter`, no per-page meta.
23. **No 404 / error.tsx pages** in the route tree besides framework defaults.
24. **No logging / error reporting.** Add Sentry or similar.
25. **Login providers fall back to `""`** instead of failing fast on missing env.

### Low

26. **Directory ordering**: musicians by `updatedAt`, gigs by `createdAt`. Inconsistent. Pick one strategy (e.g., always `updatedAt DESC`).
27. **Chip cap of 3** silently hides additional tags. No `+N more` indicator.
28. **Description clamps** at 120/140/160/170 chars in different places. Pick one.
29. **`signin/page.tsx`** is async but does no async work besides `await searchParams`. Fine — but tighten.
30. **Hero example cards on landing** are static mock content — fine for MVP, but consider rendering real recent profiles/gigs once any exist.

---

## 19. Security Checklist

What to verify (or fix) during rebuild:

- [ ] All authenticated server actions re-check session + role inside the handler (currently yes — keep).
- [ ] Gig mutations verify `creatorId === session.user.id` (currently yes — keep).
- [ ] Replace `as never` enum casts with Zod parses to prevent enum injection.
- [ ] Add rate limiting on mutating actions (Upstash Ratelimit).
- [ ] CSRF: confirm Next.js server-action origin protections are on; add a custom `Origin` check on sensitive actions if needed.
- [ ] Sanitize / validate all URLs (`https?:` only); render with `rel="noreferrer noopener"` (current code uses `noreferrer` only — add `noopener`).
- [ ] Validate `contactEmail` server-side with a real regex (current code only checks "not empty").
- [ ] `mailto:` URL injection: gig detail builds `mailto:` with `encodeURIComponent(title)` (good); musician profile just inlines email (low risk; review).
- [ ] No XSS surface — all rendering uses React JSX, no `dangerouslySetInnerHTML` anywhere (verify).
- [ ] Set up Content Security Policy headers via `next.config.ts` `headers()`.
- [ ] Set `Strict-Transport-Security` on prod.
- [ ] Secrets: confirm `.env*` is gitignored; rotate any test creds before going public.
- [ ] OAuth callback allowlist matches production domain only.

---

## 20. Performance Notes

- **Cold DB call on every authenticated render** (JWT callback). Single biggest perf bug in the app.
- Directories use `findMany` with `include`. With 1000s of profiles this will degrade. Add `take`, pagination, and ideally cursor-based `cursor: { id }`.
- **N+1 risk**: not present — uses `include` correctly.
- **No DB indexes** beyond Prisma defaults. Add the ones suggested in §10.
- Filter lists (`db.instrument.findMany()` and `db.genre.findMany()`) fetch every row on every directory render. Cache or paginate when corpus grows.
- Server Components run on the Node runtime — fine. If moving to Edge for global latency, swap Prisma for Drizzle or use Prisma's `accelerate`.

---

## 21. Testing Strategy (Missing — Recommended)

There are currently **zero tests**. Rebuild plan:

- **Unit**: Vitest for `parseCsv`, validation helpers, business rules.
- **Integration**: Vitest + a test Postgres (or `pg-mem`) for server actions.
- **E2E**: Playwright covering the four core flows in §2. Run against a seeded DB.
- **Visual regression**: optional Playwright + `@playwright/test-snapshots`.
- **CI**: GitHub Actions matrix on `npm run lint && npm run typecheck && npm run test && npm run build`.

Aim for ≥70% coverage on `src/app/**/actions.ts` and the server action helpers before shipping.

---

## 22. Deployment

- **Target**: Vercel.
- **DB**: any managed Postgres (Neon, Supabase, RDS). Set `DATABASE_URL`.
- **Migrations**: run `prisma migrate deploy` in build step (`npm run build` does not currently run migrations — add a `vercel-build` script or a migration step in your CI).
- **OAuth callback URLs**:
  - GitHub: `https://<domain>/api/auth/callback/github`
  - Google: `https://<domain>/api/auth/callback/google`
- **`NEXTAUTH_URL`** must match the public URL.
- **`NEXTAUTH_SECRET`** must be set in prod.
- Vercel Postgres or Neon `?pgbouncer=true&connection_limit=1` for serverless.

---

## 23. Observability

Currently absent. Add:

- **Sentry** (`@sentry/nextjs`) for error capture in server actions + client.
- **Vercel Analytics** (`@vercel/analytics`) for traffic.
- **Log drains** for structured logging (Logtail / Axiom).
- Track key events:
  - `profile_created`, `profile_edited`, `gig_created`, `gig_edited`, `gig_closed`, `gig_deleted`, `contact_clicked` (musician + gig).
- Define a **success metric** dashboard: weekly active profiles, gigs posted, contact clicks (proxy for matches).

---

## 24. Rebuild Phased Plan

A pragmatic order if redoing this from scratch with the lessons above baked in.

### Phase 0 — Decisions (½ day)

- Lock stack changes (Auth.js v5? Clerk? Drizzle?).
- Pick component library (shadcn/ui assumed).
- Confirm dark-only vs adding light mode.
- Confirm whether to support dual-role users.

### Phase 1 — Foundation (1–2 days)

1. Scaffold Next.js 16 App Router + TS + Tailwind v4 + ESLint + Prettier + Vitest + Playwright.
2. Add `@t3-oss/env-nextjs` and define typed env.
3. Add Prisma with **new schema**: enums for `GigStatus`, unique constraints + slug on tags, optional drop of `PortfolioItem` and `proficiency` (or implement them).
4. Wire Auth.js v5 with GitHub + Google providers + Prisma adapter + DB sessions OR JWT-without-per-request-DB-hit.
5. Seed script for instruments and genres (curated list of ~30 instruments + 30 genres).
6. CI workflow.

### Phase 2 — Visual System (1 day)

1. Bring over palette to `tailwind.config.ts` and `globals.css` CSS variables.
2. Port `.input-base`, `.btn-primary`, etc., into shadcn components.
3. Build `Navbar`, `EmptyState`, `Chip`, `SectionCard`, `Card`, `BackLink`, `FilterBar`, `TagInput` (autocomplete), `BadgeStatus`.
4. Storybook (optional) or a `/dev/ui` page to QA all components.

### Phase 3 — Musician Flow (2 days)

1. `/onboarding/role` (with role-switch later if approved).
2. `/profile/create` and `/profile/edit` with `useFormState` + Zod + autocomplete tags.
3. `/musicians` directory + filters (instrument, genre, remote, paid/unpaid) + pagination.
4. `/musicians/[id]` public profile.

### Phase 4 — Creator Flow (2 days)

1. `/gigs/create`, `/gigs/[id]/edit`, `/gigs/manage` with status enum + ownership guards.
2. `/gigs` directory + filters (projectType, instrument, genre, compensationType, remote).
3. `/gigs/[id]` detail.

### Phase 5 — Quality Bar (1–2 days)

1. `revalidatePath` after every mutation.
2. Inline form errors via `useFormState`.
3. Add Sentry + analytics.
4. SEO: metadata per page, sitemap, robots.
5. Rate limit mutating actions.
6. Accessibility audit (labels, focus, contrast).

### Phase 6 — Launch

1. Migration plan from existing DB (or fresh start).
2. Domain + OAuth allowlist.
3. Production verification of all four core flows.

---

## 25. Open Product Decisions

Decisions worth making **before** the rebuild begins, not during:

- **Dual roles?** Should a user be both musician and creator?
- **Profile visibility?** Default public — should there be a "hidden" state during editing?
- **Closed-gig visibility?** Currently hidden from `/gigs` but URL-reachable. Show "Filled" state in directory greyed out?
- **Multi-school targeting?** PRD says "university communities" but there's no school filter. Add filter, school taxonomy, or `.edu` requirement?
- **Email vs in-app contact?** MVP is `mailto:`. Keep until v2.
- **Portfolio uploads?** Currently link-only. Adding uploads multiplies cost + moderation surface.
- **Moderation?** No flagging, no reporting, no admin panel. Acceptable for closed beta; required for public launch.
- **Spam controls?** Rate limit + reCAPTCHA on signup if rolling out broadly.
- **Compensation transparency?** Free text. Consider structured `min`/`max` numeric fields.
- **Deadlines?** Should expired gigs auto-close? Daily cron candidate.
- **Search?** Keyword search across title + bio + description is not implemented. Postgres full-text would suffice for v2.

---

## Appendix A — Verbatim Token Reference

```css
/* Card (default surface) */
rounded-2xl border border-zinc-800 bg-zinc-950/50
shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_4px_24px_rgba(0,0,0,0.4)]

/* Card hover */
hover:border-zinc-700 hover:bg-zinc-950/70

/* Chip */
inline-flex items-center rounded-full border border-zinc-800
bg-zinc-950/40 px-2.5 py-1 text-xs text-zinc-200

/* Primary button */
rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-zinc-950
hover:bg-violet-400

/* Secondary button */
rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-200
hover:border-zinc-500 hover:bg-zinc-900/50

/* Ghost button (small) */
rounded-xl border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200
hover:border-zinc-500 hover:bg-zinc-800/50

/* Destructive (delete) */
rounded-xl border border-red-900/60 bg-red-950/30 px-3 py-1.5 text-xs font-semibold text-red-300
hover:border-red-800 hover:bg-red-950/50

/* Input / select */
mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2.5
text-zinc-100 placeholder:text-zinc-500 shadow-sm transition-colors
focus:border-violet-500/70 focus:outline-0

/* Status: open */
rounded-full border border-emerald-900/50 bg-emerald-950/40 px-2.5 py-1
text-xs font-medium uppercase tracking-wide text-emerald-200

/* Status: closed */
rounded-full border border-amber-900/50 bg-amber-950/40 px-2.5 py-1
text-xs font-medium uppercase tracking-wide text-amber-200

/* Page max widths */
landing/directories: max-w-6xl   (1152px)
manage:              max-w-4xl   (896px)
forms:               max-w-3xl   (768px)
auth/role:           max-w-md / max-w-xl
```

---

## Appendix B — Suggested New Prisma Schema (Rebuild Target)

Not a final spec — a starting point that incorporates the issues above.

```prisma
enum UserRole         { MUSICIAN  CREATOR }
enum CompensationType { PAID  UNPAID  NEGOTIABLE }
enum ProjectType      { FILM  LIVE_EVENT  PODCAST  GAME  YOUTUBE  OTHER }
enum GigStatus        { OPEN  CLOSED }

model User {
  id            String     @id @default(cuid())
  email         String     @unique
  name          String?
  image         String?
  emailVerified DateTime?
  roles         UserRole[] @default([])      // capability set — supports dual role
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  musicianProfile MusicianProfile?
  gigs            Gig[]
  accounts        Account[]
  sessions        Session[]
}

model Instrument {
  id    String @id @default(cuid())
  name  String @unique
  slug  String @unique
  category String?
  musicians MusicianInstrument[]
  gigs      GigInstrument[]
}

model Genre {
  id   String @id @default(cuid())
  name String @unique
  slug String @unique
  musicians MusicianGenre[]
  gigs      GigGenre[]
}

model MusicianInstrument {
  musicianProfileId String
  instrumentId      String
  proficiency       String?
  @@id([musicianProfileId, instrumentId])
}

model MusicianGenre {
  musicianProfileId String
  genreId           String
  @@id([musicianProfileId, genreId])
}

model Gig {
  id                  String @id @default(cuid())
  creatorId           String
  title               String
  description         String
  projectType         ProjectType
  location            String?
  isRemote            Boolean @default(true)
  compensationType    CompensationType
  compensationDetails String?
  deadline            DateTime?
  status              GigStatus @default(OPEN)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  @@index([status, createdAt(sort: Desc)])
}
```

---

## Appendix C — Glossary

- **Role** — `MUSICIAN` or `CREATOR`. Currently single-valued.
- **Tag** — An `Instrument` or `Genre`.
- **CSV input** — Comma-separated tag string in the form. Parsed server-side.
- **Directory** — Public listing page (`/musicians`, `/gigs`).
- **Manage page** — Creator-only list of own gigs at `/gigs/manage`.
- **Contact** — `mailto:` link. There is no in-app messaging.
- **Status** — `"OPEN" | "CLOSED"` on a gig. Set manually by the creator.

---

*End of REBUILD.md — keep in sync with the actual code as the rebuild progresses.*
