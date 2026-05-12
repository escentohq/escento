# Landing Design 08 — **Activity Feed**

> I'm a senior product designer with a background in professional networks and community tools. LinkedIn's most addictive feature is the feed — the sense that your network is always moving. This version brings that energy to GigForge's landing page: a live, scrolling activity strip in a clean white page, showing real network events. Light, professional, credible.

---

## 1. The Concept

A clean white page with a professional-network feel. The hero delivers the headline and CTAs above a continuously scrolling activity strip — light background, dark type, real events from the directory. Below: a two-column section pairing a musician profile with a gig listing, side by side. The page feels like arriving at a network that's already in motion.

## 2. Why This Direction

GigForge has a visibility problem: visitors need to believe the directory is alive. A static page can't prove it. A full feed would violate the product's principles. A professional-grade activity strip threads the needle — it surfaces real events in LinkedIn's visual register without turning the landing page into a social feed.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#FFFFFF` | Clean white base |
| `bg.section` | `#F3F2EF` | Alternating section background |
| `bg.strip` | `#EEF3FB` | Activity strip background — subtle blue tint |
| `bg.card` | `#FFFFFF` | Cards |
| `bg.pill` | `#EEF3FB` | Skill tag background |
| `border.strip` | `rgba(10,102,194,0.12)` | Activity strip top/bottom border |
| `border.card` | `rgba(0,0,0,0.08)` | Card edges |
| `border.divider` | `rgba(0,0,0,0.10)` | Section separators |
| `ink.primary` | `#191919` | All primary text |
| `ink.secondary` | `#555555` | Subheads, activity items |
| `ink.muted` | `#888888` | Metadata |
| `accent.blue` | `#0A66C2` | Names in activity strip, CTAs, links |
| `accent.green` | `#057642` | "● OPEN" dot and label — availability signal |

## 4. Typography

- **Display headline:** Inter 700, `clamp(44px, 6vw, 80px)`, tracking `-0.025em`, leading `1.05`.
- **Strip text:** Inter 500, 15px, `ink.secondary`. Names in `accent.blue` Inter 600.
- **Body:** Inter 400, 16/26.
- **Label:** Inter 500, 12px uppercase tracking `+0.1em`, `ink.muted`.
- **Card name:** Inter 700, 22px.

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│  GIGFORGE                                      Sign in →    │
│  ──────────────────────────────────────────────────────    │  ← 1px border.divider
├────────────────────────────────────────────────────────────┤
│                                                              │
│  LIVE FROM 12 UNIVERSITIES                                  │  ← mono label, ink.muted
│                                                              │
│  The professional network                                   │
│  for student musicians.                                     │  ← display headline
│                                                              │
│  Browse 142 musicians. Post a gig. Direct email contact.   │  ← subhead
│                                                              │
│  [ Browse musicians ]   [ Post a gig ]                     │
│                                                              │
├────────────────────────────────────────────────────────────┤
│                                                              │  ← bg.strip band
│  Maya joined · guitar ·  Jordan updated profile ·          │  ← scrolling activity
│  Composer needed · thesis short ·  Sam joined · piano ·    │
│                                                              │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────┐  ┌────────────────────────┐   │
│  │  MUSICIAN              │  │  GIG                   │   │
│  │  Maya Chen             │  │  Composer for Short    │   │
│  │  Guitar · UT Austin    │  │  Film · UT Austin      │   │
│  │  ● Open to work        │  │  ● Open · PAID         │   │
│  └────────────────────────┘  └────────────────────────┘   │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

Strip is full-bleed, ~72px tall. Cards below are 50/50 split on `bg.section`.

## 6. The Signature: The Activity Strip

The strip renders a string composed server-side from the latest 10 network events:

```
Maya joined · guitar  ·  Jordan updated profile  ·  
Composer needed, UT Austin  ·  Sam joined · piano  ·  
Priya marked available  ·  Loop composer gig posted  · ...
```

Separator between items: a centered dot `·` in `ink.muted`. Names are `accent.blue`. Events are `ink.secondary`. The strip text is professional — no exclamation marks, no emoji.

### Motion

Two duplicate `<div>`s, side-by-side, animated with `transform: translateX` from `0` to `-50%` over **40 seconds, linear, infinite**. Slow enough to be readable. Fast enough to feel alive.

### Interaction

- Hover anywhere on strip: animation pauses. `(paused)` indicator appears right-aligned in `ink.muted` 12px.
- Click a name in the strip: navigates to that musician's profile.
- Reduced motion: strip is static, shows 3 most recent events in a single non-scrolling line.

### Performance

Pure CSS animation. Zero JS. GPU-composited transform. Lighthouse score unaffected.

## 7. The "People" Pair

Below the strip on `bg.section`, two cards side by side:

**Left: Musician card**
- White card, `border-radius: 8px`, `box-shadow: 0 2px 8px rgba(0,0,0,0.08)`.
- `MUSICIAN` mono label top-left. `● OPEN` green top-right.
- Name in Inter 700 22px. School + instruments in `ink.secondary`.
- Two-line bio. Skill chip row. `mailto:` link.

**Right: Gig card**
- Same card structure, `GIG` label instead.
- Role in Inter 700. Organization + pay in `ink.secondary`.
- Two-line description. `Apply via email →` link.

Both use the same component as their detail pages.

## 8. CTAs

**Primary** — `Browse musicians`:
```
bg: #0A66C2
text: #FFFFFF
height: 48px, px: 20px
radius: 24px
font: Inter 600, 15px
hover: bg #004182
```

**Secondary** — `Post a gig`:
```
bg: transparent
border: 1.5px #0A66C2
text: #0A66C2
radius: 24px
hover: bg rgba(10,102,194,0.08)
```

## 9. How It Works

Three items below the pair cards, on white:

```
01  Browse the directory.      No account. Fully open.
02  Find who you need.         Filter by instrument, genre, school.
03  Email them directly.       No DMs. No platform in between.
```

Inter 600 `accent.blue` numbers. Inter 400 body. Separated by 1px `border.divider` lines.

## 10. Empty Strip State

If no activity in the last 7 days, the strip falls back to an evergreen string:

```
Find a violinist for your short film  ·  Post a gig for a film composer  ·  Browse 142 musicians  · ...
```

Same motion, no "LIVE" label shown. The visitor never sees an empty state.

## 11. What This Version Refuses to Do

- No dark backgrounds
- No multiple accent colors beyond blue + green
- No backwards-scrolling counter-marquee
- No emoji in the strip
- No animated background or gradient
- No hero illustrations

## 12. Required Libraries

```bash
npm install framer-motion
```

## 13. Implementation Notes

- Strip string rendered server-side from `activity_events ORDER BY createdAt DESC LIMIT 10`. Falls back to static evergreen string if empty.
- **Activity strip motion:** Use Framer Motion's `motion.div` with `animate={{ x: ["0%", "-50%"] }}` + `transition={{ duration: 40, repeat: Infinity, ease: "linear" }}` — cleaner than a CSS keyframe, easier to pause and resume.
- **Pause on hover:** `useAnimation()` controls: `controls.stop()` on `onHoverStart`, `controls.start(...)` on `onHoverEnd`. The `(paused)` label is shown via a `motion.span` with `AnimatePresence`.
- **Scroll reveals:** Hero headline and CTAs use `motion.div` with `initial={{ opacity: 0, y: 16 }}` + `animate={{ opacity: 1, y: 0 }}` staggered by `0.1s` delays — the page feels like it assembles on load.
- **Card pair section:** `useInView` triggers each card's entrance (`initial={{ opacity: 0, y: 24 }}`).
- Cards: same server-rendered components as `/musicians/[id]` and `/gigs/[id]`.
- `prefers-reduced-motion`: `useReducedMotion()` from framer-motion — strip becomes static (display 3 items), all entrance animations instant.

## 13. The Test

Watch the strip for 30 seconds. You should read at least 5 unique events in that window at a comfortable reading pace. If you can't, slow from 40s to 55s. If you read everything in 20s, speed it to 30s. Tune until you read at the pace of someone scanning a LinkedIn notification panel.
