# FRONTEND_ARCH.md — Motivo

> How the app is wired. Read [`AGENTS.md`](./AGENTS.md) for the rules; this doc shows the patterns to apply them.

---

## Directory map

```
src/
  app/
    layout.tsx                          # root shell — LEGACY dark, migrate to bright (see UX_RULES §Navigation)
    page.tsx                            # / landing host (server) — resolves session + role → renders <HomeLanding/>
    globals.css                         # Tailwind v4 entry + LEGACY token classes (.input-base, .btn-primary, .card)
    api/
      auth/[...nextauth]/route.ts       # only API route. do not add more.
  lib/
    api/                                # ← SERVICE LAYER (see DATABASE.md)
      types.ts                          # shared TypeScript interfaces
      gigs.ts                           # gig CRUD + queries
      profiles.ts                       # musician profile CRUD + queries
      users.ts                          # user CRUD + queries
      tags.ts                           # instrument/genre CRUD (upsert pattern)
    onboarding/
      role/
        page.tsx
        actions.ts                      # setRole(role)
    musicians/
      page.tsx                          # directory
      [id]/page.tsx                     # public profile
      _ui.tsx                           # Chip, SectionCard, PrimaryLink (duplicated — consolidate to src/components/ui/)
    profile/
      create/page.tsx                   # MUSICIAN gate
      create/actions.ts                 # createMusicianProfile(formData)
      edit/page.tsx
      edit/actions.ts                   # updateMusicianProfile(formData)
      _profile-form.tsx                 # shared client form
    gigs/
      page.tsx                          # directory
      [id]/page.tsx                     # detail
      [id]/edit/page.tsx
      [id]/edit/actions.ts              # updateGig(gigId, fd)
      create/page.tsx
      create/actions.ts                 # createGig(formData)
      manage/page.tsx                   # CREATOR-only
      manage/actions.ts                 # closeGig, deleteGig
      manage/DeleteGigButton.tsx        # client, useTransition + window.confirm
      _gig-form.tsx                     # shared form
      _ui.tsx                           # Chip etc. (duplicate of musicians/_ui.tsx)
    signin/
      page.tsx
      SignInButtons.tsx                 # client, OAuth provider buttons
  components/
    home/
      HomeLanding.tsx                   # canonical bright-theme reference — READ FIRST
      StageLightsScene.tsx              # only file allowed to import @react-three/* and three
  auth.ts                               # NextAuth config + JWT role refresh
  supabase/
    server.ts                           # Supabase server client (auth-aware)
  types/                                # ambient types
  middleware.ts                         # protects /onboarding/* only (expand matcher if adding gated routes)
prisma/
  schema.prisma                         # data model truth
```

**Conventions:**
- `page.tsx` — Server Component, owns session + data fetch.
- `actions.ts` — co-located Server Actions, file-scoped `"use server"`.
- `_<name>.tsx` — underscore prefix opts out of routing; use for co-located forms or local UI helpers.
- `loading.tsx`, `error.tsx`, `not-found.tsx` — per segment. **Required** for any new async route.

---

## Server Components by default

Every `page.tsx` and `layout.tsx` is a Server Component. They:

- await `getCurrentSession()` from `@/lib/auth-guards`
- call API functions from `@/lib/api/*` (not Supabase directly)
- compose data and render JSX
- redirect with `redirect()` from `next/navigation` when auth/role fails

Add `"use client"` **only** for files that need browser-only APIs: `useState`, `useEffect`, `useTransition`, `useFormState`, framer-motion, R3F, event handlers like `onClick`.

```tsx
// app/gigs/page.tsx — Server Component
import { getCurrentSession } from "@/lib/auth-guards";
import { listOpenGigs, listInstruments, listGenres } from "@/lib/api/gigs";
import { listInstruments, listGenres } from "@/lib/api/tags";

export default async function GigsPage({
  searchParams,
}: {
  searchParams: Promise<{ projectType?: string; instrument?: string; genre?: string }>;
}) {
  const params = await searchParams;
  const [session, gigs, instruments, genres] = await Promise.all([
    getCurrentSession(),
    listOpenGigs({ projectType: params.projectType, instrument: params.instrument, genre: params.genre }),
    listInstruments(),
    listGenres(),
  ]);
  // ...render (gigs, instruments, genres are typed and already transformed to camelCase)
}
```

**Rule.** Use `Promise.all` to parallelize independent queries. Never `await` them sequentially. See [`DATABASE.md`](./DATABASE.md) for all available API functions.

---

## Server Actions (the only mutation surface)

All writes go through `"use server"` functions co-located in `actions.ts`. They:

1. Re-check session + role.
2. Validate input.
3. Mutate via API functions (from `@/lib/api/*`).
4. `redirect()` to a stable read URL.

### Pattern

```ts
// app/gigs/create/actions.ts
"use server";

import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth-guards";
import { createGig } from "@/lib/api/gigs";
import { parseCsv } from "@/lib/form-utils";

export async function createGigAction(formData: FormData) {
  const session = await getCurrentSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.role !== "CREATOR") throw new Error("Forbidden");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");
  // ...validate + parse other fields
  const instrumentNames = parseCsv(formData.get("instruments"));
  const genreNames = parseCsv(formData.get("genres"));

  const gig = await createGig(
    { title, creatorId: session.user.id, /* ...other fields */ },
    instrumentNames,
    genreNames
  );

  redirect(`/gigs/${gig.id}`);
}
```

**Rules.**
- Throw `Error` only at the moment — this surfaces as `error.tsx`. **Migrate to `useFormState` for inline form errors** (planned). New forms should be structured to support this from day one.
- Ownership checks on edit/delete: `if (gig.creatorId !== session.user.id) throw new Error("Forbidden")`.
- After a mutation that affects a cached directory, call `revalidatePath('/gigs')` or `revalidatePath('/musicians')` before `redirect()` (current code skips this — flagged).

### Existing action inventory

| Action | File | Auth | Role |
|---|---|---|---|
| `setRole(role)` | `app/onboarding/role/actions.ts` | user | any |
| `createMusicianProfile(fd)` | `app/profile/create/actions.ts` | user | `MUSICIAN` |
| `updateMusicianProfile(fd)` | `app/profile/edit/actions.ts` | user | `MUSICIAN` |
| `createGig(fd)` | `app/gigs/create/actions.ts` | user | `CREATOR` |
| `updateGig(gigId, fd)` | `app/gigs/[id]/edit/actions.ts` | user | `CREATOR` + owner |
| `closeGig(gigId)` | `app/gigs/manage/actions.ts` | user | `CREATOR` + owner |
| `deleteGig(gigId)` | `app/gigs/manage/actions.ts` | user | `CREATOR` + owner |

---

## Data fetching strategy

- **Server Components call API functions** from `@/lib/api/*` (centralized service layer). No direct Supabase queries in page/action files.
- API functions handle data transformation (snake_case → camelCase) and junction table flattening (instruments/genres as `string[]`).
- No `revalidate` on routes today — every request hits the DB. Acceptable at MVP scale. Add `export const revalidate = 60;` on directory pages once a CDN is in front.
- Search filters are GET query params → bookmarkable, shareable.
- See [`DATABASE.md`](./DATABASE.md) for all available API functions and their signatures.

---

## Auth (NextAuth v4)

### Setup

- Config in `src/auth.ts` (`authOptions`).
- Providers: GitHub + Google.
- Strategy: JWT sessions.
- Adapter: `@next-auth/prisma-adapter`.
- Custom `session` callback adds `user.id` and `user.role` from DB.
- **Known issue:** the JWT callback refreshes role from DB on every request — flagged perf bug, see REBUILD §9. Do not pile more DB calls into this callback.

### Pattern (every protected page)

```tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export default async function CreateGigPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin?callbackUrl=/gigs/create");
  if (!session.user.role) redirect("/onboarding/role");
  if (session.user.role !== "CREATOR") redirect("/");
  // ...
}
```

### Middleware

`src/middleware.ts` protects `/onboarding/*` only. **Per-page checks are the trust boundary.** When adding a new gated route, do NOT rely on middleware — re-check in the page and in every action.

### `session.user` shape

```ts
{ id: string; email?: string; role: "MUSICIAN" | "CREATOR" | null; name?: string; image?: string }
```

The `role` is `null` for users who haven't completed onboarding.

---

## Validation

**Today.** No library. `required` attributes + manual `String(formData.get("x"))` parsing + `throw new Error()` on empty.

**Going forward.** Adding `zod` is approved when validating a new server action. Pattern:

```ts
import { z } from "zod";

const CreateGigSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(2000),
  projectType: z.enum(["FILM", "LIVE_EVENT", "PODCAST", "GAME", "YOUTUBE", "OTHER"]),
  compensationType: z.enum(["PAID", "UNPAID", "NEGOTIABLE"]),
  deadline: z.string().date().optional(),
});

const parsed = CreateGigSchema.safeParse(Object.fromEntries(formData));
if (!parsed.success) {
  // return field errors via useFormState (preferred) or throw
}
```

**Rule.** Replace `as never` enum casts (currently used in `createGig`/`updateGig`) with explicit `z.enum` parsing. Enum injection is a real attack surface.

---

## Tag handling (Instrument, Genre)

CSV input field parsed by `parseCsv()` helper in `src/lib/form-utils.ts`. Tag creation handled by API layer with atomic upsert (no race condition).

### Form parsing helpers (`src/lib/form-utils.ts`)

```ts
export function parseCsv(input: unknown): string[] {
  return String(input ?? "")
    .split(",")
    .map((s) => s.trim().replace(/\s+/g, " "))
    .filter(Boolean);
}

export function normalizeTagName(name: string): string {
  // Title case the first letter of each word for canonical storage
  return name
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function nonEmptyOrNull(v: unknown): string | null {
  const s = String(v ?? "").trim();
  return s.length === 0 ? null : s;
}

export function strOrEmpty(v: unknown): string {
  return String(v ?? "").trim();
}
```

### Tag creation in actions

Pass parsed `instrumentNames` / `genreNames` to API functions. Upsert is handled by `ensureInstruments()` / `ensureGenres()` in `src/lib/api/tags.ts`:

```ts
// In action
const instrumentNames = parseCsv(formData.get("instruments"));
const genreNames = parseCsv(formData.get("genres"));
await createGig(gigData, instrumentNames, genreNames);
// createGig() calls ensureInstruments() + ensureGenres() internally
```

**Rule.** Never call Supabase tag operations directly. Always use API functions.

---

## File-naming conventions

| Kind | Location | Convention |
|---|---|---|
| Route segment | `src/app/<segment>/` | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `actions.ts`, `route.ts` |
| Co-located client form | `src/app/<segment>/` | `_<name>.tsx` (underscore = not a route) |
| Shared UI primitive | `src/components/ui/` | `kebab-case.tsx` exporting PascalCase |
| Feature component | `src/components/<feature>/` | `PascalCase.tsx` |
| Server utility | `src/lib/` | `kebab-case.ts` |
| Type module | `src/types/` | `kebab-case.ts` |

**Rule.** No files in `src/app/` that aren't route segments. Underscore-prefixed exceptions exist for co-located forms only.

---

## Environment contract

Required env vars (load via `.env.local`, fail fast if missing):

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
GITHUB_ID=...
GITHUB_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**Rule.** Do not commit `.env*` files. Do not log env values. Do not pass them to client components.

---

## Build + lint

```bash
npm run dev               # local dev
npm run lint              # eslint
npm run build             # next build — must pass before declaring done
npm run prisma:generate   # after schema.prisma changes
npm run prisma:migrate    # local migration
```

**Rule.** `npm run lint && npm run build` must both pass cleanly before reporting work complete. TypeScript errors block.

---

## Known footguns (do not re-introduce)

From `docs/REBUILD.md` §18:

1. **JWT callback hits DB every request.** Do not add more DB calls to it.
2. **Tag name collisions.** `Instrument` and `Genre` lack `@unique` on `name`; current code is case-sensitive. Use `normalizeTagName` + `upsert` (above).
3. **Enum injection.** `as never` casts on `projectType` / `compensationType` accept arbitrary strings. Use `z.enum`.
4. **Server actions throw → error boundary.** Migrate new forms to `useFormState`.
5. **No `revalidatePath`** after writes. Add it.
6. **No URL validation** on portfolio links. Use `z.string().url()`.
7. **`PortfolioItem` and `MusicianInstrument.proficiency` are dead code.** Do not wire UI to them without re-scoping (they're flagged for removal).
8. **`status: String` on Gig** should be `enum GigStatus { OPEN, CLOSED }`. Migrate when you touch gig schema.

---

## Performance notes

- Use `Promise.all` for independent queries. Never sequential `await`.
- Limit `whileInView` animated children to ~6; chunk larger lists with `staggerChildren`.
- Use `next/image` for any future image rendering, with `priority` on hero only.
- Add `take: 50` (or pagination) on directory queries before user-generated data crosses ~1k rows.
- Avoid client-component re-renders cascading from large server-rendered lists — keep client islands small.

---

## Security checklist (per change)

- [ ] Session + role re-checked inside every action.
- [ ] Ownership verified on edit/delete (`record.userId === session.user.id`).
- [ ] Inputs validated (length caps, URL format, enum membership).
- [ ] Enum strings parsed with `z.enum`, not `as never`.
- [ ] External links: `rel="noopener noreferrer"` + `target="_blank"`.
- [ ] No `dangerouslySetInnerHTML`.
- [ ] `mailto:` subject/body are `encodeURIComponent`-wrapped.
- [ ] No secrets in client bundle (verify with `next build` output if uncertain).

---

*Cross-refs:* [`DATABASE.md`](./DATABASE.md) for API layer · [`AGENTS.md`](./AGENTS.md) for rules · [`COMPONENTS.md`](./COMPONENTS.md) for UI snippets · [`PRODUCT.md`](./PRODUCT.md) for scope.
