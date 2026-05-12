# Landing Design 08 — **Marquee**

> I'm a senior product designer with a background in typographic identity systems — wayfinding for theaters, signage for arts festivals. Type-as-graphic is one of the most underused tools in product design. This version makes a single, beautifully-paced scrolling marquee the centerpiece of the page. It runs across the hero like a stadium ticker, surfacing live activity from the directory.

---

## 1. The Concept

A single horizontal type marquee runs across the page just below the headline. It scrolls real, live data — recently joined musicians, freshly posted gigs, deadlines closing soon — in oversized serif type. The marquee is the heartbeat. It tells you the directory is *moving* without showing you a feed.

## 2. Why This Direction

GigForge has a real problem to solve: visitors need to believe the directory is alive. A static page can't prove it. A feed would violate the product's principles. A marquee threads the needle — it surfaces activity without becoming a feed, and it does it with one of typography's most theatrical tricks.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#0D0D0F` | Off-black page |
| `bg.surface` | `#161618` | Cards |
| `border.hairline` | `#26262A` | 1px dividers |
| `text.primary` | `#EAEAED` | Body |
| `text.secondary` | `#8A8A92` | Subheads, captions |
| `text.dim` | `#52525A` | Tertiary metadata |
| `marquee.text` | `#F2EAD5` | A warm off-white reserved for marquee text only |
| `marquee.stripe` | `#2A2A2E` | The marquee band background |
| `accent.amber` | `#E8A23A` | Used on the marquee separators (a `★` between items) and the primary CTA. One color, two places. |

## 4. Typography

- **Display headline:** Söhne 700, `clamp(48px, 7vw, 96px)`, tracking `-0.02em`.
- **Marquee:** GT Sectra Display Italic 400, **140px on desktop**, 88px on mobile. Tracking `+0.005em`. The marquee is the largest type on the page.
- **Body:** Söhne 400, 16/26.
- **Mono:** GT America Mono 11px uppercase tracking `+0.16em`.

The italic serif at 140px is the entire identity. Marquee text is *meant* to be theatrical.

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│   [logo]                                       [signin]      │
├────────────────────────────────────────────────────────────┤
│                                                              │
│   LIVE FROM 12 CAMPUSES                                     │ ← mono eyebrow
│                                                              │
│   The campus directory                                       │
│   for student musicians                                      │ ← display headline
│   and the people who need them.                              │
│                                                              │
│  ═══════════════════════════════════════════════════════   │ ← top hairline of marquee band
│                                                              │
│  Maya joined · guitar ★ Composer needed for thesis short    │ ← scrolling italic serif
│  ★ Cellist available · classical, film ★ Loop composer      │
│                                                              │
│  ═══════════════════════════════════════════════════════   │ ← bottom hairline
│                                                              │
│   [ Browse musicians ]   [ Post a gig ]                     │
│                                                              │
├────────────────────────────────────────────────────────────┤
│   How it works · Three short steps                          │
└────────────────────────────────────────────────────────────┘
```

The marquee band is full-bleed, sits in `marquee.stripe`, sandwiched by hairlines. ~180px tall on desktop, 120px on mobile.

## 6. The Signature: The Marquee

### Content

The marquee renders a string composed server-side from the latest 12 events:

```
Maya joined · guitar ★ Composer needed for thesis short, UT Austin ★ Cellist available · classical, film ★ Loop composer needed for indie game ★ Jordan joined · piano, producer ★ ...
```

Item separators are amber-colored `★` glyphs (the single splash of color in the marquee). Items wrap on each other so the string is effectively infinite.

### Motion

Two duplicate `<div>`s of the same content, side-by-side, translated together with `transform: translateX(-50%)`. The animation is a single `keyframes` from `0%` to `-50%` over **45 seconds, linear, infinite**. Slow enough to read each item. Fast enough that the page feels alive.

### Interaction

- **Hover anywhere on the marquee:** animation pauses. The line is now readable. A tiny `(paused)` indicator appears at the right edge.
- **Click an item:** deep-links to its detail page.
- **Reduced motion:** marquee is static, displays only the most recent 3 items in a wrapped block.

### Performance

Pure CSS animation. No JS. No `IntersectionObserver`. The transform runs on the GPU. Page Lighthouse score is unaffected.

## 7. The Headline Hierarchy

The headline lives *above* the marquee. The marquee is bigger than the headline. This is intentional and unusual: it tells the visitor "the activity here matters more than what we say about ourselves."

The marquee draws the eye, then the headline gives context, then the CTAs offer action.

## 8. CTAs

**Primary** — `Browse musicians`:
```
bg: #E8A23A
text: #0D0D0F
height: 50px, px: 24px
radius: 8px
font: Söhne 600, 15px
hover: bg #F2B14A
focus ring: 3px rgba(232,162,58,0.3)
```

**Secondary** — `Post a gig`:
```
bg: transparent
border: 1px #26262A
text: #EAEAED
hover: border #E8A23A
```

## 9. Below the Fold

**Section: How It Works** — three lines, each prefaced by a small italic serif numeral (`i.`, `ii.`, `iii.`) in `accent.amber`. Each line is one sentence. No icons, no cards.

**Section: Two Sample Cards** — one musician, one gig, real data. Standard `bg.surface` cards with hairline borders. Restrained, so the marquee remains the showpiece.

## 10. Empty Marquee State

If the directory has no recent activity in the last 7 days, the marquee falls back to a curated *evergreen* string in the same style:

```
Find a violinist for your short film ★ Hire a producer for your podcast ★ Get a composer for your indie game ★ ...
```

Same motion, no live indicator. The visitor never sees a broken-feeling empty state.

## 11. What This Version Refuses to Do

- No multiple marquees (one, and only one)
- No backwards-scrolling counter-marquee (the "stock ticker" cliché)
- No emoji in the marquee
- No more than one accent color
- No animated background

## 12. Implementation Notes

- The marquee string is rendered server-side from the DB and inlined into the HTML. Total payload added: ~2KB.
- Italic serif font is preloaded with `font-display: block` — temporary FOIT is preferable to a fallback-font FOUT at this size, which would be visually jarring.
- The pause-on-hover uses `animation-play-state: paused` triggered by a `:hover` selector — zero JS.

## 13. The Test

Watch the marquee for 30 seconds. You should read at least 6 unique items in that window without feeling like the page is in a hurry. If you can't, slow the animation to 60s. If you can read everything in 15s, speed it up to 35s. Tune until you read at the pace of a relaxed sentence.
