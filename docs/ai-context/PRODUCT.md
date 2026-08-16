# PRODUCT.md — Escento

## What Escento is

A directory + listings platform connecting **student musicians** with **student creators** (film students, podcasters, YouTubers, indie game devs, event organizers). It is intentionally **not** a social network: no feeds, no payments, no algorithmic recommendations. The MVP now uses connection requests and direct messages for the shortest possible path from *"I need someone"* to *"I found them and started the conversation."*

Tagline: **Take the Stage.**

## Two sides

- **Musicians** create one public profile (profile picture, instruments, genres, location, availability, portfolio links, contact email).
- **Creators** post structured gig listings (project type, requirements, location/remote, compensation, deadline) and receive connection requests from interested musicians.

A `User` holds one or both capabilities (`MUSICIAN`, `CREATOR`). The first is chosen at onboarding and stored in the immutable `role` column; the other can be added later from `/onboarding/role?add=…`. Capabilities are additive: they can be granted, never removed. A dual account switches which mode it is acting in from the user menu, and that view is a display preference only.

## Personas

- **Alex — Film Student (Creator).** Needs a composer for a 10-minute short. Doesn't know musicians personally. Deadline-driven.
- **Maya — Guitarist (Musician).** Wants gigs and collaborations. Currently relies on word of mouth.

## Core flows

| | Flow |
|---|---|
| **A** | Musician signs up → `/` → Sign in (GitHub or Google) → `/onboarding/role` (choose `MUSICIAN`) → `/profile/create` → `/profile/edit` |
| **B** | Creator signs up → `/` → Sign in → `/onboarding/role` (choose `CREATOR`) → `/gigs/create` → `/gigs/[id]` |
| **C** | Anyone discovers a musician → `/` → `/musicians` (filter by instrument, genre) → `/musicians/[id]` → signed-in user sends connection request |
| **D** | Anyone discovers a gig → `/` → `/gigs` (filter by projectType, instrument, genre) → `/gigs/[id]` → signed-in user contacts the owner through a connection request |
| **E** | Creator manages own gigs → navbar → `/gigs/manage` → Edit / Mark Filled / Delete / View |

**Browsing is anonymous.** No auth required for `/musicians`, `/musicians/[id]`, `/gigs`, `/gigs/[id]`.

## Feature inventory (implemented MVP)

| Feature | Route(s) | Auth | Role |
|---|---|---|---|
| Marketplace directory (musicians / gigs, `?view=`) | `/` | Optional | Any |
| Editorial landing | `/about` | Optional | Any |
| Sign-in/sign-up (email/password + Google OAuth) | `/signin`, `/signup`, `/auth/callback` | — | — |
| First capability, and adding the second | `/onboarding/role` | Required | Any |
| Musician directory + filters | `/musicians` | Optional | Any |
| Musician public profile | `/musicians/[id]` | Optional | Any |
| Create musician profile | `/profile/create` | Required | `MUSICIAN` |
| Edit musician profile | `/profile/edit` | Required | `MUSICIAN` |
| Gig directory + filters | `/gigs` | Optional | Any |
| Gig detail | `/gigs/[id]` | Optional | Any |
| Create gig | `/gigs/create` | Required | `CREATOR` |
| Edit gig | `/gigs/[id]/edit` | Required | Owner `CREATOR` |
| Manage own gigs | `/gigs/manage` | Required | `CREATOR` |
| Connect / contact via messaging request | profile and gig detail pages | Required | Any role |
| Account profile picture | `/account` | Required | Any |
| Messaging backend foundation | server actions + service layer | Required | Any role |

**Visibility rules:**
- Only `status = OPEN` gigs appear in `/gigs` directory.
- Closed gigs remain reachable at `/gigs/[id]` if linked.
- All musician profiles are public — there is no `isPublic` flag today.

## Hard scope boundary — DO NOT build these

The following are **explicitly out of scope** for the MVP. Do not implement them without an explicit, written re-scoping from the user.

- Payments / escrow / Stripe / any billing
- Ratings, reviews, or testimonials
- Recommendation algorithms, match scoring, or ranking beyond `updatedAt DESC`
- Mobile apps (native or PWA install flows)
- Advanced notifications (email digests, push, notification center)
- Social feeds, follows, likes, comments
- File uploads for portfolio work — portfolio is **link-only** (`youtubeUrl`, `soundcloudUrl`, `spotifyUrl`, `websiteUrl`, `instagramUrl`). Account profile pictures are the only supported upload.
- A `/dashboard` route or analytics view
- Compensation filter on `/gigs` (PRD mentions, not built — flagged)
- Remote toggle filter on either directory
- Keyword search input
- `PortfolioItem` repeatable items (table exists in schema, **unused**)
- `MusicianInstrument.proficiency` display (column exists, **unused**)

If a user request implies any of the above, **stop and confirm scope** before building.

## Glossary

- **Gig** — a creator's listing for collaboration. Has `title`, `description`, `projectType`, `compensationType`, optional `deadline`, and tag joins for `Instrument` + `Genre`.
- **MusicianProfile** — a musician's single public page. One per `User`.
- **Instrument** — free-form tag created on demand by CSV input (e.g., "Guitar", "Piano", "Vocals"). Shared table joined to both `MusicianProfile` and `Gig`.
- **Genre** — same pattern as `Instrument` (e.g., "Jazz", "Indie", "Film scoring").
- **ProjectType** (enum) — `FILM | LIVE_EVENT | PODCAST | GAME | YOUTUBE | OTHER`.
- **CompensationType** (enum) — `PAID | UNPAID | NEGOTIABLE`.
- **GigStatus** — `OPEN | CLOSED` (currently stored as text/string).
- **UserRole** (enum) — `MUSICIAN | CREATOR`. Names both the immutable first claim (`app_user.role`) and each capability (`app_user.is_musician` / `is_creator`).

## Contact model

Messaging is the primary contact model. Signed-in users send connection requests from public profiles or gig details. Recipients accept before a direct conversation begins. Blocks prevent requests/messages, unread state is tracked per participant, and the Messages nav/request CTAs show unread or pending counts. Do not add feeds, recommendations, reactions, attachments, realtime, or advanced notification systems unless explicitly scoped.
