# Landing Design 10 — **Spotlight Profile**

> I'm a senior product designer who's shipped landing pages for two professional networks and a talent marketplace. The best landing pages for directory products stop describing what they are and start showing who's in them. This version makes one real musician profile the entire hero — the way LinkedIn "spotlights" someone in a job posting. Light, professional, immediately credible.

---

## 1. The Concept

A clean white page leading with a single featured musician profile card at center — large, beautifully typeset, real data. Below it: a subhead, two CTAs, and a small "next profile" navigator. The card is alive: a subtle green availability pulse on the `OPEN` dot. This is LinkedIn's "featured profile" format applied to a musician directory.

## 2. Why This Direction

GigForge's value is the musicians. Every landing that buries them behind marketing copy is making a mistake. Put one real profile front and center: the visitor immediately understands what the product is, what it contains, and whether it's useful to them — without reading a single word of sales copy.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#F3F2EF` | LinkedIn's warm off-white page background |
| `bg.card` | `#FFFFFF` | The hero profile card |
| `bg.surface.alt` | `#FFFFFF` | Lower-section card backgrounds |
| `bg.section` | `#EEF3FB` | Alternating section background (blue tint) |
| `bg.pill` | `#EEF3FB` | Skill tag backgrounds |
| `border.card` | `rgba(0,0,0,0.08)` | Card edges |
| `border.divider` | `rgba(0,0,0,0.10)` | Section separators |
| `ink.primary` | `#191919` | Headlines, names |
| `ink.secondary` | `#555555` | Subheads, body |
| `ink.muted` | `#888888` | Metadata, timestamps |
| `accent.blue` | `#0A66C2` | CTA, links, skill tag text |
| `accent.green` | `#057642` | Availability dot — the only green on the page |

A 12-token palette built around warm paper and professional blue. Clean, trustworthy.

## 4. Typography

- **Card name (visual headline):** Inter 700, `clamp(36px, 4.5vw, 56px)`, tracking `-0.02em`.
- **Subhead under the card:** Inter 600, `clamp(24px, 3vw, 40px)`, leading `1.1`.
- **Body:** Inter 400, 16/26.
- **Mono label:** `font-mono` 11px uppercase tracking `+0.12em`, `ink.muted`.
- **Skill tags:** Inter 500, 13px, `accent.blue`.

The musician's name is the largest type on the page. The page introduces a real person.

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│  GIGFORGE                                      Sign in →    │
│  ──────────────────────────────────────────────────────    │
├────────────────────────────────────────────────────────────┤
│                                                              │
│         ┌──────────────────────────────────────────┐        │
│         │  MUSICIAN · UT AUSTIN      ● OPEN        │        │
│         │                                            │        │  ← hero profile card
│         │  Maya Chen                                │        │
│         │                                            │        │
│         │  Guitar, vocals. Indie, folk, film.       │        │
│         │  Available evenings + weekends.           │        │
│         │                                            │        │
│         │  [guitar] [vocals] [indie] [folk]         │        │
│         │                                            │        │
│         │  ──────────────────────────────────────  │        │
│         │  hello@mayachen.example    Contact →     │        │
│         └──────────────────────────────────────────┘        │
│                                                              │
│              ←  1 / 12  →    (cycle listings)               │
│                                                              │
│         Browse the network. Or post a gig.                  │
│                                                              │
│         [ Browse musicians ]   [ Post a gig ]               │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

Card: centered, max-width 580px on desktop, 92% on mobile. Card height: content-driven, never forced.

## 6. The Signature: The Breathing Profile Card

The card is a precise render of the production `/musicians/[id]` component. One component, two contexts — implementation efficiency + visual consistency between landing and detail pages.

Subtle life:

- **The `OPEN` dot:** pulses with a `box-shadow` ring in `accent.green` expanding from 0 to 10px and fading — `2s ease infinite`. LinkedIn's "actively looking" dot, adapted.
- **The card itself:** no scale animation. The availability pulse is enough. The card feels alive without feeling restless.

The dot pulse stops on `prefers-reduced-motion: reduce` — the dot stays solid green.

## 7. The Cycling Mechanism

Below the card: `← 1 / 12 →` in Inter 400 14px `ink.muted`. Arrow glyphs in `accent.blue`.

- Click right: card content crossfades out + in (300ms ease). No slide. Professional, not flashy.
- Keyboard arrows work.
- Touch swipe works on mobile.
- Cards are server-rendered, hidden, ready to swap without a network request. Cap at 12.

No auto-advance. Autorotating heroes are universally disliked. The user controls the pace.

## 8. Skill Tags

Each chip in the skill row is styled as LinkedIn's skill endorsement tag:
- `bg.pill`, `accent.blue` text, `border-radius: 16px`, Inter 500 13px, `px-3 py-1`.
- Clickable: deep-links to `/musicians?instrument=guitar` etc.
- On hover: `bg` deepens slightly, underline on text.

Tags are the landing page's secondary navigation — the visitor starts filtering without leaving.

## 9. CTAs

**Primary** — `Browse musicians`:
```
bg: #0A66C2
text: #FFFFFF
height: 52px, px: 28px
radius: 24px
font: Inter 600, 15px
hover: bg #004182
transition: 160ms ease
```

**Secondary** — `Post a gig`:
```
bg: transparent
border: 1.5px #0A66C2
text: #0A66C2
radius: 24px
hover: bg rgba(10,102,194,0.08)
```

## 10. The Lower Section

A full-width `bg.section` band with three real open gigs in a single row:

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ GIG              │  │ GIG              │  │ GIG              │
│ Composer         │  │ Guitarist        │  │ Vocalist         │
│ Thesis Short     │  │ Indie EP         │  │ Podcast Theme    │
│ UT Austin · PAID │  │ Remote · UNPAID  │  │ Remote · NEGOT.  │
│ ──────────────── │  │ ──────────────── │  │ ──────────────── │
│ Apply via email→ │  │ Apply via email→ │  │ Apply via email→ │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

White cards, `border-radius: 8px`, `border.card` shadow, on `bg.section`. Real data.

## 11. How It Works

Below the gig cards, on white, three left-aligned rows:

```
01  Browse the directory.       No account to create. Just look.
02  Find someone you need.      Filter by instrument, genre, school.
03  Email them directly.        No platform in between. Just email.
```

`accent.blue` mono numbers. Inter 400 body. 1px `border.divider` between rows.

## 12. What This Version Refuses to Do

- No dark backgrounds
- No music-themed illustrations
- No hero scale animations (pulse on the availability dot is sufficient)
- No multiple accent colors beyond blue + availability green
- No auto-advancing carousel
- No icon system

## 13. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

Three.js is used for an optional ambient background. Framer Motion handles all card animations.

## 14. Implementation Notes

- Hero card: same `MusicianCard` component as `/musicians/[id]`. No landing-specific code.
- **Card cycling with Framer Motion:** Use `AnimatePresence` + `motion.div` with `initial={{ opacity: 0, scale: 0.98 }}` → `animate={{ opacity: 1, scale: 1 }}` → `exit={{ opacity: 0, scale: 0.98 }}`. `transition={{ duration: 0.3, ease: "easeInOut" }}`. This replaces a custom JS crossfade.
- **Keyboard + swipe nav:** Framer Motion's `drag` prop on the card `motion.div` — `drag="x"` with `dragConstraints={{ left: 0, right: 0 }}` and `onDragEnd` comparing `offset.x` to a threshold to trigger cycle.
- **Availability dot pulse:** Pure CSS `@keyframes box-shadow` ring — Framer not needed here; CSS handles it lighter.
- **Ambient Three.js background (optional):** A `@react-three/fiber` `Canvas` behind the page at `z-index: -1`. A single `<mesh>` with a `MeshStandardMaterial` in `bg.pill` blue, very low roughness, barely rotating — gives the page a subtle depth without competing with the card. Toggle off if performance is a concern.
- All 12 listing cards server-rendered, promoted into `AnimatePresence` on cycle.
- `prefers-reduced-motion`: `useReducedMotion()` — card swap is instant, Three.js canvas skipped entirely.

## 14. Accessibility

- `prefers-reduced-motion: reduce` → dot stays solid, crossfade becomes instant swap.
- Cycle controls have `aria-label="Previous musician"` / `aria-label="Next musician"`.
- Card is one tab stop; links within are focusable in natural order.
- All contrast ratios meet WCAG AA.

## 15. The Test

Watch the hero card for 20 seconds without scrolling. It should feel like a *person* is present — calm, professional, available. Not aggressive. Not idle. If it feels cold, the availability pulse needs tuning. If it feels jittery, slow the pulse from 2s to 3s. The card is a professional spotlight on a real person — treat it with that gravity.
