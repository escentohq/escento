# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Read `AGENTS.md` before any work.** It contains the 10 non-negotiable rules, the full tech stack, the Definition of Done checklist, and which sub-agent file to load per task type. This file is the complement — architecture detail that requires reading across multiple files to understand.

Use `/musicians` as the canonical application design reference replacing the former landing-led
baseline. The rebuilt `HomeLanding.tsx` is a static public composition, not the template for every
product route.

---

## Commands

```bash
npm run dev       # dev server at localhost:3000
npm run build     # production build (must pass before done)
npm run lint      # ESLint (must pass before done)
```

Playwright smoke and write-flow suites live in `e2e/`. Write-flow tests require the guarded local
Supabase setup in `playwright.write.config.ts`; never point them at hosted Supabase. Visual work is
also verified manually in the browser, followed by `lint` and `build`.

---

## Architecture

### Auth → App User sync (multi-file to understand)

Supabase Auth and the app's own `app_user` table are two separate identity stores. Auth guards read
the current Supabase user, then load the matching application role/name/image record. The session
shape throughout the app is:

```ts
{ user: { id, email, role, name, image } }  // id = app user id (TEXT), not Supabase UUID
```

Auth guards (`src/lib/auth-guards.ts`) layer on top: `getCurrentSession` → `requireSignedIn` →
`requireUser` (has a role) → `requireRole("MUSICIAN"|"CREATOR", callbackUrl)`. Protected pages and
actions use the guard appropriate to their trust boundary.

`middleware.ts` only refreshes the Supabase cookie and blocks `/onboarding/*` for unauthenticated users. All other route-level auth is enforced at the page or action level, not in middleware.

### Service layer (`src/lib/api/`)

Product data access is concentrated in this directory. Established auth and Supabase helpers may
query session/account data directly where documented. Service files follow the same normalization
pattern:

- Private `toX(raw)` normalizer converts Postgres snake_case → TypeScript camelCase and flattens junction arrays (e.g., `gig_instrument` rows → `instruments: string[]`).
- All functions call `await createSupabaseServerClient()` at the top — never cached, never a module singleton.
- IDs are `TEXT` generated via `crypto.randomUUID()` in application code before insert, not Postgres-native `uuid`.

Tags (instruments, genres) are deduplicated via `normalizeTagName` and upserted via `ensureInstruments`/`ensureGenres` in `tags.ts`. Gig and profile mutations delete-and-reinsert junction rows on every update.

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

### Supabase Realtime

Not currently used in the codebase. The browser client (`src/lib/supabase/client.ts` → `createSupabaseBrowserClient()`) is available for client components that need it. Any table that should broadcast Realtime events needs `ALTER PUBLICATION supabase_realtime ADD TABLE "tablename"` in a migration.

### Database schema

Source of truth: Supabase dashboard SQL editor. Schema documentation in `DB_REBUILD.md`. Apply schema changes directly via Supabase dashboard or MCP. No RLS — auth enforced server-side. IDs are `TEXT` (not `uuid` type). All FK constraints use `ON DELETE CASCADE`.

Service layer (`src/lib/api/`) makes all DB calls — never direct queries outside this directory.
