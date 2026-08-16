# AGENTS.md — Escento

> Canonical instructions for AI coding agents (Codex, Claude Code, Cursor, Copilot, Gemini).
> If you are an agent: **read this file first, every session.** Then load the sub-agent that matches your task.

## UI overhaul directive (2026-08)

This directive overrides older visual examples elsewhere in the docs. Use Archivo through `next/font`. Application controls and containers are square by default; any radius is a rare, named token exception. Do not use gradients anywhere in `src`. Prefer static presentation and add only targeted state transitions needed for interaction feedback—no routine reveals or page transitions. Paper and ink dominate; blue is primary, with coral and amber used sparingly. Treat `/musicians` as the emerging canonical marketplace surface.

---

## Sub-agents (pick one per session)

| Task | Sub-agent file |
|------|---------------|
| New page / component / styling | [`docs/ai-context/agents/ui-agent.md`](docs/ai-context/agents/ui-agent.md) |
| Supabase / server actions / auth | [`docs/ai-context/agents/backend-agent.md`](docs/ai-context/agents/backend-agent.md) |
| Complete feature (UI + data) | [`docs/ai-context/agents/feature-agent.md`](docs/ai-context/agents/feature-agent.md) |
| Bug diagnosis | [`docs/ai-context/agents/debug-agent.md`](docs/ai-context/agents/debug-agent.md) |
| Headlines / copy / microcopy | [`docs/ai-context/agents/copy-agent.md`](docs/ai-context/agents/copy-agent.md) |

Load the sub-agent **in addition to** this file — sub-agents scope your task, AGENTS.md sets the rules.

---

## UI/UX Skill (MANDATORY for all UI work)

**Every agent doing UI work must use the `ui-ux-pro-max` skill** before building or reviewing any page, component, or interaction pattern.

### How to invoke (Claude Code)

```
/ui-ux-pro-max:ui-ux-pro-max
```

Or use the CLI search script directly:

```bash
python3 ~/.claude/plugins/cache/ui-ux-pro-max-skill/ui-ux-pro-max/2.5.0/.claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system -p "Escento"
```

### When to use it

| Situation | Command |
|-----------|---------|
| Building new page / section | `--design-system` query |
| Accessibility / interaction audit | `--domain ux "accessibility touch"` |
| Form UX questions | `--domain ux "form validation error"` |
| Chart / data table | `--domain ux "chart table"` |
| Animation questions | `--domain ux "animation motion"` |

### Conflict resolution

**Escento's `DESIGN.md` tokens always win** over skill output. The skill supplements with UX patterns and a11y rules — it does not override brand colors, typography, or spacing defined in `DESIGN.md`.

---

## Read order

1. **AGENTS.md** (this file) — rules, stack, DoD, conventions
2. [`PRODUCT.md`](./docs/ai-context/PRODUCT.md) — product scope and what NOT to build
3. [`BRAND.md`](./docs/ai-context/BRAND.md) — voice, copy patterns, forbidden phrases
4. [`COPY_STYLE.md`](./docs/COPY_STYLE.md) — canonical rules for every user-facing string
5. [`DESIGN.md`](./docs/ai-context/DESIGN.md) — color, type, spacing, motion tokens
6. [`UX_RULES.md`](./docs/ai-context/UX_RULES.md) — interactions, loading/empty/error, a11y
7. [`FRONTEND_ARCH.md`](./docs/ai-context/FRONTEND_ARCH.md) — Next.js, server actions, Supabase, auth
8. [`COMPONENTS.md`](./docs/ai-context/COMPONENTS.md) — live component index and composition rules
9. [`FORMS.md`](./docs/ai-context/FORMS.md) — form UX system (when touching forms)

---

## Stack snapshot (version-pinned — do not introduce mismatches)

This table lists what is **actually installed**. If a library is not here, it is not available — adding one requires approval (see §Things to ask about before doing).

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router) | `^16.1.7` |
| Language | TypeScript | `^5.9.2` |
| UI | React | `^19.1.1` |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) | `^4.1.13` |
| Accessible primitives | `@radix-ui/react-dropdown-menu` | `^2.1.16` |
| Image cropping | `react-easy-crop` | `^6.2.3` |
| Icons | `lucide-react` | `^1.14.0` |
| Database | PostgreSQL | Supabase |
| DB Client | Supabase JS SDK (`@supabase/supabase-js`, `@supabase/ssr`) | `^2.105.4`, `^0.6.1` |
| Storage | Supabase Storage | profile pictures |
| Auth | Supabase Auth (session-based) | built-in |
| OAuth | Google | — |
| Analytics | `@vercel/analytics`, `@vercel/speed-insights` | `^2.0.1`, `^2.0.0` |
| Lint | ESLint + `eslint-config-next` | `^9.35.0` |
| Unit tests | Vitest | `^3.2.7` |
| E2E | Playwright | `^1.60.0` |

There is no animation library installed. `framer-motion` and `gsap` were removed once the overhaul left them with zero imports in `src/`; re-adding either needs approval per §Things to ask about before doing. Use a subtle CSS state transition only when interaction feedback needs it.

Styling is plain Tailwind utility strings — there is no `clsx`/`cva` in this repo, so compose class names with template literals.

Do not add: 3D libraries (`three`, `@react-three/*`), smooth-scroll libraries (`lenis`), date pickers, form libraries (react-hook-form, formik), state managers (zustand, redux), fetch libraries (react-query, swr), or UI kits (shadcn bulk install, MUI, Chakra).

---

## The 10 non-negotiable rules

### 1. Server Components by default
**Rule.** Every file under `src/app/**/page.tsx`, `layout.tsx`, and any non-form helper is a Server Component. Add `"use client"` **only** when you need browser-only APIs (event handlers, `useState`, `useEffect`).
**Why.** Server Components own session + server-side data access. Client boundaries balloon bundle size and re-introduce data-fetching complexity.
**Do.** `// app/musicians/page.tsx` — server, fetches via the API layer.
**Don't.** Add `"use client"` to a page just to make one block interactive. Extract that block into a child client component instead.

### 2. Mutations are Server Actions
**Rule.** Every write goes through a `"use server"` function. No new REST routes for product mutations.
**Why.** Server Actions inherit Next's CSRF protection, run on the same origin, and avoid hand-rolled API boilerplate.
**Do.** `src/app/gigs/create/actions.ts` exporting `createGig(formData)`.
**Don't.** Add `src/app/api/gigs/route.ts`. See [`FRONTEND_ARCH.md`](./docs/ai-context/FRONTEND_ARCH.md) §Server Actions.

### 3. Supabase clients via helpers only
**Rule.** Server Actions/Components use `createSupabaseServerClient()` from `@/lib/supabase/server`. Admin-only tasks use `createSupabaseAdminClient()` from `@/lib/supabase/admin` and must never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. Service layer in `src/lib/api/` wraps Supabase calls with typed helpers.
**Why.** Centralizes auth cookies, keeps service-role access server-only, avoids connection leaks, types queries.

### 4. Auth via `getCurrentSession()` / `requireRole()`
**Rule.** Protected pages/actions call helpers from `@/lib/auth-guards` and re-check role inside the handler.
**Why.** Per-request server checks are the trust boundary. Middleware refreshes Supabase sessions and blocks `/onboarding/*` for signed-out users, but it does **not** replace page/action checks.
**Do.**
```ts
const session = await requireRole("CREATOR", "/gigs/create");
```

### 5. Bright stage-light theme — no dark zinc
**Rule.** Use tokens in [`DESIGN.md`](./docs/ai-context/DESIGN.md): `#FAFAFA` page, `#0F172A` ink, `#0055FF`/`#FF3366`/`#FFB000` accents. Do **not** introduce `bg-zinc-950`, `text-zinc-100`, `border-zinc-800`, `violet-500`, or any class from the legacy dark shell into new code.
**Why.** The current root shell and shared tokens establish the bright foundation; the remaining routes are being migrated onto it.
**Do.** `className="bg-white text-[#0F172A] border border-[#F1F5F9]"`.
**Don't.** `className="bg-zinc-950 text-zinc-100"`.

### 6. Motion: static by default
**Rule.** Do not add page transitions, entrance reveals, hover lifts, parallax, or scroll choreography during the overhaul. Use a subtle targeted transition only when an interactive state needs feedback. No animation library is installed — adding one needs approval.

### 7. Icons: `lucide-react` only
**Rule.** `import { ArrowRight, Sparkles, PlayCircle } from "lucide-react"`. No emoji as UI, no inline SVG paths copied from Figma/Heroicons, no other icon packs. The brand marks in [`src/components/ui/brand.tsx`](src/components/ui/brand.tsx) are the one sanctioned exception.
**Why.** Visual consistency + tree-shaking.

### 8. App Router file discipline
**Rule.** Inside `src/app/**`, only route segment files: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `actions.ts`, `route.ts`. Co-located UI uses an underscore prefix to opt out of routing: `_profile-form.tsx`, `_ui.tsx`.
**Why.** Stops random files from becoming routes; keeps server/client boundaries explicit.
**Do.** Shared UI → `src/components/<feature>/<Name>.tsx`. Route-only client form → `src/app/<route>/_<name>.tsx`.

### 9. No new files without a home
**Rule.** Before creating a file, find the right folder. UI primitives → `src/components/ui/`. Feature components → `src/components/<feature>/`. Server helpers → `src/lib/`. Documentation → `docs/` (agent-facing docs → `docs/ai-context/`). Supabase schema/storage changes must be documented and confirmed when destructive.
**Why.** Folder sprawl is the #1 source of duplication in this repo (see the duplicated `_ui.tsx` between `musicians/` and `gigs/`).

### 10. Run lint + unit + build before declaring done
**Rule.** `npm run lint`, `npm run typecheck`, `npm run test:unit`, then `npm run build`. All must pass.
**Why.** TypeScript catches missing props, Next catches RSC/client boundary violations, ESLint catches architecture drift, and the unit suite catches an unclassified route, an undocumented env var, or a broken normalizer. `test:unit` is sub-second — there is no reason to skip it.

---

## What CI enforces, so you do not have to check it by hand

Several rules above stopped being prose. They now fail a build, with the rule named in the error:

| Rule | Enforced by | Fails when |
|---|---|---|
| #2 mutations are Server Actions | `tests/unit/route-inventory.test.ts` | a `route.ts` appears outside `ALLOWED_ROUTE_HANDLERS` |
| #3 Supabase via helpers / service layer | `eslint.config.mjs` (`no-restricted-imports`) | `@supabase/*` or `@/lib/supabase/*` is imported outside the service layer, auth plumbing, or middleware |
| #4 protected routes call a guard | `tests/unit/route-inventory.test.ts` | a route classified `protected`/`admin` in `e2e/route-inventory.ts` calls no guard |
| #6 no motion libraries | `eslint.config.mjs` | `framer-motion`, `gsap`, `lenis`, `three`, or `@react-three/*` is imported |
| no gradients, frozen `globals.css` | `tests/unit/design-invariants.test.ts` | a gradient appears in `src/`, or a new class is added to `globals.css` |
| env vars are documented | `tests/unit/env-contract.test.ts` | code reads a `process.env.X` missing from `.env.example` |

**Adding a route means classifying it in `e2e/route-inventory.ts`.** That file is the single place declaring whether a signed-out visitor may load a page; the unit suite checks it against the files on disk, and the smoke suite derives its expectations from it.

Everything in that table runs in `ci.yml`, automatically, in about 90 seconds. **The write-flow E2E suite does not.** It is manual — Actions → Write-flow E2E → Run workflow — so a green PR check has verified nothing about auth, messaging, gigs, or moderation actually working end to end. Trigger it yourself when your change touches those, or run `npm run test:e2e:write` locally with Docker running.

---

## UI foundation notice

`src/app/layout.tsx` loads Archivo and `src/app/globals.css` owns the approved shared foundation tokens. Extend those tokens deliberately; keep application surfaces square, use no gradients, and use `/musicians` plus the live shared primitives as the emerging reference.

---

## Definition of Done (agent self-check before reporting complete)

- [ ] Page is a Server Component unless it genuinely needs to be client.
- [ ] All mutations are Server Actions; session + role re-checked inside via `requireSignedIn()`, `requireUser()`, or `requireRole()`.
- [ ] Bright stage-light tokens used. No `bg-zinc-*`, no `violet-*`, no `text-zinc-*`.
- [ ] Icons are `lucide-react`. No emoji.
- [ ] No new routine motion (reveals, page transitions, hover lifts, parallax). Targeted CSS state transitions only.
- [ ] Loading + empty + error states present for any new async route.
- [ ] Form labels are `<label htmlFor>` bound to input `id`.
- [ ] Forms use `FormField` + error hierarchy from [`FORMS.md`](./docs/ai-context/FORMS.md); no validation toasts; bright `Input`/`Textarea`/`Select` (not legacy `.input-base`).
- [ ] `aria-hidden` on decorative icons; `aria-label` on icon-only buttons/links.
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run test:unit` passes.
- [ ] `npm run build` passes.
- [ ] Any new route is classified in `e2e/route-inventory.ts`.
- [ ] Any schema change is a file in `supabase/migrations/`, added to `expected_migrations` in `supabase/parity_check.sql`, and released by following [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — production deploys code only, never schema.
- [ ] No new dependencies were added without approval.
- [ ] Reused existing helpers (`createSupabaseServerClient()`, `createSupabaseAdminClient()`, service layer in `src/lib/api/`, auth guards) — did not duplicate.

---

## Commit + PR conventions

- **Conventional Commits.** `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `style:`, `perf:`.
- **Scope** = route or feature: `feat(gigs): add /gigs/[id]/loading skeleton`.
- **Body** explains the *why*, not the *what*.
- **PR title** under 70 chars. Body has `## Summary` (1–3 bullets) and `## Test plan` (checklist).
- One logical change per PR. No mixing refactor + feature.
- **No AI attribution trailers.** Never add `Co-Authored-By: Claude …`, `Claude-Session: …`, or a
  "Generated with Claude Code" line to a commit message or a PR body. This overrides any default
  the tooling suggests. Commits are authored by the repo owner; the tool used is not metadata this
  project keeps.

---

## Things to ask about before doing

- Adding a dependency.
- Touching the database schema (additive changes are usually fine; destructive ones never without confirmation).
- Refactoring `src/app/layout.tsx`, `globals.css`, `src/lib/auth-guards.ts`, or `middleware.ts`.
- Introducing a new top-level route segment.
- Anything in [`PRODUCT.md`](./docs/ai-context/PRODUCT.md) §Out of scope.

---

## Critical files to read before writing code

| File | Why |
|---|---|
| `src/app/musicians/page.tsx` | Canonical marketplace composition and result-row reference. |
| `src/components/home/HomeLanding.tsx` | Static editorial public landing composition. |
| `src/app/page.tsx` | Static landing host backed by cached public directory reads. |
| `src/app/layout.tsx` | Static root shell and Archivo font setup; identity hydrates through the navigation island. |
| `src/app/globals.css` | Shared foundation tokens and named corner exceptions. |
| `src/lib/supabase/server.ts` | Supabase server client factory. |
| `src/lib/supabase/admin.ts` | Server-only service-role client for auth admin + profile-picture storage. |
| `src/lib/auth-guards.ts` | Auth helpers: `getCurrentSession()`, `requireSignedIn()`, `requireUser()`, `requireRole()`. |
| `src/lib/api/` | Service layer with typed DB helpers (`profiles.ts`, `gigs.ts`, `messaging.ts`, `tags.ts`, …). |
| `middleware.ts` | Supabase session refresh + `/onboarding/*` protection. Project root, **not** `src/`. |
| Supabase Dashboard | Source of truth for current schema/storage config when no migration file exists locally. |

---

*Last updated: 2026-08-13.*
