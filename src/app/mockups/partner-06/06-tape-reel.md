# Landing Design 06 — **Tape Reel**

> I'm a senior product designer who spent four years at a music streaming service before moving to indie tooling. Music products keep reaching for "vinyl record" mockups and they always feel like clip art. This version pulls a more specific reference — the cassette tape — and uses it for one piece of motion only. Everything else is restrained.

---

## 1. The Concept

The hero centers on a single 3D cassette tape, slowly turning. Type is set in a warm muted palette. As you scroll, the tape reels feed the playhead and a hairline "tape" sweeps across the page horizontally, becoming the section divider lines below. The metaphor binds the whole layout together without anyone having to point at it.

## 2. Why This Direction

The cassette is universally legible as "music," carries no genre baggage (unlike vinyl = old, EDM = neon, etc.), and gives the design one specific 3D object to render well instead of trying to render five. The motion is meaningful: the tape *spools content forward* as you scroll, which doubles as the page's primary mechanic.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#1A1814` | Warm near-black (tape-deck plastic) |
| `bg.surface` | `#23201B` | Cards |
| `border.hairline` | `#3A352D` | Edges |
| `text.primary` | `#F2EBDC` | Headlines, body (warm white, like printed cassette labels) |
| `text.secondary` | `#A39B89` | Subheads |
| `accent.tape` | `#C8A672` | The tape itself, button accent, hairline divider color |
| `accent.spool` | `#1F1D19` | The dark reels |
| `accent.label` | `#E8553A` | A single hot-red used on the "REC" indicator only — one dot of red on the whole page |

Restraint: 8 tokens, only one bright color, used in exactly one place.

## 4. Typography

- **Display:** Söhne 700, `clamp(40px, 6vw, 88px)`, tracking `-0.02em`.
- **Body:** Inter 400, 16/26.
- **Label / mono:** GT America Mono 11px, uppercase, tracking `+0.16em` — used to mimic the label of a cassette: `SIDE A · 24 OPEN GIGS · MAY '26`.

## 5. Layout

```
┌──────────────────────────────────────────────────────────────┐
│   [logo]                                       [signin]        │
├──────────────────────────────────────────────────────────────┤
│                                                                 │
│   SIDE A · 24 OPEN GIGS · MAY '26      [● REC]                │   ← mono label band
│                                                                 │
│   Find a student musician for                                  │
│   your film, podcast, or game.                                 │   ← display headline
│                                                                 │
│   A campus directory. No accounts to browse. Email contact.    │   ← subhead
│                                                                 │
│   [ Browse musicians ]   [ Post a gig ]                        │
│                                                                 │
│                            ┌─────────────┐                     │
│                            │  ◯       ◯  │   ← the cassette,  │
│                            │  ▓▓▓▓▓▓▓▓▓  │   ← slowly turning │
│                            │  GIGFORGE   │                     │
│                            └─────────────┘                     │
│                                                                 │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   ← "tape" divider
├──────────────────────────────────────────────────────────────┤
│   Live sample cards · How it works · Get started               │
└──────────────────────────────────────────────────────────────┘
```

## 6. The Signature: The 3D Cassette

Implementation choices, by cost/quality:

**Option A — preferred — SVG:** A hand-drawn flat-shaded cassette in SVG. Two `<g>` groups for the reels animate with `transform: rotate()` on a 12s linear infinite. The "tape" between reels is two thin paths animated with `stroke-dashoffset` so it visibly moves left-to-right between the spools. ~6KB. Renders crisp at any DPI.

**Option B — three.js, only if budget permits:** A simple low-poly cassette mesh (≈600 tris), single ambient light, slow rotation on Y-axis (0.05 rad/s). Bundle hit ~140KB gzip. Worth it only if the brand needs this to be the showpiece.

Default to Option A. The flat illustration reads as *deliberate* art direction; the three.js model reads as *generic 3D product page*. SVG wins on taste.

The single red `[● REC]` indicator next to the side-A label blinks at 1Hz — the only blinking element on the page. Brief, periodic, alive.

## 7. The Scroll Mechanic

As the user scrolls:

1. The cassette reels rotate based on `scrollY` (their rotation is bound to scroll position, not time, for the first 800px — feels like *you* are spooling the tape).
2. The "tape" hairline divider that sits below the hero **extends** further across the page as you scroll, becoming the rule between sections.
3. Past 800px the cassette transitions to its time-based loop and pins out of view.

This is one mechanic, applied consistently. Don't add more.

## 8. CTAs

**Primary** — `Browse musicians`:
```
bg: #C8A672
text: #1A1814
height: 50px, px: 24px
radius: 8px
font: Söhne 600, 15px
hover: bg #D6B585, translateY(-1px)
focus ring: 3px rgba(200,166,114,0.35)
```

**Secondary** — `Post a gig`:
```
bg: transparent
border: 1px #3A352D
text: #F2EBDC
hover: border #C8A672
```

## 9. Sample Cards Section

Two cards rendered like cassette inlay J-cards — narrow vertical aspect, label at the top in the mono font, content below. One musician, one gig. The labels read `SIDE A · MUSICIAN` and `SIDE A · GIG`. Real data.

## 10. How It Works

A 3-step horizontal row, each step preceded by a small SVG icon: a play triangle, a record dot, a stop square. This is the *only* place icons appear on the entire page. They're 16px, in `accent.tape`, and they reward the cassette metaphor without forcing it.

## 11. Sound Off (Important)

**No audio.** No background music, no click sounds. Music products with autoplay sound are universally hated. Restrain yourself completely on this axis. The metaphor stays visual.

## 12. What This Version Refuses to Do

- No vinyl records
- No equalizer bar animations
- No retro VHS noise filters
- No "scratch" sound effects
- No more than one bright color

## 13. Implementation Notes

- Total JS for SVG variant: ~3KB. The scroll-bound rotation uses `IntersectionObserver` + `requestAnimationFrame` ticking only while the cassette is in view.
- `prefers-reduced-motion`: reels go static, REC light stays solid (not blinking).

## 14. The Test

A user born after 2010 has probably never held a cassette. The design has to communicate *music product* even without the metaphor landing — i.e., the colors, type, and layout alone should feel right. If you remove the cassette illustration and the page still feels musical, the design is doing its job. If it doesn't, you're leaning on the metaphor too hard.
