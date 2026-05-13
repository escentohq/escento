# PRODUCT.md — Motivo

## What Motivo is

A directory + listings platform connecting **student musicians** with **student creators** (film students, podcasters, YouTubers, indie game devs, event organizers). It is intentionally **not** a social network: no feeds, no in-app messaging, no payments, no algorithmic recommendations. The MVP optimizes for the shortest possible path from *"I need someone"* to *"I found them and emailed them."*

Tagline: **Take the Stage.**

## Two sides

- **Musicians** create one public profile (instruments, genres, location, availability, portfolio links, contact email).
- **Creators** post structured gig listings (project type, requirements, location/remote, compensation, deadline) and receive direct email contact from interested musicians.

A `User` has exactly one `role` (`MUSICIAN` | `CREATOR`), chosen once at onboarding. There is no mechanism to switch or be both today.

## Personas

- **Alex — Film Student (Creator).** Needs a composer for a 10-minute short. Doesn't know musicians personally. Deadline-driven.
- **Maya — Guitarist (Musician).** Wants gigs and collaborations. Currently relies on word of mouth.

## Core flows

| | Flow |
|---|---|
| **A** | Musician signs up → `/` → Sign in (GitHub or Google) → `/onboarding/role` (choose `MUSICIAN`) → `/profile/create` → `/profile/edit` |
| **B** | Creator signs up → `/` → Sign in → `/onboarding/role` (choose `CREATOR`) → `/gigs/create` → `/gigs/[id]` |
| **C** | Anyone discovers a musician → `/` → `/musicians` (filter by instrument, genre) → `/musicians/[id]` → `mailto:` button |
| **D** | Anyone discovers a gig → `/` → `/gigs` (filter by projectType, instrument, genre) → `/gigs/[id]` → `mailto:` button |
| **E** | Creator manages own gigs → navbar → `/gigs/manage` → Edit / Mark Filled / Delete / View |

**Browsing is anonymous.** No auth required for `/musicians`, `/musicians/[id]`, `/gigs`, `/gigs/[id]`.

## Feature inventory (implemented MVP)

| Feature | Route(s) | Auth | Role |
|---|---|---|---|
| Landing with role-aware CTAs | `/` | Optional | Any |
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
| Manage own gigs | `/gigs/manage` | Required | `CREATOR` |
| Contact via `mailto:` | both detail pages | — | — |

**Visibility rules:**
- Only `status = OPEN` gigs appear in `/gigs` directory.
- Closed gigs remain reachable at `/gigs/[id]` if linked.
- All musician profiles are public — there is no `isPublic` flag today.

## Hard scope boundary — DO NOT build these

The following are **explicitly out of scope** for the MVP. Do not implement them without an explicit, written re-scoping from the user.

- Internal messaging / DMs
- Payments / escrow / Stripe / any billing
- Ratings, reviews, or testimonials
- Recommendation algorithms, match scoring, or ranking beyond `updatedAt DESC`
- Mobile apps (native or PWA install flows)
- Notifications (email digests, push, in-app)
- Social feeds, follows, likes, comments
- File uploads — portfolio is **link-only** (`youtubeUrl`, `soundcloudUrl`, `spotifyUrl`, `websiteUrl`, `instagramUrl`)
- A `/dashboard` route or analytics view
- Compensation filter on `/gigs` (PRD mentions, not built — flagged)
- Remote toggle filter on either directory
- Keyword search input
- `PortfolioItem` repeatable items (table exists in schema, **unused**)
- `MusicianInstrument.proficiency` display (column exists, **unused**)
- Multi-role users / role switching

If a user request implies any of the above, **stop and confirm scope** before building.

## Glossary

- **Gig** — a creator's listing for collaboration. Has `title`, `description`, `projectType`, `compensationType`, optional `deadline`, and tag joins for `Instrument` + `Genre`.
- **MusicianProfile** — a musician's single public page. One per `User`.
- **Instrument** — free-form tag created on demand by CSV input (e.g., "Guitar", "Piano", "Vocals"). Shared table joined to both `MusicianProfile` and `Gig`.
- **Genre** — same pattern as `Instrument` (e.g., "Jazz", "Indie", "Film scoring").
- **ProjectType** (enum) — `FILM | LIVE_EVENT | PODCAST | GAME | YOUTUBE | OTHER`.
- **CompensationType** (enum) — `PAID | UNPAID | NEGOTIABLE`.
- **GigStatus** — `OPEN | CLOSED` (currently stored as string column; should be a Prisma enum — flagged debt).
- **UserRole** (enum) — `MUSICIAN | CREATOR`.

## Contact model

The platform never relays messages. Contact between users is **always via `mailto:`** with the creator's or musician's listed email. Gig detail pre-fills the subject as `Motivo: <title>` (URL-encoded). Musician profile uses a plain `mailto:` button with no subject.

This is a deliberate product choice — do not propose adding an in-app inbox.
