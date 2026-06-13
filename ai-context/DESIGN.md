# DESIGN.md — Escento

> Canonical visual system. **Bright stage-light theme.** All new UI uses these tokens.
> Reference implementation: [`src/components/home/HomeLanding.tsx`](../src/components/home/HomeLanding.tsx).

---

## Theme intent

Performance-inspired, bright, cinematic. The product is for student musicians and creators — it should feel like a tour poster, not a SaaS dashboard. Three stage-light accents (blue / pink / gold) sit on an off-white field with deep slate ink. Black-weight headlines anchor sections; mono eyebrows label them.

The **dark zinc shell** in `src/app/layout.tsx` + `src/app/globals.css` is legacy. Do not extend it. Do not use any `zinc-*` or `violet-*` Tailwind class.

---

## Color tokens

Every color in the system. Use these exact hex values — do not approximate, do not introduce variants.

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
| Blue | `#0055FF` | Momentum, clarity | Primary accent, hover glow, links, status `open` |
| Pink | `#FF3366` | Cultural heat | Secondary accent, status pills on dark cards |
| Gold | `#FFB000` | Stage, performance | Tertiary accent, gradient terminus |

**Use sparingly.** Each section gets at most one dominant accent. The full gradient (`blue → pink → gold`) appears at most **once per page** — reserve it for the marquee headline word or the hero badge.

### Accent tints

- `bg-[#0055FF]/10` — soft blue pill background (status: open, available)
- `bg-[#0055FF]/5` — hover shadow tint
- `bg-[#FF3366]/10` — pink pill background
- `bg-[#FF3366]/20` — pink pill bg on dark cards
- `bg-[#FFB000]/10` — gold pill background

### Status mapping

| State | Background | Text |
|---|---|---|
| Gig `OPEN` | `bg-[#0055FF]/10` | `text-[#0055FF]` |
| Gig `CLOSED` (display: "Filled") | `bg-[#FF3366]/10` | `text-[#FF3366]` |
| Musician `Available` | `bg-[#0055FF]/10` | `text-[#0055FF]` |
| `Paid` | `bg-[#FFB000]/10` | `text-[#FFB000]` (dark variant: `#FFB000` on `#1E293B`) |

---

## Typography

System font stack (Tailwind default). Black-weight display, medium body, monospace eyebrows.

### Scale

| Role | Classes |
|---|---|
| Hero H1 | `text-6xl md:text-8xl font-black tracking-tighter leading-[0.95]` |
| Section H2 | `text-4xl md:text-5xl font-black tracking-tight` |
| Sub-section H3 | `text-2xl font-bold` |
| Card title | `text-lg font-bold leading-tight` |
| Body | `text-base font-medium leading-relaxed text-[#475569]` (md: `text-lg`) |
| Body small | `text-sm font-medium text-[#475569]` |
| Eyebrow | `font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]` |
| Meta | `text-sm font-mono text-[#64748B]` |
| Button label | `text-sm font-bold tracking-wide` |

### Headline gradient (use once per page)

```tsx
<span className="bg-linear-to-r from-[#0055FF] via-[#FF3366] to-[#FFB000] bg-clip-text text-transparent">
  Stage.
</span>
```

The gradient applies to **one word**, not the entire headline.

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

---

## Radius

| Element | Value |
|---|---|
| Card | `rounded-3xl` |
| Inner card / section-card | `rounded-2xl` |
| Input / select / textarea | `rounded-2xl` |
| Button (CTA) | `rounded-full` |
| Chip / badge / status pill | `rounded-full` |
| Avatar | `rounded-full` |
| Icon tile (square) | `rounded-2xl` |

Never `rounded-md` or `rounded-lg` — too tight for this scale.

---

## Shadow

Cards are flat at rest. Lift comes on hover only.

```
shadow-sm                            # default card
hover:shadow-xl hover:shadow-[#0055FF]/10   # blue-tinted lift (default cards)
hover:shadow-2xl hover:shadow-[#FF3366]/20  # pink-tinted lift (dark feature cards)
hover:shadow-[0_0_40px_-10px_#0055FF]       # CTA glow on the dark pill button
```

Never use raw `shadow-md`/`shadow-lg` without an accent tint — they look generic.

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

**Library:** `framer-motion` for app-wide motion. `@react-three/fiber` only inside `src/components/home/`.

### Easings

```ts
const easeOutExpo = [0.16, 1, 0.3, 1] as const;  // canonical entrance easing
```

Use `easeOutExpo` on every hero / section entrance. Never the default `"easeInOut"`.

### Durations

| Use | Duration |
|---|---|
| Hero element entrance | `0.8` |
| Card / section reveal | `0.6` |
| Small fade (pills, helper text) | `0.5` |
| Hover transitions (color, shadow) | `0.3` (Tailwind `transition-all duration-300`) |

### Stagger

Hero rows stagger by `0.1s` (badge → headline → subtext → CTAs → state pill).
Grid card reveals stagger by `0.1s` per index.

```tsx
transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
```

### Patterns

**Hero entrance** (`HomeLanding.tsx` reference):

```tsx
<motion.h1
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
>
```

**Scroll-reveal** for non-hero sections:

```tsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.6 }}
>
```

**Hover lift** for cards:

```tsx
<motion.div whileHover={{ y: -8 }} className="transition-all duration-300">
```

**Hero parallax** (landing only):

```tsx
const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
const heroY = useTransform(scrollYProgress, [0, 1], [0, 260]);
const heroOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
```

### Reduced motion (required)

Wrap non-trivial animations:

```tsx
import { useReducedMotion } from "framer-motion";
const prefersReducedMotion = useReducedMotion();
const initial = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 30 };
```

When `prefersReducedMotion` is `true`: drop parallax, drop hover lift, keep fades only.

### Avoid

- Spring physics (`type: "spring"`) — feels arcade. Use `easeOutExpo`.
- More than 6 elements doing `whileInView` simultaneously — chunk with `staggerChildren` instead.
- Looping animations outside the R3F scene (no infinite pulses, no spinning logos).

---

## 3D / R3F policy

**Allowed in exactly one place:** `src/components/home/StageLightsScene.tsx`.

Allowed imports inside that file:
- `@react-three/fiber` — `Canvas`, `useFrame`, `useThree`
- `@react-three/drei` — `Environment`, `Float`, `Preload`
- `three` (as namespace `THREE`)

**Anywhere else:** importing `@react-three/*` or `three` is a rule violation. If a design asks for a 3D accent on another page, stop and re-scope.

The scene is `pointer-events-none` and decorative. It must:
- not block interaction
- remain non-interactive from a keyboard perspective
- be wrapped with `aria-hidden="true"`
- degrade gracefully if WebGL is unavailable (Drei's `Preload` + fallback)

---

## Gradient recipes

| Recipe | Use |
|---|---|
| `bg-linear-to-r from-[#0055FF] via-[#FF3366] to-[#FFB000]` | Headline emphasis, CTA hover overlay |
| `bg-linear-to-br from-[#0055FF]/10 to-transparent` | Card corner glow on hover |
| `bg-linear-to-br from-[#FF3366]/20 to-transparent` | Dark card corner glow |

Always linear or br (top-left → bottom-right). No radial. No conic.

---

## Do / Don't snippets

### Card

❌ **Don't** (legacy dark-zinc):
```tsx
<div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6">
```

✅ **Do** (bright stage-light):
```tsx
<motion.div
  whileHover={{ y: -8 }}
  className="rounded-3xl border border-[#F1F5F9] bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-[#0055FF]/10"
>
```

### Chip

❌ **Don't**:
```tsx
<span className="rounded-full bg-violet-500/10 px-2 py-1 text-xs text-violet-300">Jazz</span>
```

✅ **Do**:
```tsx
<span className="rounded-full bg-[#0055FF]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0055FF]">
  Jazz
</span>
```

### Primary CTA

❌ **Don't**:
```tsx
<button className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-violet-400">
  Browse
</button>
```

✅ **Do** (matches landing hero):
```tsx
<Link
  href="/musicians"
  className="group relative flex h-14 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#0F172A] px-8 text-sm font-bold tracking-wide text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_#0055FF]"
>
  <span className="relative z-10">Browse Musicians</span>
  <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
  <div className="absolute inset-0 bg-linear-to-r from-[#0055FF] to-[#FF3366] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
</Link>
```

### Eyebrow

✅ **Do**:
```tsx
<span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
  Now playing
</span>
```

### Dark "featured" card recipe

```tsx
<motion.div
  whileHover={{ y: -8 }}
  className="group relative overflow-hidden rounded-3xl bg-[#0F172A] p-8 text-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF3366]/20"
>
  <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-linear-to-br from-[#FF3366]/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
  {/* content */}
</motion.div>
```

---

## Iconography

`lucide-react` only. Sizing:

| Use | Class |
|---|---|
| Button icon | `h-4 w-4` |
| Card icon | `h-6 w-6` to `h-8 w-8` |
| Decorative section icon | `h-12 w-12` inside a `rounded-2xl` tile |

Decorative icons need `aria-hidden`. Icon-only buttons need `aria-label`.

---

## What stays stable (do not change without re-scoping)

- The bright off-white base + slate ink palette
- Three accents: blue / pink / gold
- Black-weight tracking-tight headlines
- Mono eyebrows
- `rounded-full` buttons, `rounded-3xl` cards
- `easeOutExpo` entrance easing
- R3F scene confined to the landing hero
