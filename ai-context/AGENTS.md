# AGENTS.md — GigForge

> Canonical instructions for AI coding agents (Codex, Claude Code, Cursor, Copilot, Gemini).
> If you are an agent: **read this file first, every session.** Then read the topical doc that matches your task.

---

## Read order

1. **AGENTS.md** (this file) — rules, stack, DoD, conventions
2. [`PRODUCT.md`](./PRODUCT.md) — product scope and what NOT to build
3. [`BRAND.md`](./BRAND.md) — voice, copy patterns, forbidden phrases
4. [`DESIGN.md`](./DESIGN.md) — color, type, spacing, motion tokens
5. [`UX_RULES.md`](./UX_RULES.md) — interactions, loading/empty/error, a11y
6. [`FRONTEND_ARCH.md`](./FRONTEND_ARCH.md) — Next.js, server actions, Prisma, auth
7. [`COMPONENTS.md`](./COMPONENTS.md) — copy-pasteable component recipes

---

## Stack snapshot (version-pinned — do not introduce mismatches)

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router) | `^16.1.7` |
| Language | TypeScript | `^5.9.2` |
| UI | React | `^19.1.1` |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) | `^4.1.13` |
| Motion | framer-motion | (landing uses; pin to current) |
| 3D | `@react-three/fiber`, `@react-three/drei`, `three` | (landing-only) |
| Icons | `lucide-react` | (landing uses; pin to current) |
| ORM | Prisma | `^6.16.1` |
| DB | PostgreSQL | 16 (Docker) |
| Auth | NextAuth v4 + Prisma Adapter + JWT | `^4.24.11` |
| OAuth | GitHub, Google | — |
| Lint | ESLint + `eslint-config-next` | `^9.35.0` |

If a library you want to add is not on this list, **stop** and ask. Do not add date pickers, form libraries, UI kits, state managers, or fetch libraries without approval.

---

## The 10 non-negotiable rules

### 1. Server Components by default
**Rule.** Every file under `src/app/**/page.tsx`, `layout.tsx`, and any non-form helper is a Server Component. Add `"use client"` **only** when you need browser-only APIs (event handlers, `useState`, `useEffect`, framer-motion, R3F).
**Why.** Server Components own session + Prisma access. Client boundaries balloon bundle size and re-introduce data-fetching complexity.
**Do.** `// app/musicians/page.tsx` — server, fetches via Prisma directly.
**Don't.** Add `"use client"` to a page just to use framer-motion. Extract the animated block into a child client component instead.

### 2. Mutations are Server Actions
**Rule.** Every write goes through a `"use server"` function. No new REST routes except `/api/auth/[...nextauth]`.
**Why.** Server Actions inherit Next's CSRF protection, run on the same origin, and avoid hand-rolled API boilerplate.
**Do.** `src/app/gigs/create/actions.ts` exporting `createGig(formData)`.
**Don't.** Add `src/app/api/gigs/route.ts`. See [`FRONTEND_ARCH.md`](./FRONTEND_ARCH.md) §Server Actions.

### 3. Prisma via `@/lib/db` only
**Rule.** Import the singleton: `import { db } from "@/lib/db"`. Never `new PrismaClient()`.
**Why.** Hot-reload in dev otherwise creates dozens of connections and blows the pool.

### 4. Auth via `getServerSession(authOptions)`
**Rule.** Every protected page and action calls `const session = await getServerSession(authOptions)` and re-checks role inside the handler.
**Why.** JWT can be replayed; per-request server check is the trust boundary. Middleware only protects `/onboarding/*` today.
**Do.**
```ts
if (session?.user?.role !== "CREATOR") redirect("/");
```

### 5. Bright stage-light theme — no dark zinc
**Rule.** Use tokens in [`DESIGN.md`](./DESIGN.md): `#FAFAFA` page, `#0F172A` ink, `#0055FF`/`#FF3366`/`#FFB000` accents. Do **not** introduce `bg-zinc-950`, `text-zinc-100`, `border-zinc-800`, `violet-500`, or any class from the legacy dark shell into new code.
**Why.** Canonical theme is the landing-page bright cinematic style. The dark shell in `src/app/layout.tsx` + `src/app/globals.css` is **legacy** and being phased out.
**Do.** `className="bg-white text-[#0F172A] border border-[#F1F5F9]"`.
**Don't.** `className="bg-zinc-950 text-zinc-100"`.

### 6. Motion: framer-motion app-wide, R3F landing-only
**Rule.** `framer-motion` enter/scroll/hover animations are welcome on any page. `@react-three/fiber`, `@react-three/drei`, and `three` may **only** be imported from `src/components/home/`.
**Why.** R3F has a real bundle + perf cost. The stage scene is a deliberate brand moment, not a general decoration primitive.
**Do.** Reuse motion tokens from [`DESIGN.md`](./DESIGN.md) §Motion.
**Don't.** Add a `<Canvas>` to a directory page header.

### 7. Icons: `lucide-react` only
**Rule.** `import { ArrowRight, Sparkles, PlayCircle } from "lucide-react"`. No emoji as UI, no inline SVG paths copied from Figma/Heroicons, no other icon packs.
**Why.** Visual consistency + tree-shaking.

### 8. App Router file discipline
**Rule.** Inside `src/app/**`, only route segment files: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `actions.ts`, `route.ts`. Co-located UI uses an underscore prefix to opt out of routing: `_profile-form.tsx`, `_ui.tsx`.
**Why.** Stops random files from becoming routes; keeps server/client boundaries explicit.
**Do.** Shared UI → `src/components/<feature>/<Name>.tsx`. Route-only client form → `src/app/<route>/_<name>.tsx`.

### 9. No new files without a home
**Rule.** Before creating a file, find the right folder. UI primitives → `src/components/ui/`. Feature components → `src/components/<feature>/`. Server helpers → `src/lib/`. Schema → `prisma/`.
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
- [ ] All mutations are Server Actions; session + role re-checked inside.
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
- [ ] Reused existing helpers (`db`, `authOptions`, future `parseCsv`) — did not duplicate.

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
- Touching the Prisma schema (additive migrations are usually fine; destructive ones never without confirmation).
- Refactoring `src/app/layout.tsx`, `globals.css`, `src/auth.ts`, or NextAuth callbacks.
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
| `src/auth.ts` | NextAuth config, JWT role refresh. |
| `src/lib/db.ts` | Prisma singleton. |
| `prisma/schema.prisma` | Data model source of truth. |

---

*Last updated: 2026-05-12.*
