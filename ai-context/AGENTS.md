# AGENTS.md — Escento

> Canonical instructions for AI coding agents (Codex, Claude Code, Cursor, Copilot, Gemini).
> If you are an agent: **read this file first, every session.** Then load the sub-agent that matches your task.

---

## Sub-agents (pick one per session)

| Task | Sub-agent file |
|------|---------------|
| New page / component / styling | [`ai-context/agents/ui-agent.md`](ai-context/agents/ui-agent.md) |
| Supabase / server actions / auth | [`ai-context/agents/backend-agent.md`](ai-context/agents/backend-agent.md) |
| Complete feature (UI + data) | [`ai-context/agents/feature-agent.md`](ai-context/agents/feature-agent.md) |
| Bug diagnosis | [`ai-context/agents/debug-agent.md`](ai-context/agents/debug-agent.md) |
| Headlines / copy / microcopy | [`ai-context/agents/copy-agent.md`](ai-context/agents/copy-agent.md) |

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
2. [`PRODUCT.md`](./PRODUCT.md) — product scope and what NOT to build
3. [`BRAND.md`](./BRAND.md) — voice, copy patterns, forbidden phrases
4. [`DESIGN.md`](./DESIGN.md) — color, type, spacing, motion tokens
5. [`UX_RULES.md`](./UX_RULES.md) — interactions, loading/empty/error, a11y
6. [`FRONTEND_ARCH.md`](./FRONTEND_ARCH.md) — Next.js, server actions, Supabase, auth
7. [`COMPONENTS.md`](./COMPONENTS.md) — copy-pasteable component recipes

---

## Stack snapshot (version-pinned — do not introduce mismatches)

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router) | `^16.1.7` |
| Language | TypeScript | `^5.9.2` |
| UI | React | `^19.1.1` |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) | `^4.1.13` |
| Motion | framer-motion | app-wide |
| 3D | `@react-three/fiber`, `@react-three/drei`, `three` | any page hero/accent |
| Smooth scroll | `lenis` + `@studio-freight/react-lenis` | app-wide |
| Scroll animation | `gsap` + `@gsap/react` (ScrollTrigger) | scroll-driven sections |
| Accessible primitives | `@radix-ui/react-*` (dialog, tooltip, dropdown) | interactive components |
| Component variants | `class-variance-authority` + `clsx` | variant props on UI primitives |
| Icons | `lucide-react` | app-wide |
| Database | PostgreSQL | Supabase |
| DB Client | Supabase JS SDK (`@supabase/supabase-js`, `@supabase/ssr`) | `^2.105.4`, `^0.6.1` |
| Storage | Supabase Storage | profile pictures |
| Auth | Supabase Auth (session-based) | built-in |
| OAuth | GitHub, Google | — |
| Lint | ESLint + `eslint-config-next` | `^9.35.0` |

**Approved animation stack priority:**
1. **Framer Motion** — default for entrances, hover, page transitions, stagger
2. **GSAP ScrollTrigger** — scroll-pinned sequences, timeline scrubbing, parallax beyond framer's capability
3. **R3F + Drei** — 3D hero moments, floating objects, environment lighting on any page
4. **Lenis** — smooth scroll inertia on all pages (wrap root layout)

Do not add: date pickers, form libraries (react-hook-form, formik), state managers (zustand, redux), fetch libraries (react-query, swr), or UI kits (shadcn bulk install, MUI, Chakra).

---

## The 10 non-negotiable rules

### 1. Server Components by default
**Rule.** Every file under `src/app/**/page.tsx`, `layout.tsx`, and any non-form helper is a Server Component. Add `"use client"` **only** when you need browser-only APIs (event handlers, `useState`, `useEffect`, framer-motion, R3F).
**Why.** Server Components own session + server-side data access. Client boundaries balloon bundle size and re-introduce data-fetching complexity.
**Do.** `// app/musicians/page.tsx` — server, fetches via the API layer.
**Don't.** Add `"use client"` to a page just to use framer-motion. Extract the animated block into a child client component instead.

### 2. Mutations are Server Actions
**Rule.** Every write goes through a `"use server"` function. No new REST routes for product mutations.
**Why.** Server Actions inherit Next's CSRF protection, run on the same origin, and avoid hand-rolled API boilerplate.
**Do.** `src/app/gigs/create/actions.ts` exporting `createGig(formData)`.
**Don't.** Add `src/app/api/gigs/route.ts`. See [`FRONTEND_ARCH.md`](./FRONTEND_ARCH.md) §Server Actions.

### 3. Supabase clients via helpers only
**Rule.** Server Actions/Components use `createSupabaseServerClient()` from `@/lib/supabase/server`. Admin-only tasks use `createSupabaseAdminClient()` from `@/lib/supabase/admin` and must never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
**Why.** Centralizes auth cookies and keeps service-role access server-only.

### 4. Auth via `getCurrentSession()` / `requireRole()`
**Rule.** Protected pages/actions call helpers from `@/lib/auth-guards` and re-check role inside the handler.
**Why.** Per-request server checks are the trust boundary. Middleware refreshes Supabase sessions but does not replace page/action checks.
**Do.**
```ts
const session = await requireRole("CREATOR", "/gigs/create");
```

### 5. Bright stage-light theme — no dark zinc
**Rule.** Use tokens in [`DESIGN.md`](./DESIGN.md): `#FAFAFA` page, `#0F172A` ink, `#0055FF`/`#FF3366`/`#FFB000` accents. Do **not** introduce `bg-zinc-950`, `text-zinc-100`, `border-zinc-800`, `violet-500`, or any class from the legacy dark shell into new code.
**Why.** Canonical theme is the landing-page bright cinematic style. The dark shell in `src/app/layout.tsx` + `src/app/globals.css` is **legacy** and being phased out.
**Do.** `className="bg-white text-[#0F172A] border border-[#F1F5F9]"`.
**Don't.** `className="bg-zinc-950 text-zinc-100"`.

### 6. Motion: layered animation stack
**Rule.** Use the right tool for the job — but always in this priority order:
1. **Framer Motion** for entrances, hover lifts, stagger reveals, page transitions.
2. **GSAP ScrollTrigger** for scroll-pinned timelines, scrubbed sequences, or parallax that framer can't do cleanly.
3. **R3F + Drei** for 3D hero accents on any page — floating geometry, environment glow, particle fields. Every R3F `<Canvas>` must be `pointer-events-none`, `aria-hidden="true"`, and wrapped in a `Suspense` with a fallback.
4. **Lenis** wraps the root layout for smooth scroll inertia. Import via `@studio-freight/react-lenis`.

**Why.** Layering these tools correctly = cinematic feel without jank. Wrong tool = animation fighting itself.
**Do.** GSAP + framer can coexist when GSAP owns scroll-driven transforms and framer owns entrance/exit.
**Don't.** Use GSAP and framer on the same element. Don't add R3F to a card grid — 3D is for heroes and focal moments only.

### 7. Icons: `lucide-react` only
**Rule.** `import { ArrowRight, Sparkles, PlayCircle } from "lucide-react"`. No emoji as UI, no inline SVG paths copied from Figma/Heroicons, no other icon packs.
**Why.** Visual consistency + tree-shaking.

### 8. App Router file discipline
**Rule.** Inside `src/app/**`, only route segment files: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `actions.ts`, `route.ts`. Co-located UI uses an underscore prefix to opt out of routing: `_profile-form.tsx`, `_ui.tsx`.
**Why.** Stops random files from becoming routes; keeps server/client boundaries explicit.
**Do.** Shared UI → `src/components/<feature>/<Name>.tsx`. Route-only client form → `src/app/<route>/_<name>.tsx`.

### 9. No new files without a home
**Rule.** Before creating a file, find the right folder. UI primitives → `src/components/ui/`. Feature components → `src/components/<feature>/`. Server helpers → `src/lib/`. Supabase schema/storage changes must be documented and confirmed when destructive.
**Why.** Folder sprawl is the #1 source of duplication in this repo (see the duplicated `_ui.tsx` between `musicians/` and `gigs/`).

### 10. Run lint + build before declaring done
**Rule.** `npm run lint` then `npm run build`. Both must pass.
**Why.** TypeScript catches missing props, Next catches RSC/client boundary violations, ESLint catches the rest.

---

## Migration notice (read carefully)

**`src/app/layout.tsx` and `src/app/globals.css` are LEGACY.** They use the dark zinc theme that predates the bright stage-light design system. New work must:

- Apply bright theme tokens (see [`DESIGN.md`](./DESIGN.md)) to any new page or component.
- Avoid editing legacy classes in `globals.css` (`.input-base`, `.btn-primary`, `.card`, etc.) — they're dark-theme presets that will be replaced.
- When touching `layout.tsx` or `globals.css`, propose the bright migration as part of the change (see [`UX_RULES.md`](./UX_RULES.md) §NavBar and [`COMPONENTS.md`](./COMPONENTS.md) §NavBar for the target spec).
- Reference implementation for the canonical theme: `src/components/home/HomeLanding.tsx`. **Read it before writing any new UI.**

---

## Definition of Done (agent self-check before reporting complete)

- [ ] Page is a Server Component unless it genuinely needs to be client.
- [ ] All mutations are Server Actions; session + role re-checked inside via `requireSignedIn()`, `requireUser()`, or `requireRole()`.
- [ ] Bright stage-light tokens used. No `bg-zinc-*`, no `violet-*`, no `text-zinc-*`.
- [ ] Icons are `lucide-react`. No emoji.
- [ ] Motion (if any) uses `framer-motion` with tokens from [`DESIGN.md`](./DESIGN.md). No R3F outside `src/components/home/`.
- [ ] Reduced-motion handled (`useReducedMotion()` for non-trivial animations).
- [ ] Loading + empty + error states present for any new async route.
- [ ] Form labels are `<label htmlFor>` bound to input `id`.
- [ ] `aria-hidden` on decorative icons; `aria-label` on icon-only buttons/links.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] No new dependencies were added without approval.
- [ ] Reused existing helpers (`createSupabaseServerClient()`, `createSupabaseAdminClient()`, API layer, auth guards) — did not duplicate.

---

## Commit + PR conventions

- **Conventional Commits.** `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `style:`, `perf:`.
- **Scope** = route or feature: `feat(gigs): add /gigs/[id]/loading skeleton`.
- **Body** explains the *why*, not the *what*.
- **PR title** under 70 chars. Body has `## Summary` (1–3 bullets) and `## Test plan` (checklist).
- One logical change per PR. No mixing refactor + feature.

---

## Things to ask about before doing

- Adding a dependency.
- Touching the database schema (additive changes are usually fine; destructive ones never without confirmation).
- Refactoring `src/app/layout.tsx`, `globals.css`, `src/lib/auth-guards.ts`, or `middleware.ts`.
- Introducing a new top-level route segment.
- Anything in [`PRODUCT.md`](./PRODUCT.md) §Out of scope.

---

## Critical files to read before writing code

| File | Why |
|---|---|
| `src/components/home/HomeLanding.tsx` | Canonical bright-theme reference. Copy patterns from here. |
| `src/components/home/StageLightsScene.tsx` | Only file allowed to import `@react-three/*` and `three`. |
| `src/app/page.tsx` | Server-side session + role resolution pattern. |
| `src/app/layout.tsx` | LEGACY dark shell — read so you know what to migrate away from. |
| `src/app/globals.css` | LEGACY token classes — do not extend. |
| `src/lib/supabase/server.ts` | Supabase server client factory. |
| `src/lib/supabase/admin.ts` | Server-only service-role client for auth admin + profile-picture storage. |
| `src/lib/auth-guards.ts` | Auth helpers: `getCurrentSession()`, `requireSignedIn()`, `requireUser()`, `requireRole()`. |

---

*Last updated: 2026-05-12.*
