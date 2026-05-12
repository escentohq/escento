# Landing Design 09 — **Professional Grid**

> I'm a senior product designer with roots in opinionated B2B tools and two professional networks. Structure and confidence are more persuasive than polish. This version applies professional-network grid discipline to a light page — heavy borders, deliberate whitespace, real content. The result reads like a professional directory that takes itself seriously.

---

## 1. The Concept

A crisp white and light gray page built on a strict 2px border grid system. Professional, decisive, unambiguous. Large bold Inter display type. Real profile cards and gig listings in bordered cells. A primary blue CTA that owns the page. The design communicates "this is a real professional tool" without saying it.

## 2. Why This Direction

GigForge is a professional network, not a social app. Professional-network users — creators with deadlines, musicians looking for paid work — respond to clarity and structure. This version's visual confidence makes it immediately legible as a tool for serious collaborators. It also stands out from the sea of "rounded corners SaaS" pages students see daily.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#FFFFFF` | White page base |
| `bg.section` | `#F3F2EF` | Alternating section background |
| `bg.nav` | `#FFFFFF` | Nav background |
| `bg.pill` | `#EEF3FB` | Skill tag background |
| `border.heavy` | `#191919` | 2px grid borders |
| `border.card` | `rgba(0,0,0,0.10)` | Card edges |
| `ink.primary` | `#191919` | All text |
| `ink.secondary` | `#555555` | Subheads, card meta |
| `ink.muted` | `#888888` | Timestamps, metadata |
| `accent.blue` | `#0A66C2` | Primary CTA, hover states, links, stat blocks |
| `accent.green` | `#057642` | Availability dot only |

A focused palette: white, structured black, professional blue. Nothing else.

## 4. Typography

- **Display:** Inter 800, `clamp(56px, 8vw, 120px)`, leading `0.92`, tracking `-0.03em`. Dense, confident.
- **Body:** Inter 500, 16/24.
- **Mono:** `font-mono` 12px uppercase tracking `+0.12em`.
- **Card name:** Inter 700, 20px.

The display type is oversized by convention because structure needs confident type. Don't shrink it.

## 5. Layout

```
┌══════════════════════════════════════════════════════════════╗
║  GIGFORGE                              ║  SIGN IN →           ║  ← 2px border everywhere
║  ══════════════════════════════════════╬══════════════════════║
║                                                               ║
║   STUDENT MUSICIANS.                                         ║
║   STUDENT CREATORS.                                          ║  ← 120px display
║   ONE DIRECTORY.                                             ║
║                                                               ║
║  ─────────────────────────────────────────────────────────   ║  ← 2px rule
║                                                               ║
║  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ ║
║  │  142             │  │  24              │  │  12          │ ║  ← stat blocks
║  │  MUSICIANS       │  │  OPEN GIGS       │  │  CAMPUSES    │ ║
║  └──────────────────┘  └──────────────────┘  └──────────────┘ ║
║                                                               ║
║  ┌──────────────────────────────────────┐  ┌───────────────┐ ║
║  │                                       │  │ BROWSE        │ ║
║  │  A professional directory.            │  │ MUSICIANS     │ ║
║  │  Not a social network.                │  │         →     │ ║  ← CTA as plate
║  │                                       │  │               │ ║
║  │  No feeds. No DMs. No algorithm.      │  │ ──────────── │ ║
║  │  Search, find, email.                 │  │               │ ║
║  │                                       │  │ POST A GIG    │ ║
║  └──────────────────────────────────────┘  │         →     │ ║
║                                             └───────────────┘ ║
╚══════════════════════════════════════════════════════════════╝
```

2px borders form the structural skeleton. Border-radius: 0 everywhere.

## 6. The Border System

- All structural borders: 2px `border.heavy`. Solid. Never dashed.
- Borders meet at flush right-angle corners — no rounded joins.
- Page uses `box-sizing: border-box` globally and `display: grid` with `gap: 0` — borders collapse cleanly.
- The nav uses a bottom border to ground it, matching the grid language.

## 7. The Stat Blocks

Three equal-width bordered blocks:

```
┌──────────────────┐
│  142             │  ← Inter 800 72px ink.primary
│  MUSICIANS       │  ← mono label 12px ink.muted
└──────────────────┘
```

On hover: block background flips to `accent.blue`, text goes white. Instant snap (`transition: none`). The one decisive interaction on the page — like flipping a switch.

## 8. CTAs as Plates

The primary CTA is a full-height bordered plate, not a button.

**Primary plate** — `Browse musicians`:
```
bg: #0A66C2
text: #FFFFFF
border: 2px #0A66C2
height: matches adjacent body block
padding: 28px
display label: BROWSE MUSICIANS in Inter 700 22px uppercase
arrow: 24px → at bottom-right, +6px on hover
transition: none (instant swap)
hover: bg #004182
```

**Secondary plate** — `Post a gig`:
```
bg: #FFFFFF
border: 2px #191919
text: #191919
hover: bg accent.blue (10,102,194), text white — instant
```

Both plates sit in one outer 2px-bordered container, separated by a 2px horizontal rule.

## 9. Live Listing Strip

Below the hero: a full-bleed 2px-bordered band with 4 real profile cells, equal width:

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  ● Maya C.   │  ● Jordan L. │  ● Sam P.    │  see all 142 │
│  Guitar      │  Cello       │  Piano       │  musicians   │
│  UT Austin   │  USC         │  Berklee     │  →           │
│              │              │              │              │
│  →           │  →           │  →           │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

Cell hover: background flips to `accent.blue`, text goes white. Instant. Professional.

## 10. How It Works

Three bordered rows below the listing strip, on `bg.section`:

```
┌───┬────────────────────────────────────────────────────────┐
│01 │  Browse the directory — no account needed to look.     │
├───┼────────────────────────────────────────────────────────┤
│02 │  Find someone you like — their email is right there.   │
├───┼────────────────────────────────────────────────────────┤
│03 │  Email them — that's the entire product.               │
└───┴────────────────────────────────────────────────────────┘
```

Number cells: `accent.blue` background, white text, 2px border. Text cells: `bg.page`, `ink.primary`. All borders 2px `border.heavy`.

## 11. Motion

Professional restraint. Two exceptions only:
- **Hover flips** (instant, `transition: none`). Decisive.
- **CTA plate arrow** (+6px on hover, 100ms ease). The only eased motion on the page.

No scroll animations. No fade-ins. The page loads complete — that is the brand.

## 12. What This Version Refuses to Do

- No rounded corners (`border-radius: 0` everywhere)
- No shadows (borders do the structural work)
- No gradients
- No dark page background
- No more than one accent color (plus availability green)
- No emoji
- No decorative illustrations

## 13. Required Libraries

```bash
npm install framer-motion
```

No Three.js — the design's visual language explicitly rejects shadows and 3D effects.

## 14. Implementation Notes

- CSS reset sets `border-radius: 0` globally.
- Grid: `display: grid`, `gap: 0`, borders use `border-right: 2px` + `border-bottom: 2px` to avoid doubling.
- **Stat block hover flip:** Use `motion.div` with `whileHover={{ backgroundColor: "#0A66C2", color: "#FFFFFF" }}` + `transition={{ duration: 0 }}` — the instant snap is intentional and must use `duration: 0`, not a CSS transition.
- **CTA plate arrow:** `motion.span` with `whileHover={{ x: 6 }}` + `transition={{ type: "spring", stiffness: 400, damping: 20 }}` — the one eased motion on the page.
- **Listing strip cell hover:** Same instant-flip pattern as stat blocks: `motion.div` + `transition={{ duration: 0 }}`.
- **Page entrance:** The entire grid assembles on load with a staggered `motion.div` `initial={{ opacity: 0 }}` + `animate={{ opacity: 1 }}` cascade at `0.05s` intervals — the grid appears to be drawn in, cell by cell.
- `prefers-reduced-motion`: `useReducedMotion()` — all `initial` states jump to `animate` immediately, no cascade.

## 14. The Test

Print the page on a black-and-white printer. It should look great without the blue. The grid structure and type hierarchy must carry the design alone. If removing the blue breaks the layout's logic, you've over-relied on color — pull the blue back to CTAs only and fix the structural borders.
