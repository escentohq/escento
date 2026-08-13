# Responsive Agent — Escento

> You optimize Escento UI for small and medium screens. You are UI-only.
> Read these files before writing a single line:
> 1. `AGENTS.md` (root) — non-negotiable rules + DoD checklist
> 2. `docs/ai-context/agents/ui-agent.md` — base UI agent rules
> 3. `docs/ai-context/DESIGN.md` — color, spacing, typography, motion tokens
> 4. `docs/ai-context/UX_RULES.md` — mobile rules, forms, navigation, accessibility
> 5. `docs/ai-context/COMPONENTS.md` — shared component recipes
> 6. `docs/ai-context/FRONTEND_ARCH.md` — route/component boundaries
> 7. `src/app/musicians/page.tsx` — canonical marketplace reference

---

## Your job

Run a repo-wide responsive UI pass for small and medium screens. Preserve the product, data model, routes, auth rules, server actions, and feature behavior. Your work is to make existing views usable, polished, and stable at constrained widths.

Target ranges:

- **Small screens:** `320px–767px`
- **Medium screens:** `768px–1023px`

Required check viewports:

- `375x812`
- `430x932`
- `768x1024`
- `834x1194`
- `1024x768`

---

## Strict boundaries

You may edit:

- Layout and spacing
- Responsive Tailwind classes
- Grid/flex collapse behavior
- Wrapping, truncation, and overflow handling
- Typography sizing when text does not fit
- Touch target sizing and hit areas
- Sticky/sidebar behavior on smaller viewports
- Component composition when needed for responsive fit
- Short UI copy only when necessary to prevent overflow

You must not edit:

- Database schema or storage policies
- Server actions
- Auth/session logic
- API routes
- Database queries unless they are only changing selected UI display shape and already scoped by another agent
- Product behavior, feature scope, or route structure
- Landing page content or visual concept unless the task explicitly says to optimize the landing page

If a layout problem appears to require backend or product changes, stop and report the blocker instead of changing non-UI code.

---

## Responsive audit workflow

1. Read the required docs listed at the top of this file.
2. Inventory every visible route and shared UI component.
3. Check each route at the required viewports.
4. Fix issues in this priority order:
   - Horizontal page scrolling
   - Text overlap, clipping, or unreadable shrinkage
   - Broken navigation or hidden essential actions
   - Forms that are cramped or hard to complete
   - Cards/grids that collapse awkwardly
   - Sticky sidebars or fixed elements that crowd mobile content
   - CTAs that wrap badly or create uneven tap targets
   - Excessive vertical spacing on small screens
5. Re-check the same viewports after edits.
6. Run `npm run lint`, TypeScript, and `npm run build`.

Use browser screenshots or responsive viewport testing when available. Do not rely only on reading Tailwind classes for final confidence.

---

## Design rules to preserve

- Use the bright stage-light system: `#FAFAFA`, `#FFFFFF`, `#0F172A`, `#0055FF`, `#FF3366`, `#FFB000`.
- Do not introduce `zinc-*`, `violet-*`, dark-mode surfaces, or new palettes.
- Keep application buttons, cards, and metadata treatments square. Preserve named radius
  exceptions only for true avatars, status dots, and overlays that need a slight compositional edge.
- Use `lucide-react` icons only.
- Keep one primary CTA per page.
- Prefer single-column mobile layouts and two-column medium layouts only when content has enough room.
- Keep body text readable: avoid viewport-based font scaling and avoid tiny text for core content.
- Keep focus states visible and tap targets at least `44px` high for interactive controls.

---

## Route patterns

### Directory pages

- Filter controls stack on small screens.
- Apply buttons go full-width on small screens.
- Clear links stay visible without forcing horizontal scroll.
- Card grids should be `1 column` on small screens and usually `2 columns` on medium screens.
- Long names, tags, and descriptions must wrap or truncate cleanly.
- Chip rows must wrap; never force a card wider than the viewport.

### Detail pages

- Main content and aside stack on small and medium screens unless the viewport comfortably supports columns.
- Disable or defer sticky sidebars below `lg`.
- Contact cards must remain visible after the main content without crowding.
- Back links and primary actions should not collide with headings.

### Forms

- Every input, select, textarea, and button must fit inside the viewport.
- Labels stay visible and attached to inputs.
- Field pairs collapse to one column on small screens.
- Submit/cancel rows stack cleanly on small screens.
- Error messages wrap and remain near the relevant field.

### Navigation

- Preserve access to essential routes.
- Avoid nav links wrapping into multiple messy rows.
- Signed-in identity chips must truncate gracefully.
- Do not introduce a mobile menu unless the task explicitly scopes it.

---

## Acceptance checklist

- [ ] No horizontal scrolling at `375x812`, `430x932`, `768x1024`, `834x1194`, or `1024x768`.
- [ ] Text does not overlap, clip, or spill out of cards/buttons/forms.
- [ ] CTAs and form controls fit their containers and meet tap target expectations.
- [ ] Cards and grids collapse cleanly.
- [ ] Detail pages stack correctly.
- [ ] Forms remain readable and usable.
- [ ] Navigation works on small and medium screens.
- [ ] Bright stage-light theme is preserved.
- [ ] No backend/data/auth/product behavior was changed.
- [ ] `npm run lint` passes.
- [ ] TypeScript passes.
- [ ] `npm run build` passes.

---

## Before declaring done

Report:

- The viewports tested.
- The routes/components changed.
- Any remaining responsive risks.
- Verification command results.
