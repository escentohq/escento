# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Read `AGENTS.md` before any work.** It contains the 10 non-negotiable rules, the full tech stack, the Definition of Done checklist, and which sub-agent file to load per task type. This file is the complement — architecture detail that requires reading across multiple files to understand.

Follow [`docs/COPY_STYLE.md`](docs/COPY_STYLE.md) for every user-facing string. It is the canonical voice guide. Keep copy direct and specific, never use em dashes in product text, and do not reintroduce forced music metaphors or generic startup language.

**Never add AI attribution to commits or PRs.** No `Co-Authored-By: Claude …` trailer, no
`Claude-Session:` line, no "🤖 Generated with Claude Code" footer — in commit messages, PR bodies,
or issue bodies. This instruction overrides the default trailer behavior. See `AGENTS.md` §Commit +
PR conventions.

During UI work, use `/` as the canonical product/marketplace reference (its result rows live in
`src/components/directory/` and are shared with `/musicians` and `/gigs`) and `HomeLanding.tsx`,
rendered at `/about`, as the canonical public/editorial reference. Preserve the flat square system while
allowing real imagery, asymmetric composition, and one deliberate large-scale blue moment on public
and detail surfaces. Coral and amber remain sparse, semantic accents; gradients and decorative motion
remain prohibited.

---

## Commands

```bash
npm run dev             # dev server at localhost:3000
npm run build           # production build (must pass before done)
npm run lint            # ESLint (must pass before done)
npm run typecheck       # tsc --noEmit (must pass before done)
npm run test:unit       # Vitest — pure logic and repo invariants (sub-second)
npm run test:e2e        # Playwright read-only suite
npm run test:e2e:write  # write-flow suite (needs a local Supabase stack)
```

Three layers, in order of what they cost:

- **`test:unit`** (`tests/unit/`) is pure logic plus the checks that read the repo itself: the route-guard inventory, the `.env.example` contract, the frozen `globals.css`, and the service-layer normalizers. It runs in the `quality` CI job alongside lint, because none of it needs a browser.
- **`test:e2e`** (`e2e/smoke.spec.ts`) is signed-out and read-only, safe against a live deployment. Its path lists come from `e2e/route-inventory.ts`.
- **`test:e2e:write`** (`e2e/flows/`) drives the real mutation flows against the guarded local Supabase setup in `playwright.write.config.ts`; never point it at hosted Supabase.

**Adding a route requires classifying it in `e2e/route-inventory.ts`.** The unit suite enumerates `src/app/**/page.tsx` and fails, naming the file, if a route is unclassified — or if a route classified `protected`/`admin` no longer calls an auth guard.

Verification is `lint` + `typecheck` + `test:unit` + `build`, plus manual browser checks for UI work.

### What CI runs, and what it does not

`ci.yml` is the only automatic gate on a PR: lint, typecheck, unit, build — about 90 seconds. `secret-scan.yml` runs alongside it. A push to `main` also deploys production.

The write-flow suite is **manual**: `write-flows.yml`, triggered from Actions → Write-flow E2E → Run workflow. Three shards, each booting its own ephemeral Supabase stack, ~13 minutes. It ran on every commit and the cost was that the 90-second answer arrived behind it. Run it by hand before merging anything touching auth, messaging, gigs, moderation, or `src/lib/api/` — a green `ci.yml` says nothing about those flows. `schema-drift.yml` (daily) and `deploy-preview.yml` are likewise on demand.

Neither Playwright suite retries in CI, and both stop at the first failure (`retries: 0`, `maxFailures: 1`). A test that only passes on a second attempt is a failure — fix the flake rather than re-running.

Five write-flow tests are quarantined with `test.skip`, all tracked by #41. Do not add to that list without an issue; unskipping is part of the fix.

---

## Repo layout

```
AGENTS.md CLAUDE.md README.md   entry-point docs (root holds no other Markdown)
middleware.ts                   root-level, NOT src/ — see Auth below
docs/
  ai-context/                   agent-facing specs (DESIGN, BRAND, FORMS, …)
    agents/                     per-task sub-agent briefs
    userflows/
  features/                     numbered feature specs
  research/                     market/outreach research
  assets/                       source design assets (not served — no public/ dir)
e2e/                            Playwright specs
src/{app,components,lib,hooks}/
supabase/{migrations,migrations_archive}/
```

All documentation lives under `docs/`. Do not add new Markdown to the repo root.

---

## Architecture

### Auth → App User merge

Supabase Auth and the app's own `app_user` table are two separate identity stores, merged on read (not by a sync/upsert step). It all lives in `src/lib/auth-guards.ts`:

`getCurrentSession()` is wrapped in React's `cache()`, so it runs at most once per request. It calls `supabase.auth.getClaims()` — not `getUser()` — then selects `role, name, image` from `app_user` by the `sub` claim. `getClaims()` verifies the JWT locally when the project uses asymmetric signing keys, saving a network round trip to the Auth server on every request, and falls back to a `getUser()` call under legacy HS256 secrets. `middleware.ts` uses the same call for the same reason. Do not switch these back to `getUser()` without measuring. A `PGRST116` (no rows) error is expected and ignored — it just means the auth user has no `app_user` row yet, which surfaces as `role: null`. Any other error is logged and the session still returns. The shape is always:

```ts
{ user: { id, email, role, name, image } }  // id = the Supabase auth user id, reused as the app_user TEXT id
```

The guards layer on top, each delegating to the previous: `getCurrentSession()` → `requireSignedIn(callbackUrl)` (redirects to `/signin?callbackUrl=…`) → `requireUser(callbackUrl)` (redirects to `/onboarding/role` if no role) → `requireRole("MUSICIAN"|"CREATOR", callbackUrl)` (redirects to `/` on role mismatch). Every protected page and server action calls one of these.

`middleware.ts` lives at the **project root, not `src/`** — Next.js resolves the root file, so a `src/middleware.ts` would be silently dead. It bails out early if the Supabase env vars are missing, refreshes the Supabase cookie inside a `try/catch` (a deleted account 403s here and must not 500 the request), and blocks `/onboarding/*` for unauthenticated users. All other route-level auth is enforced at the page or action level, not in middleware.

### Service layer (`src/lib/api/`)

Product data access is concentrated here — no direct Supabase calls for product data outside this directory. The established auth and Supabase helpers (`auth-guards.ts`, `supabase/`) are the documented exception and may query session/account data directly. The files are `profiles.ts`, `gigs.ts`, `messaging.ts`, `tags.ts`, `reports.ts`, `support-account.ts`, `admin-dashboard.ts`, `admin-edits.ts`, `admin-taxonomy.ts`, and shared `types.ts`. Each follows the same pattern:

- Private `toX(raw)` normalizer converts Postgres snake_case → TypeScript camelCase and flattens junction arrays (e.g., `gig_instrument` rows → `instruments: string[]`).
- All functions call `await createSupabaseServerClient()` at the top — never cached, never a module singleton.
- IDs are `TEXT` generated via `crypto.randomUUID()` in application code before insert, not Postgres-native `uuid`.

Tags (instruments, genres) are deduplicated via `normalizeTagName` and upserted via `ensureInstruments`/`ensureGenres` in `tags.ts`. Gig and profile mutations delete-and-reinsert junction rows on every update.

#### Public read caching — one entry per dataset, not per filter

`listProfiles(filters)` and `listOpenGigs(filters)` are thin wrappers, and the split matters:

- `getCachedPublicProfiles` / `getCachedPublicOpenGigs` are **module-level** `unstable_cache` entries keyed `["public-musicians"]` / `["public-gigs"]` with no filter in the key. They read the whole public dataset through `createSupabasePublicClient()` (cookie-free, which is what makes the read cacheable at all) and are invalidated only by tag, via `updateTag()` in `src/lib/public-cache-invalidation.ts`.
- `filterProfiles` / `filterGigs` then apply search, instrument, genre, project-type, remote, and radius filtering **in JS** against that one cached array.

Do not move the cache key back onto the filters. None of these filters were ever pushed into SQL, so a per-filter key just made every distinct search string a cold full-table read. Keeping one entry means `?q=jazz` and `?q=blues` both hit the same warm data. If filtering ever does move into SQL, this arrangement has to be revisited together.

Selects list explicit columns (`PROFILE_COLUMNS`, `GIG_SELECT`, `PARTICIPANT_COLUMNS`, …) rather than `select("*")`; the junction-row columns were being fetched and discarded. Composing the select string from a constant costs PostgREST's row-type inference, which is why `profiles.ts` reads rows through the loose `ProfileRow` type.

### Server Actions pattern

Actions live in `actions.ts` co-located with their route segment. The shape used with `useActionState`:

```ts
// actions.ts
"use server";
export async function doThingAction(_state: ActionState, fd: FormData): Promise<ActionState>
```

Inside every action: call an auth guard first, validate inputs, call service layer, then `revalidatePath()` + `redirect()`. The client form uses `useActionState(doThingAction, initialState)` and renders inline field errors from the returned `ActionState`.

For actions bound with a pre-existing ID (e.g., edit flows): `updateGigAction.bind(null, gigId)` — the bound action's signature is `(gigId, _state, fd)`.

### Layout and theme migration state

`src/app/layout.tsx` now loads Archivo and `src/app/globals.css` owns the small set of shared foundation tokens. Controls and containers are square by default, gradients are prohibited in `src`, and named radius utilities are reserved for concrete overlay/media exceptions.

### Route co-location conventions

Inside `src/app/**`, only Next.js segment files are routes. Client forms and UI helpers use underscore prefix to opt out of routing:

- `page.tsx` — Server Component, fetches data, renders layout
- `actions.ts` — Server Actions for that segment
- `_<name>.tsx` — Co-located client component (form, button group); not a route
- `_ui.tsx` — Barrel for shared primitives used only within that segment

Feature components shared across routes live in `src/components/<feature>/`. Global UI primitives live in `src/components/ui/`.

### Motion usage

Do not add routine entrance, reveal, page-transition, hover-lift, or scroll-driven animation during the overhaul. `<Reveal>` is currently a static compatibility wrapper. Use subtle targeted state transitions only where interaction feedback needs them.

There is no animation, 3D, or smooth-scroll layer left. `three`/`@react-three/*` and `lenis` were removed once their only consumers (`StageLightsScene.tsx`, `SmoothScroll.tsx`) proved unreferenced; `framer-motion` and `gsap` followed for the same reason — zero imports anywhere in `src/`. Re-introducing any of them needs approval per `AGENTS.md` §Things to ask about before doing.

### Supabase Realtime

Not currently used in the codebase. The browser client (`src/lib/supabase/client.ts` → `createSupabaseBrowserClient()`) is available for client components that need it. Any table that should broadcast Realtime events needs `ALTER PUBLICATION supabase_realtime ADD TABLE "tablename"` in a migration.

### Database schema

**Source of truth: `supabase/migrations/`.** This changed — the dashboard used to be authoritative, and the cost was invisible drift: CI tests against the migrations, so a dashboard-only edit left CI green while production broke. That is exactly the `DB_REBUILD.md` incident, where a prod-only `role` DEFAULT bounced every fresh signup off `/onboarding/role`.

Apply schema changes as a migration file. A dashboard or MCP edit is allowed for exploration but must be exported back into a migration before the change ships. `.github/workflows/schema-drift.yml` diffs the hosted schema against the migrations on a schedule and fails on divergence (it needs the `SUPABASE_DB_URL` repo secret; it fails rather than skips when that is missing). No RLS — auth enforced server-side. IDs are `TEXT` (not `uuid` type). All FK constraints use `ON DELETE CASCADE`.

Service layer (`src/lib/api/`) makes all DB calls — never direct queries outside this directory.
