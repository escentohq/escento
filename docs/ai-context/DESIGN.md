# DESIGN.md — Escento

> Canonical visual system. **Bright stage-light theme.** All new UI uses these tokens.
> References: [`src/app/musicians/page.tsx`](../src/app/musicians/page.tsx) for marketplace UI and [`src/components/home/HomeLanding.tsx`](../src/components/home/HomeLanding.tsx) for public editorial UI.

## UI overhaul override (2026-08)

This section supersedes conflicting recipes below while those sections are incrementally revised.

- Typography: Archivo via `next/font`; use bold display type selectively, not blanket `font-black`.
- Shape: controls and containers use `0px` radius by default. Rare overlay/media exceptions come from the centralized tokens in `src/app/globals.css`, not scattered `rounded-*` utilities.
- Color: `#FAFAFA` and `#0F172A` dominate. `#0055FF` is the primary action color; `#FF3366` and `#FFB000` are sparse signals.
- Composition: flat editorial rows, rules, alignment, whitespace, and content hierarchy replace floating card grids.
- Gradients: prohibited everywhere in `src`, including marketing surfaces.
- Motion: no routine reveals, page transitions, hover lifts, parallax, or scroll choreography. Use only subtle targeted state transitions when an interaction needs feedback.
- Reference direction: `/musicians` is the canonical marketplace surface. The rebuilt `HomeLanding.tsx` is the static public reference.

---

## Theme intent

Performance-inspired, bright, and editorial. The product is for student musicians and creators—it
should feel closer to a well-set music publication than a SaaS dashboard. Strong Archivo headlines,
asymmetric composition, real marketplace content, and musician imagery carry identity before color
does. Blue is allowed at meaningful scale on landing and detail surfaces; coral and amber remain
specific signals rather than a multicolor theme.

The root shell and global tokens now use the bright foundation. Do not use any `zinc-*` or `violet-*` Tailwind class.

---

## Color tokens

The live tokens are defined in `src/app/globals.css`. Use those names rather than scattering raw
values through components.

### Surfaces (light)

| Token | Hex | Use |
|---|---|---|
| Page | `#FAFAFA` | App background, landing background |
| Card | `#FFFFFF` | Default card / panel |
| Muted | `#F8FAFC` | Alternating section background, inset blocks |
| Divider | `#F1F5F9` | Card borders, section borders, hover bg |
| Subtle | `#E2E8F0` | Strong borders (e.g., secondary CTA outline) |

### Surfaces (dark — for inverted blocks)

| Token | Hex | Use |
|---|---|---|
| Ink | `#0F172A` | Primary CTA bg, dark "feature card" bg, body text on light |
| Ink muted | `#1E293B` | Inset inside dark card (icon tile, inner button) |

### Text

| Token | Hex | Use |
|---|---|---|
| Primary | `#0F172A` | Headlines, body emphasis on light surface |
| Body | `#475569` | Paragraph body on light surface |
| Secondary | `#64748B` | Meta, eyebrows, helper text |
| On-dark body | `#CBD5E1` | Body inside dark card |
| On-dark muted | `#94A3B8` | Meta inside dark card |

### Accents (the three stage lights)

| Token | Hex | Personality | Primary use |
|---|---|---|---|
| Blue | `#0055FF` | Momentum, clarity | Primary controls, links, status `open` |
| Pink | `#FF3366` | Cultural heat | Destructive or exceptional secondary accent |
| Gold | `#FFB000` | Stage, performance | Tertiary accent used sparingly |

State and subtle-surface variants are centralized alongside the base colors: blue hover `#0047D6`,
blue pressed `#0039AD`, blue subtle `#EFF6FF`, coral subtle `#FFF1F4`, and amber subtle `#FFF7E0`.

**Use deliberately.** Product-heavy pages remain 80–90% neutral. Public, profile, and detail pages
may use one large blue field; coral is an occasional editorial/destructive signal, and amber denotes
compensation or warning. Do not make all three accents compete in one section. Gradients are prohibited.

### Status mapping

| State | Treatment |
|---|---|---|
| Gig `OPEN` | Blue outline and text |
| Gig `CLOSED` (display: "Filled") | Coral outline and text |
| Musician `Available` | Blue outline and text |
| `Paid` | Amber outline with dark amber text |

---

## Typography

Archivo is loaded through `next/font`. Display type is bold but restrained; body and metadata use
the centralized typography utilities in `globals.css`.

### Scale

| Role | Classes |
|---|---|
| Hero H1 | `text-display` |
| Page H1 | `text-page-title` |
| Section H2 | `text-section-heading` |
| Item title | `text-item-heading` |
| Body | `text-body` |
| Body small | `text-secondary` |
| Eyebrow / metadata | `text-meta uppercase tracking-[0.18em]` |
| Button label | `text-control` |

### Selection

```css
selection:bg-[#0055FF] selection:text-white
```

Applied at the page-root level (see `HomeLanding.tsx`).

---

## Spacing

Vertical rhythm is large. Sections breathe.

| Use | Value |
|---|---|
| Page container | `max-w-6xl mx-auto px-6` |
| Section vertical pad | `py-28` |
| Hero pad-top | `pt-24` (hero pulls the navbar in with `-mt-6` if breaking out) |
| Card pad | `p-8` |
| Inner card pad (SectionCard) | `p-6` |
| Stack between sections | `space-y-12` to `space-y-16` |
| Stack within card | `space-y-3` (heading→body) to `space-y-6` (sections) |
| Gap in grids | `gap-8` (cards), `gap-12` (sections), `gap-4` (CTAs) |
| Form section gap | `space-y-8` |
| Label→input gap | `mt-2` |

Narrower containers for forms: `max-w-3xl`. For auth + onboarding: `max-w-md` to `max-w-xl`.

## Page-level composition

- Landing: one substantial, content-led blue focal field in the first viewport; live profile imagery
  and listing data are preferred to decorative graphics or fake browser mockups.
- Directories and product screens: dense rule-separated rows on neutral surfaces. A restrained blue
  title rail or active state is enough; scanability wins over spectacle.
- Musician and gig details: a blue identity header may carry more personality. Profile imagery stays
  editorial and square in the feature field; circular media remains appropriate in compact result rows.
- Compensation may use an amber rule and subtle amber surface because the color has semantic meaning.
- Vary section proportion and alignment instead of repeating heading/paragraph/grid compositions.

---

## Radius

Application controls and containers use `0px`. Do not scatter Tailwind `rounded-*` utilities.
The approved named exceptions in `globals.css` are true circular avatars/status dots and a slight
overlay radius where it improves composition.

---

## Shadow

Application surfaces are flat. Use rules, contrast, spacing, and solid color instead of card or
control shadows. An overlay may earn a restrained shadow only when separation from content cannot
be established cleanly with a border.

## Interaction

Interactive color feedback uses the centralized fast duration (`140ms`) or the equivalent
`duration-150` utility. Target only relevant properties such as color, background, border, or opacity.
No hover lift, scaling, reveals, page transitions, or scroll choreography.

---

## Borders

| Use | Class |
|---|---|
| Section divider | `border-t border-[#F1F5F9]` |
| Card border | `border border-[#F1F5F9]` |
| Strong border (secondary CTA) | `border-2 border-[#E2E8F0]` |
| CTA hover border | `hover:border-[#0F172A]` |
| Input border | `border border-[#E2E8F0]` |
| Input focus border | `focus:border-[#0055FF]` |

No dashed, no doubled, no rounded-on-one-side trickery.

---

## Focus ring (a11y critical)

Apply everywhere interactive. Do **not** use `focus:outline-0` without a replacement ring.

```
focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2
```

For inputs, replace outline with ring:

### Form feedback tokens

| Token | Value | Usage |
|---|---|---|
| Field error text | `#B42318` | Inline under field (`formErrorTextClass`) |
| Field error border | `#FDA29B` | Invalid input border |
| Form error banner bg | `#FEF3F2` | `FormErrorBanner` error variant |
| Form success banner bg | `#ECFDF3` | Inline success after save |
| Form info banner bg | `#EFF6FF` | Email confirmation, neutral info |
| Warning accent | `#FFB000` | Non-blocking guidance |

Invalid inputs: `border-[#FDA29B] focus:border-[#B42318] focus:ring-[#B42318]/20`.

See [`FORMS.md`](./FORMS.md) and `src/lib/form-input-classes.ts`.

```
focus:outline-none focus:ring-2 focus:ring-[#0055FF]/20 focus:border-[#0055FF]
```

---

## Motion tokens

The current application is intentionally static. Do not add page transitions, entrance reveals,
scroll choreography, parallax, hover lifts, scale effects, or looping decoration. Routine controls
may use a targeted color or opacity transition when it materially clarifies interaction state;
avoid blanket `transition-all`.

If a future feature earns expressive motion, scope and approve it separately and preserve
`prefers-reduced-motion` behavior.

---

## 3D / R3F policy

The previous stage-light scene was removed during the static editorial redesign. Do not add a new
R3F/Three surface without explicit scope approval.

---

## Gradients

Gradients are not part of the current design system. Use solid brand colors, rules, typography,
spacing, and imagery to establish hierarchy.

---

## Do / Don't snippets

### Card

✅ **Do** (bright stage-light):
```tsx
<section className="border-y border-rule bg-surface py-8">
  {/* editorial content */}
</section>
```

### Chip

✅ **Do**:
```tsx
<span className="border-l-2 border-brand pl-2 text-meta uppercase tracking-wider text-brand">
  Jazz
</span>
```

### Primary CTA

✅ **Do** (matches landing hero):
```tsx
<Link
  href="/musicians"
  className="inline-flex min-h-12 items-center justify-center gap-2 border border-ink bg-ink px-6 py-3 text-control text-white hover:bg-brand"
>
  Browse musicians
  <ArrowRight className="h-4 w-4" aria-hidden="true" />
</Link>
```

### Eyebrow

✅ **Do**:
```tsx
<span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
  Now playing
</span>
```

### Dark featured section

```tsx
<section className="bg-ink px-6 py-16 text-white">
  {/* content */}
</section>
```

---

## Iconography

`lucide-react` only. Sizing:

| Use | Class |
|---|---|
| Button icon | `h-4 w-4` |
| Card icon | `h-6 w-6` to `h-8 w-8` |
| Decorative section icon | `h-8 w-8`; use sparingly and without a decorative tile |

Decorative icons need `aria-hidden`. Icon-only buttons need `aria-label`.

---

## What stays stable (do not change without re-scoping)

- The bright off-white base + slate ink palette
- Three accents: blue / pink / gold
- Archivo typography with restrained bold display headings
- Compact uppercase metadata labels
- Square, flat application controls and containers
- Static presentation with targeted interaction-state feedback only
- `/musicians` as the canonical marketplace reference
