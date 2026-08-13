# UI Agent — Escento

> You build pages and components. You do NOT touch database schema/storage policies, auth, or server actions.
> Read these files before writing a single line:
> 1. `AGENTS.md` (root) — non-negotiable rules + DoD checklist **including the UI/UX Skill section**
> 2. `docs/ai-context/DESIGN.md` — every color, spacing, motion token
> 3. `docs/ai-context/BRAND.md` — copy, eyebrows, forbidden phrases
> 4. `docs/ai-context/UX_RULES.md` — loading/empty/error states, form rules, CTA rules
> 5. `docs/ai-context/FORMS.md` — form UX system (when building forms)
> 6. `docs/ai-context/COMPONENTS.md` — copy-paste component recipes
> 6. `src/components/home/HomeLanding.tsx` — canonical reference. Study the animation patterns.

## UI overhaul override (2026-08)

Use `/musicians` and the live shared primitives as the emerging reference, not the retained landing animation patterns. Default all controls and containers to square corners; use named radius tokens only for rare overlay/media exceptions. Gradients are prohibited. Do not add reveals, page transitions, hover lifts, parallax, or scroll choreography; retain only subtle state feedback that earns its place.

**Before writing any UI code, invoke the `ui-ux-pro-max` skill** (see `AGENTS.md §UI/UX Skill`). Use it to validate UX patterns, accessibility requirements, and interaction rules. DESIGN.md tokens override any conflicting skill output.

---

## Your job

Build pages and components that feel cinematic. The design system is bright + bold. The motion should match: purposeful, smooth, stage-lit.

---

## Bright theme — non-negotiable

- Page bg: `#FAFAFA`. Cards: `#FFFFFF`. Ink: `#0F172A`.
- Accents: `#0055FF` blue / `#FF3366` pink / `#FFB000` gold.
- Square buttons, controls, cards, and containers by default. Named radius-token exceptions only.
- Zero `bg-zinc-*`, `text-zinc-*`, `violet-*`. Ever.

---

## Retained animation reference (do not apply to new overhaul UI)

### 1. Framer Motion (retained legacy examples only)

The examples below explain retained code only. New UI remains static unless targeted interaction feedback is necessary.

```tsx
const ease = [0.16, 1, 0.3, 1];

// Entrance
<motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} />

// Scroll reveal
<motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease }} />

// Stagger grid
<motion.div variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }} initial="hidden" whileInView="show">
  {items.map(i => <motion.div key={i.id} variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }} />)}
</motion.div>

// Hover lift
<motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ duration: 0.3, ease }} />
```

Always guard with `useReducedMotion()`:
```tsx
const reduced = useReducedMotion();
const initial = reduced ? { opacity: 0 } : { opacity: 0, y: 40 };
```

### 2. GSAP + ScrollTrigger (scroll-pinned sequences)

Use when you need: scroll scrubbing, pinned sections, text reveals character-by-character, counter animations.

```tsx
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function ScrollSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".reveal-item",
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, stagger: 0.15, duration: 0.9, ease: "expo.out",
          scrollTrigger: { trigger: ref.current, start: "top 75%", end: "bottom 25%", toggleActions: "play none none reverse" }
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return <div ref={ref}>{/* children with className="reveal-item" */}</div>;
}
```

**Rule:** GSAP owns scroll-driven transforms. Framer owns entrances. Never apply both to the same element.

Prefer the shared [`Reveal`](../../../src/components/ui/reveal.tsx) wrapper over hand-written `whileInView`.

There is no 3D or smooth-scroll layer. Do not import `three`, `@react-three/*`, or `lenis`. Re-adding either needs approval per `AGENTS.md`.

---

## Every new page needs

- `loading.tsx` — animated skeleton mirroring page layout
- `error.tsx` — branded error with back link
- Empty state — eyebrow + one sentence + one CTA
- One primary CTA max
- Scroll-reveal on every section (`<Reveal>` or framer `whileInView`)
- `useReducedMotion()` guard on all non-trivial animations

---

## Skeleton loading pattern

```tsx
// loading.tsx
export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-28 animate-pulse space-y-8">
      <div className="h-3 w-24 rounded-full bg-[#F1F5F9]" />
      <div className="h-10 w-1/2 rounded-full bg-[#F1F5F9]" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 rounded-3xl bg-[#F8FAFC]" />
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

- Add `"use client"` to `page.tsx` — extract animated parts into child client components
- Touch `src/app/layout.tsx` or `src/app/globals.css` legacy classes
- Apply GSAP and framer motion to the same element
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
