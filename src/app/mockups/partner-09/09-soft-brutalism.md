# Landing Design 09 — **Soft Brutalism**

> I'm a senior product designer with a track record on opinionated indie tools — niche newsletters, developer products, designer-run agencies. Brutalist design done badly is just ugly. Done well, it signals *we made strong choices, on purpose*. This version uses heavy borders, chunky type, and a single bold accent — restrained enough for a campus product, opinionated enough to be memorable.

---

## 1. The Concept

A page built on a strict 2-color grid with thick 2px black borders, oversized geometric type, and content blocks that look hand-laid like a Risograph poster. One accent color. No gradients. No shadows. Information density is welcomed. The page looks confident enough that it never has to *try*.

## 2. Why This Direction

GigForge is a tool, not a social platform. Tool-oriented users (creators with deadlines, musicians looking for gigs) respond to confidence and clarity. Soft Brutalism delivers both. It also visually distances GigForge from the dozen "purple gradient SaaS" landing pages students see every day — a real differentiator in a crowded campus app market.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#F2EFE6` | Warm cream (the "paper" — not white, never white) |
| `bg.alt` | `#E8E4D7` | Alternating section background |
| `bg.invert` | `#101012` | Inverted blocks (CTAs, the wordmark plate) |
| `border.heavy` | `#101012` | 2px black borders, the workhorse |
| `ink.primary` | `#101012` | All text |
| `ink.muted` | `#5A5750` | Captions |
| `accent.electric` | `#3344EE` | The one accent: an electric royal blue used on hover states, the primary CTA, and a single decorative element |

A 7-token palette. The black-on-cream + one blue does *everything*.

## 4. Typography

- **Display:** Söhne Breit 700 or **Editorial New Heavy**, `clamp(56px, 9vw, 144px)`, leading `0.88`, tracking `-0.03em`. Stretched, dense, confident.
- **Body:** Söhne 500, 16/24. Heavier than usual — the page reads with weight.
- **Mono:** GT America Mono 12px uppercase, `+0.14em` tracking.

The display type is **larger than convention** because brutalism is about confident size. Don't shrink it.

## 5. Layout

```
┌══════════════════════════════════════════════════════════════════════┐
║  GIGFORGE                              ║  SIGN IN                     ║   ← 2px borders everywhere
║  ──────────────────────────────────────╫──────────────────────────────║
║                                                                        ║
║   STUDENT MUSICIANS.                                                  ║
║   STUDENT CREATORS.                                                   ║   ← 144px display
║   ONE DIRECTORY.                                                      ║
║                                                                        ║
║  ─────────────────────────────────────────────────────────────────  ║   ← 2px rule
║                                                                        ║
║   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               ║
║   │ 142          │  │ 24           │  │ 12           │               ║   ← stat blocks
║   │ MUSICIANS    │  │ OPEN GIGS    │  │ CAMPUSES     │               ║
║   └──────────────┘  └──────────────┘  └──────────────┘               ║
║                                                                        ║
║   ┌─────────────────────────────────────┐  ┌─────────────────────┐  ║
║   │                                       │  │ BROWSE              │  ║
║   │   A directory.                        │  │ MUSICIANS           │  ║
║   │   Not a social network.               │  │            →        │  ║
║   │                                       │  │                     │  ║   ← CTAs are big plates
║   │   No DMs. No feeds. No algorithms.    │  │ ───────────────── │  ║
║   │   You search, you find, you email.    │  │                     │  ║
║   │                                       │  │ POST A GIG          │  ║
║   │                                       │  │            →        │  ║
║   └─────────────────────────────────────┘  └─────────────────────┘  ║
║                                                                        ║
║  ─────────────────────────────────────────────────────────────────  ║
║                                                                        ║
║   HOW IT WORKS                                                        ║
║                                                                        ║
║   01. Browse the directory          02. Find someone you like        ║
║       no account needed                  their email is right there  ║
║                                                                        ║
║   03. Email them yourself                                             ║
║       that's the entire product                                      ║
║                                                                        ║
╚══════════════════════════════════════════════════════════════════════╝
```

The whole page is gridded. 2px borders form the structure. Nothing is rounded.

## 6. The Border System

- All structural borders: 2px `border.heavy`. Solid. Never dashed.
- All borders are crisp — no shadows, no blur. The page must look like it was *drawn*, not rendered.
- Borders meet flush at corners — no rounded joins, no overlap artifacts. Snap them precisely to the grid.

## 7. The Stat Blocks

Three large blocks at the top of the body, each rendering a real DB count:

```
┌──────────────┐
│ 142          │   ← number at 80px display
│ MUSICIANS    │   ← mono label at 12px
└──────────────┘
```

On hover (desktop), the block's background flips to `accent.electric` and the text becomes `bg.page`. Instant snap, no transition. The brutalism allows itself this one decisive flip — it feels like flipping a Risograph layer.

## 8. CTAs

The primary CTA is a **full-height plate**, not a button. It lives in the hero grid as its own block.

**Primary plate** — `Browse musicians`:
```
bg: #101012
text: #F2EFE6
border: 2px #101012
height: matches the adjacent body block
padding: 32px
display label: BROWSE MUSICIANS in 28px Söhne Breit 600, uppercase
arrow: 32px → at bottom right, animates +6px on hover
hover: bg #3344EE, text #F2EFE6 (the blue takeover is the moment)
transition: none (snap)
```

**Secondary plate** — `Post a gig`:
- Same plate dimensions as primary, but `bg: bg.page`, `border: 2px ink.primary`.
- On hover: `bg: #3344EE`, `text: bg.page`.

Both plates stack inside one outer 2px-bordered container, separated by a 2px horizontal rule.

## 9. The Live Listing Strip

Below the hero, a horizontal 2px-bordered band shows 4 real directory entries in a row, each in its own 2px-bordered cell:

```
┌──────────┬──────────┬──────────┬──────────┐
│ Maya     │ Jordan   │ Sam      │ ...      │
│ Guitar   │ Cello    │ Producer │          │
│ UT Aus.  │ USC      │ Berklee  │          │
│          │          │          │          │
│       →  │       →  │       →  │       →  │
└──────────┴──────────┴──────────┴──────────┘
```

Hover on a cell: cell flips to `accent.electric` background, text inverts. Click: deep-link to the listing.

## 10. The Wordmark

`GIGFORGE` is set in 28px Söhne Breit on a 2px-bordered `bg.invert` plate, white-on-black, in the nav. The wordmark *plate* is the brand mark — wherever the brand needs to appear, it's the plate, not just the text.

## 11. Motion

Brutalism resists motion. Two exceptions:
- **Hover flips** (instant, no transition).
- **The arrow on CTA plates** (translates +6px on hover, 120ms ease).

No scroll-triggered animations. No fade-ins. The page is *immediate*. That is the design.

## 12. What This Version Refuses to Do

- No rounded corners anywhere (border-radius is `0`, globally)
- No shadows
- No gradients
- No more than one accent color
- No animated background
- No emoji
- No serif fonts (the display is grotesque-only)

## 13. Implementation Notes

- Render fully server-side. Zero JS needed for the brand experience.
- Use a CSS reset that explicitly sets `border-radius: 0` on every element.
- The 2px borders need pixel-perfect alignment — use `box-sizing: border-box` and a strict grid (`display: grid` with `gap: 0` and explicit border collapsing on adjacent cells).

## 14. The Test

Print the page on a black-and-white printer. It should still look great with only the blue removed. If the design relies on the blue, you over-leaned on it — pull it back to one or two uses.
