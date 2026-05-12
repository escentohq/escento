# Landing Design 05 — **Profile Stack**

> I'm a senior product designer who spent three years at a professional networking platform before moving to creator tooling. The most trusted professional directories are the ones that lead with real people — not abstract promises. This version opens with a stack of musician profile cards in LinkedIn's visual language: light, structured, and immediately credible.

---

## 1. The Concept

A clean white page with a centered stack of real musician profile cards — the kind you'd expect to see on a professional network. The top card is fully expanded and breathing. Below it, two cards peek out at offset angles. The headline is minimal; the profiles do the talking. A single blue CTA anchors the hero.

## 2. Why This Direction

GigForge is LinkedIn for student musicians. The landing page should feel like you've already arrived at the product — not like you're being sold on it. Real profiles, professional presentation, trust signals (school name, instrument, availability) front and center. Visitors who need a musician see one instantly and understand the product in three seconds.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#F3F2EF` | LinkedIn's warm off-white page background |
| `bg.card` | `#FFFFFF` | Profile cards |
| `bg.surface` | `#EEF3FB` | Tinted highlight areas, pill backgrounds |
| `border.card` | `rgba(0,0,0,0.08)` | Card edges |
| `border.divider` | `rgba(0,0,0,0.12)` | Section dividers |
| `ink.primary` | `#191919` | Headlines, names |
| `ink.secondary` | `#555555` | Subheads, instruments |
| `ink.muted` | `#888888` | Metadata, timestamps |
| `accent.blue` | `#0A66C2` | Primary CTA, active links, skill tags — the LinkedIn anchor color |
| `accent.blue.hover` | `#004182` | Hover state |

A 10-token palette anchored in white and professional blue. No decorative colors.

## 4. Typography

- **Display headline:** Inter 700, `clamp(36px, 5vw, 64px)`, tracking `-0.02em`, `ink.primary`.
- **Body:** Inter 400, 16/26, `ink.secondary`.
- **Mono / metadata:** `font-mono` 12px uppercase tracking `+0.1em` in `ink.muted` — used for school badges and availability labels.
- **Card name:** Inter 600, 22px.

The page reads like a polished directory, not a marketing site.

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│  GIGFORGE                                      Sign in →    │
│  ──────────────────────────────────────────────────────    │  ← 1px border.divider
├────────────────────────────────────────────────────────────┤
│                                                              │
│       The professional network                              │
│       for student musicians.                                │  ← display headline
│                                                              │
│       Browse free. No account needed to find someone.       │  ← subhead
│                                                              │
│       [ Browse musicians ]   Post a gig                     │  ← CTAs
│                                                              │
│                 ┌────────────────────────────┐              │
│                 │  ● AVAILABLE               │              │  ← hero card (top)
│                 │  Maya Chen                 │              │
│                 │  Guitar · Vocals           │              │
│                 │  UT Austin · Music '25     │              │
│                 │                            │              │
│                 │  "Indie, folk, film. Available            │
│                 │   evenings + weekends."    │              │
│                 │                            │              │
│                 │  [guitar] [vocals] [indie] │              │
│                 │  hello@maya.example    →   │              │
│                 └────────────────────────────┘              │
│              ┌────────────────────────────┐                 │  ← card 2 (peeking behind)
│           ┌────────────────────────────┐                    │  ← card 3 (peeking further)
│                                                              │
│                142 musicians · 24 open gigs                 │  ← directory count
│                                                              │
└────────────────────────────────────────────────────────────┘
```

Cards are centered, stacked at `-3deg` and `+2deg` offsets. Max card width 480px.

## 6. The Signature: Profile Card Stack

The top card is a full-fidelity render of `/musicians/[id]`:

- White card, `border-radius: 8px`, `box-shadow: 0 4px 12px rgba(0,0,0,0.08)`.
- Top row: availability dot (green = available, gray = not looking) + `AVAILABLE` in `ink.muted` mono.
- Large name in Inter 600.
- School + grad year in `ink.secondary`.
- Two-line bio.
- Chip row (instruments + genres) styled as LinkedIn skill tags: `bg.surface`, `accent.blue` text, `border-radius: 16px`.
- `mailto:` link styled as a secondary CTA button.

Cards 2 and 3 peek behind, offset by `translateX(±16px) translateY(8px) rotate(±2deg)`, blurred by `filter: blur(0.5px)` and `opacity: 0.6`. Clicking a peeking card brings it to front with a smooth swap animation (300ms ease).

## 7. Skill Tags as Trust Signals

Each chip in the musician's skill row is clickable — it deep-links to `/musicians?instrument=guitar`. This turns the landing page's card into a live navigation hub. Hovering a tag underlines it in `accent.blue`. The tag system is identical to the detail page so users recognize the interface immediately.

## 8. CTAs

**Primary** — `Browse musicians`:
```
bg: #0A66C2
text: #FFFFFF
height: 48px, px: 20px
radius: 24px (pill)
font: Inter 600, 15px
hover: bg #004182
focus ring: 3px rgba(10,102,194,0.3)
```

**Secondary** — `Post a gig`:
```
bg: transparent
border: 1.5px #0A66C2
text: #0A66C2
radius: 24px (pill)
hover: bg rgba(10,102,194,0.08)
```

Both pill-shaped to match LinkedIn's button conventions.

## 9. Below the Hero: Network Strip

A horizontal strip on `bg.page` showing three stat blocks:

```
142 musicians          24 open gigs          12 universities
Browse the network →   See what's posted →   Your campus here →
```

Each block is a link. Numbers in Inter 700 36px `ink.primary`. Labels in Inter 400 14px `ink.secondary`. No borders — just whitespace separation.

## 10. How It Works

Three rows, left-aligned, max-width 560px:

```
01  Browse the directory       No account. Just search.
02  Find someone you like      Their email is right there.
03  Reach out directly         No DMs. No platform middleman.
```

Numbers in `accent.blue` mono. Headlines in Inter 600 `ink.primary`. Body in `ink.secondary`.

## 11. Footer

Minimal: logo left, three text links right (`About`, `Privacy`, `Post a gig`). 1px `border.divider` top. `bg.card` background. `ink.muted` text.

## 12. What This Version Refuses to Do

- No dark backgrounds anywhere
- No neon or heavy accent colors
- No decorative illustrations
- No animated gradients
- No hero taglines that compete with the cards

The cards are the message. The design defers to them.

## 13. Required Libraries

```bash
npm install framer-motion
```

No Three.js needed — the stack effect is purely CSS + Framer Motion.

## 14. Implementation Notes

- Top card rendered server-side from real DB (`musicians` ordered by `updatedAt DESC LIMIT 1`).
- Cards 2–3 rendered with next two entries, hidden behind card 1 via CSS z-index stacking.
- **Card swap:** Use `framer-motion` `AnimatePresence` + `motion.div` with `layoutId` for spring-physics card promotion. When a back card is clicked, it animates to the front position with `spring: { stiffness: 300, damping: 30 }`.
- **Stack offset animation:** Back cards use `motion.div` with `animate={{ x, rotate }}` driven by their index position — Framer handles the spring reorder.
- **Skill tag hover:** `motion.span` with `whileHover={{ scale: 1.05 }}`.
- Total JS: ~8KB (framer-motion tree-shaken for just `AnimatePresence` + `motion`).

## 14. The Test

Show the page to a hiring manager at a studio. If they immediately reach for the email link on the card before reading anything else, the design is working. The profile must be the first thing the eye lands on — not the headline.
