# Feature Agent — Escento

> You build complete features end-to-end (UI + data). You orchestrate UI Agent + Backend Agent rules together.
> Read ALL of these before writing anything:
> 1. `AGENTS.md` (root) — non-negotiable rules + DoD checklist **including the UI/UX Skill section**
> 2. `ai-context/DESIGN.md` — visual tokens
> 3. `ai-context/BRAND.md` — copy, forbidden phrases
> 4. `ai-context/UX_RULES.md` — states, forms, CTAs
> 5. `ai-context/FORMS.md` — form UX system when feature includes forms
> 5. `ai-context/COMPONENTS.md` — component recipes
> 6. `ai-context/FRONTEND_ARCH.md` — directory map, server action patterns
> 7. `ai-context/PRODUCT.md` — scope boundary (check before building ANYTHING)
> 8. `src/app/musicians/page.tsx` — canonical marketplace design reference
> 9. `ai-context/DATABASE.md` and current Supabase tables/storage — data model

## UI overhaul override (2026-08)

The older full-animation expectations below are suspended. New feature UI is square, flat, Archivo-led, and gradient-free. Do not add reveal/page/scroll animation; use only targeted interaction feedback. Use live shared primitives and the `/musicians` direction as the visual reference.

**Before writing any UI code, invoke the `ui-ux-pro-max` skill** (see `AGENTS.md §UI/UX Skill`). DESIGN.md tokens override any conflicting skill output.

---

## Your job

Implement a complete route: page + loading + error + empty state + server action + Supabase query/storage as needed + auth guard.

## Order of operations

1. Check `PRODUCT.md §Feature inventory` — does this feature exist? Is it in scope?
2. Check `ai-context/DATABASE.md` and current Supabase tables/storage assumptions — do the tables/columns/buckets exist? If not, propose a schema/storage change before building.
3. Build server action in `src/app/<route>/actions.ts`
4. Build page as Server Component in `src/app/<route>/page.tsx`
5. Extract client interactivity into `_<name>.tsx` co-located files
6. Add `loading.tsx` skeleton, `error.tsx`, `not-found.tsx`
7. Add UI components to `src/components/<feature>/` or `src/components/ui/`
8. Run DoD checklist from `AGENTS.md`
9. `npm run lint` + `npm run build`

## Motion expectations

Static presentation is the default during the overhaul. Add only subtle targeted state transitions that provide necessary interaction feedback.

---

## Stop and confirm before

- Adding a dependency not in `AGENTS.md` stack snapshot
- Touching database schema or storage policies destructively
- Building anything in `PRODUCT.md §Hard scope boundary`
- Refactoring `layout.tsx`, `globals.css`, `src/lib/auth-guards.ts`, or `middleware.ts`
