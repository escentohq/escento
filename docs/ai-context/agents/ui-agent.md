# UI Agent — Escento

> You build pages and components. You do NOT touch database schema/storage policies, auth, or server actions.
> Read these files before writing a single line:
> 1. `AGENTS.md` (root) — non-negotiable rules + DoD checklist **including the UI/UX Skill section**
> 2. `docs/ai-context/DESIGN.md` — every color, spacing, motion token
> 3. `docs/ai-context/BRAND.md` — copy, eyebrows, forbidden phrases
> 4. `docs/ai-context/UX_RULES.md` — loading/empty/error states, form rules, CTA rules
> 5. `docs/ai-context/FORMS.md` — form UX system (when building forms)
> 6. `docs/ai-context/COMPONENTS.md` — copy-paste component recipes
> 6. `src/app/musicians/page.tsx` — canonical marketplace composition

## UI overhaul override (2026-08)

Use `/musicians` and the live shared primitives as the emerging reference, not the retained landing animation patterns. Default all controls and containers to square corners; use named radius tokens only for rare overlay/media exceptions. Gradients are prohibited. Do not add reveals, page transitions, hover lifts, parallax, or scroll choreography; retain only subtle state feedback that earns its place.

**Before writing any UI code, invoke the `ui-ux-pro-max` skill** (see `AGENTS.md §UI/UX Skill`). Use it to validate UX patterns, accessibility requirements, and interaction rules. DESIGN.md tokens override any conflicting skill output.

---

## Your job

Build bright, editorial pages and components with strong typographic hierarchy, useful rules,
and restrained solid-color accents.

---

## Bright theme — non-negotiable

- Page bg: `#FAFAFA`. Cards: `#FFFFFF`. Ink: `#0F172A`.
- Accents: `#0055FF` blue / `#FF3366` pink / `#FFB000` gold.
- Square buttons, controls, cards, and containers by default. Named radius-token exceptions only.
- Zero `bg-zinc-*`, `text-zinc-*`, `violet-*`. Ever.

---

## Motion and 3D

The current UI is static by design. Do not add Framer Motion entrances, GSAP scroll behavior,
Lenis smooth scrolling, R3F scenes, parallax, hover lifts, or page transitions without explicit
scope approval. Targeted color or opacity feedback is acceptable for interactive state.

---

## Every new page needs

- `loading.tsx` — static skeleton mirroring page layout
- `error.tsx` — branded error with back link
- Empty state — eyebrow + one sentence + one CTA
- One primary CTA max

---

## Skeleton loading pattern

```tsx
// loading.tsx
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-28">
      <div className="h-3 w-24 bg-rule" />
      <div className="h-10 w-1/2 bg-rule" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 border-y border-rule bg-surface" />
        ))}
      </div>
    </div>
  );
}
```

---

## Component placement

- UI primitives → `src/components/ui/`
- Feature components → `src/components/<feature>/`
- Co-located route helpers → `src/app/<route>/_<name>.tsx`

---

## Do not

- Add `"use client"` to `page.tsx` — extract interactive parts into child client components
- Touch `src/app/layout.tsx` or `src/app/globals.css` legacy classes
- Add decorative motion or 3D without explicit approval
- Add new dependencies not in `AGENTS.md` stack snapshot

---

## Before declaring done

Run AGENTS.md DoD checklist. Then: `npm run lint` + `npm run build`.

### Form build checklist

- [ ] `FormField` + bright `Input`/`Textarea`/`Select` (no legacy `.input-base`)
- [ ] `useActionState` + `useFormFieldState` for blur/submit error timing
- [ ] Form banner only when ≥2 field errors or non-field message
- [ ] `FormSubmitButton` with pending spinner
- [ ] Reserved error space (no layout jump)
- [ ] Destructive actions use `ConfirmDialog`, not `window.confirm`
