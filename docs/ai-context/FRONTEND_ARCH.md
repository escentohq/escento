# FRONTEND_ARCH.md — Escento

> How the app is wired. Read [`AGENTS.md`](../../AGENTS.md) for the rules; this doc shows the patterns to apply them.

---

## Directory map

```
src/
  app/
    layout.tsx                          # bright root shell + Archivo font + session-aware navigation
    page.tsx                            # / landing host (server) — resolves session + role → renders <HomeLanding/>
    globals.css                         # Tailwind v4 entry + shared foundation and exception tokens
    signin/
      page.tsx                          # Email/password sign-in form
      actions.ts                        # signInWithPasswordAction(state, fd, callbackUrl)
      _signin-form.tsx                  # client form component
    signup/
      page.tsx                          # Email/password sign-up form
      actions.ts                        # validateSignUp + signUpWithPasswordAction
      _signup-form.tsx                  # client form component
    forgot-password/
      page.tsx                          # Password reset request
      actions.ts                        # requestPasswordReset
      _forgot-password-form.tsx         # client form component
    account/
      page.tsx
      actions.ts                        # updateNameAction, updateProfilePictureAction, signOutAction, deleteAccountAction
      _update-profile-picture-form.tsx  # client avatar upload form
      _update-name-form.tsx             # client name form
      _delete-account-button.tsx        # client destructive confirm + server action
      update-password/                  # Change password (authenticated)
        page.tsx
        actions.ts                      # updatePasswordAction
        _update-password-form.tsx       # client form component
    onboarding/
      role/
        page.tsx
        actions.ts                      # setRole(role)
  lib/
    api/                                # ← SERVICE LAYER (see DATABASE.md)
      types.ts                          # shared TypeScript interfaces
      gigs.ts                           # gig CRUD + queries
      profiles.ts                       # musician profile CRUD + queries
      tags.ts                           # instrument/genre CRUD (upsert pattern)
    supabase/
      server.ts                         # Supabase server client (JWT-aware)
      client.ts                         # Supabase browser client
      admin.ts                          # server-only service-role client for auth admin/storage
    auth-guards.ts                      # getCurrentSession, requireSignedIn, requireUser, requireRole
    password.ts                         # validatePassword helper
  middleware.ts                         # JWT refresh via supabase.auth.getUser()
  components/
    home/
      HomeLanding.tsx                   # static editorial public landing
  types/                                # ambient types
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
| `updateNameAction(fd)` | `app/account/actions.ts` | user | any |
| `updateProfilePictureAction(fd)` | `app/account/actions.ts` | user | any |
| `deleteAccountAction()` | `app/account/actions.ts` | user | any |

---

## Data fetching strategy

- **Server Components call API functions** from `@/lib/api/*` for feature data where helpers exist. Auth/account actions may use Supabase directly for auth metadata, account deletion, and profile-picture storage.
- API functions handle data transformation (snake_case → camelCase) and junction table flattening (instruments/genres as `string[]`).
- No `revalidate` on routes today — every request hits the DB. Acceptable at MVP scale. Add `export const revalidate = 60;` on directory pages once a CDN is in front.
- Search filters are GET query params → bookmarkable, shareable.
- See [`DATABASE.md`](./DATABASE.md) for all available API functions and their signatures.

---

## Auth (Supabase email/password + JWT)

### Setup

- Supabase auth handles email/password signup + sign-in + password reset.
- JWT stored in httpOnly cookies via `@supabase/ssr`.
- `getCurrentSession()` from `@/lib/auth-guards` queries `auth.users` (Supabase) + `app_user` (app metadata).
- `middleware.ts` refreshes JWT on every request via `supabase.auth.getUser()`.

### Pattern (every protected page)

```tsx
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth-guards";

export default async function CreateGigPage() {
  const session = await getCurrentSession();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/gigs/create");
  if (!session.user.role) redirect("/onboarding/role");
  if (session.user.role !== "CREATOR") redirect("/");
  // ...
}
```

### Auth routes + actions

| Route | Action | Purpose |
|---|---|---|
| `/signin` | `signInWithPasswordAction` | Email/password sign-in via `supabase.auth.signInWithPassword` |
| `/signup` | `signUpWithPasswordAction` | Email/password signup + validation via `supabase.auth.signUp` |
| `/forgot-password` | `requestPasswordReset` | Request password reset email link |
| `/account/update-password` | `updatePasswordAction` | Change password (authenticated user only) |
| `/account` | `updateNameAction` | Update `app_user.name` + auth metadata |
| `/account` | `updateProfilePictureAction` | Upload avatar to Supabase Storage and save URL to `app_user.image` + auth metadata |
| `/account` | `deleteAccountAction` | Hard-delete app data and Supabase Auth user |

### Middleware

`src/middleware.ts` calls `supabase.auth.getUser()` on every request to refresh the JWT. This is required by `@supabase/ssr` to keep tokens fresh (~1 hour expiry). **Per-page checks are the trust boundary.** When adding a new gated route, do NOT rely on middleware — re-check in the page and in every action.

### `session.user` shape

```ts
{
  id: string;                           // Supabase auth user id (TEXT, matches app_user.id)
  email: string | null;                 // from auth.users
  role: "MUSICIAN" | "CREATOR" | null;  // from app_user
  name?: string | null;                 // from app_user
  image?: string | null;                // from app_user
}
```

The `role` is `null` for users who haven't completed onboarding. `name` and `image` are optional fields from the `app_user` table.

**Auth tables:**
- `auth.users` — Supabase-managed (email, password hash, email_confirmed_at)
- `app_user` — App-specific metadata (role, name, image, timestamps)
- `app_user.id` TEXT matches `auth.users.id`

---

## Validation

**Today.** No Zod library yet. Manual parsing + return `ActionState` from server actions. Client uses `useActionState`.

**Rule.** User-correctable validation never `throw`s — return:

```ts
return {
  ok: false,
  fieldErrors: { title: "Add a title." },
  message: formLevelMessage(fieldErrors, "Add a title."),
  values: gigValuesFromFormData(fd), // rehydrate controlled form
};
```

See [`FORMS.md`](./FORMS.md) for the full contract.

**Going forward.** Adding `zod` is approved when validating a new server action. Map `safeParse` failures to `fieldErrors`.

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
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...          # server-only; Supabase Dashboard → API Keys → service_role/secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`NEXT_PUBLIC_APP_URL` is used in email redirect links for password reset and signup confirmation.

`SUPABASE_SERVICE_ROLE_KEY` is required for:
- **Account deletion** (`auth.admin.deleteUser` in `deleteAccountAction`)
- **Profile picture uploads** (`profile-pictures` Supabase Storage bucket creation/upload)

Do not prefix it with `NEXT_PUBLIC_` and never pass it to client components.

### Storage

Profile pictures are stored in a public Supabase Storage bucket named `profile-pictures`. The app currently creates the bucket on first upload through `createSupabaseAdminClient()`, validates image type (`image/jpeg`, `image/png`, `image/webp`), enforces a 2 MB app-level limit, uploads to `<authUserId>/profile.<ext>`, and saves the public URL in `app_user.image`.

Musician public profile reads join `musician_profile -> app_user(image)` so the account avatar appears on `/musicians` and `/musicians/[id]`. Creators can update the same account avatar, but they do not have a public creator profile yet.

---

## Build + lint

```bash
npm run dev               # local dev
npm run lint              # eslint
npm run build             # next build — must pass before declaring done
```

**Rule.** `npm run lint && npm run build` must both pass cleanly before reporting work complete. TypeScript errors block.

---

## Form system

Canonical doc: [`FORMS.md`](./FORMS.md).

| Concern | Location |
|---|---|
| `ActionState` type + helpers | `src/lib/form-utils.ts` |
| Value snapshots on failure | `src/lib/form-snapshots.ts` |
| Client touch/submit state | `src/hooks/use-form-field-state.ts` |
| Primitives | `src/components/ui/form-*.tsx`, `src/components/ui/input.tsx` |

**When to redirect vs return errors:**

- Create/update success → `revalidatePath` + `redirect`
- Validation failure → return `{ ok: false, fieldErrors, message, values }`
- Auth/sign-in failure (wrong password) → form banner, not field-specific blame
- Uncaught DB/auth errors → may still throw (500 boundary)

---

## Known footguns (do not re-introduce)

From `docs/REBUILD.md` §18:

1. **Session reads hit `app_user`.** `getCurrentSession()` reads Supabase Auth plus `app_user`; do not add extra unrelated reads to it.
2. **Tag name collisions.** `Instrument` and `Genre` lack `@unique` on `name`; current code is case-sensitive. Use `normalizeTagName` + `upsert` (above).
3. **Enum injection.** `as never` casts on `projectType` / `compensationType` accept arbitrary strings. Use `z.enum`.
4. **Server actions throw → error boundary.** Return `ActionState` + `useActionState` for forms (see [`FORMS.md`](./FORMS.md)).
5. **No `revalidatePath`** after writes. Add it.
6. **No URL validation** on portfolio links. Use `z.string().url()`.
7. **`PortfolioItem` and `MusicianInstrument.proficiency` are dead code.** Do not wire UI to them without re-scoping (they're flagged for removal).
8. **`status` on Gig** is stored as text/string (`OPEN` / `CLOSED`).

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
- [ ] Messaging/contact mutations go through Server Actions and derive the actor from session.
- [ ] No secrets in client bundle (verify with `next build` output if uncertain).

---

*Cross-refs:* [`DATABASE.md`](./DATABASE.md) for API layer · [`AGENTS.md`](../../AGENTS.md) for rules · [`COMPONENTS.md`](./COMPONENTS.md) for UI snippets · [`PRODUCT.md`](./PRODUCT.md) for scope.
