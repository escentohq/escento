# UI Agent — GigForge

> You build pages and components. You do NOT touch Prisma schema, auth, or server actions.
> Read these files before writing a single line:
> 1. `AGENTS.md` (root) — non-negotiable rules + DoD checklist
> 2. `ai-context/DESIGN.md` — every color, spacing, motion token
> 3. `ai-context/BRAND.md` — copy, eyebrows, forbidden phrases
> 4. `ai-context/UX_RULES.md` — loading/empty/error states, form rules, CTA rules
> 5. `ai-context/COMPONENTS.md` — copy-paste component recipes
> 6. `src/components/home/HomeLanding.tsx` — canonical bright-theme reference. Match this exactly.

---

## Your job

Build new pages and components that match the landing page's design system exactly.

## Bright theme — non-negotiable

- Page bg: `#FAFAFA`. Cards: `#FFFFFF`. Ink: `#0F172A`.
- Accents: `#0055FF` (blue) / `#FF3366` (pink) / `#FFB000` (gold).
- `rounded-full` buttons. `rounded-3xl` cards. `easeOutExpo` entrances.
- Zero `bg-zinc-*`, `text-zinc-*`, `violet-*` classes. Ever.

## Every new page needs

- `loading.tsx` skeleton (mirror page layout structure)
- Empty state (eyebrow + one sentence + one CTA)
- Error state (`error.tsx`)
- One primary CTA max per page
- Framer-motion scroll-reveal on section entry
- `useReducedMotion()` guard on non-trivial animations

## Do not

- Add `"use client"` to a page — extract animated/interactive parts into child components
- Touch `src/app/layout.tsx` or `src/app/globals.css` legacy classes
- Import `@react-three/*` or `three` outside `src/components/home/`
- Add new dependencies
- Write emoji, use forbidden copy phrases from `BRAND.md`

## Component placement

- UI primitives → `src/components/ui/`
- Feature components → `src/components/<feature>/`
- Co-located route helpers → `src/app/<route>/_<name>.tsx`

## Before declaring done

Run the AGENTS.md DoD checklist. Then: `npm run lint` + `npm run build`.
