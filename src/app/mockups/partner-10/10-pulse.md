# Landing Design 10 — **Pulse**

> I'm a senior product designer who's shipped landing pages for two community marketplaces. The pattern I keep coming back to: stop showing what the product *is*, show what the product *produces*. This version makes a single, real directory card the entire hero. The card is real. It updates. It breathes. The page is a stage for one beautifully-rendered listing at a time.

---

## 1. The Concept

Instead of a headline with a screenshot beside it, the page leads with **one giant, real directory card**, breathing gently with a subtle scale + shadow pulse. Below the card sit two CTAs and a one-line subhead. A small arrow lets you cycle through other live listings — each card animating in. The headline is the listing itself.

## 2. Why This Direction

GigForge's value is the listings. Any landing that doesn't lead with them is burying the lede. By making a real listing the centerpiece and tuning a single piece of micro-motion to it, the page conveys: this directory is alive, the people on it are real, and there's nothing more you need to understand.

## 3. Color System

A soft, slightly off-white palette that lets the listing card carry the visual weight.

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#F7F6F2` | Page background — warm, slightly off-white |
| `bg.card` | `#FFFFFF` | The hero card |
| `bg.surface.alt` | `#EDEBE4` | Lower-section backdrop |
| `border.faint` | `rgba(20,20,24,0.08)` | Card edge |
| `ink.primary` | `#141418` | Headlines, body |
| `ink.secondary` | `#5C5C66` | Subheads |
| `ink.muted` | `#8A8A94` | Metadata |
| `accent.peach` | `#F5A88B` | One color, used on the OPEN dot, the active filter pill, and the CTA hover state |
| `accent.deep` | `#2D2D33` | Primary CTA |

A 9-token palette built around warm paper and one peach accent.

## 4. Typography

- **Display headline (subhead under the card):** Söhne 600, `clamp(32px, 4vw, 56px)`, leading `1.05`, tracking `-0.01em`.
- **Card musician name (the visual headline):** Söhne 700, `clamp(40px, 5vw, 64px)`, tracking `-0.02em`.
- **Body:** Söhne 400, 16/26.
- **Mono:** GT America Mono 11px uppercase tracking `+0.16em`.

The largest type on the page is the **musician's name on the card**. The page is named after a real person every time it loads. That's the point.

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│   GIGFORGE                                       Sign in    │
├────────────────────────────────────────────────────────────┤
│                                                              │
│                                                              │
│        ┌──────────────────────────────────────────┐         │
│        │  MUSICIAN · UT AUSTIN          ● OPEN    │         │ ← the hero card
│        │                                            │         │
│        │  Maya Chen                                │         │
│        │                                            │         │
│        │  Guitar, vocals. Indie, folk.             │         │
│        │  Available evenings + weekends.           │         │
│        │                                            │         │
│        │  [guitar] [vocals] [indie] [folk]         │         │
│        │                                            │         │
│        │  hello@mayachen.example     mailto →     │         │
│        └──────────────────────────────────────────┘         │
│                                                              │
│            ←   1 / 12   →    (cycle through listings)       │
│                                                              │
│                                                              │
│        A directory of student musicians.                    │
│        Browse the rest. Or post a gig.                      │
│                                                              │
│        [ Browse all musicians ]    [ Post a gig ]           │
│                                                              │
├────────────────────────────────────────────────────────────┤
│   How it works · sample gigs · footer                       │
└────────────────────────────────────────────────────────────┘
```

The hero card is centered, ~640×420px on desktop, 92% width on mobile. The page reads top-down with the card as the gravitational center.

## 6. The Signature: The Breathing Card

The card subtly breathes:

- **Scale:** oscillates between `1.0` and `1.005` over 5s. Almost imperceptible. Sells "alive."
- **Shadow:** synced to scale, depth oscillates between `0 30px 60px -20px rgba(20,20,24,0.18)` and `0 36px 72px -24px rgba(20,20,24,0.22)`.
- **The `OPEN` dot:** pulses with a `box-shadow` ring expanding from `0 0 0 0 rgba(245,168,139,0.6)` to `0 0 0 12px rgba(245,168,139,0)` over 2s. Like a heartbeat.

The animation runs *only* on the visible hero card. When you cycle to the next listing, the new card takes the breathing role; the old card slides away static.

## 7. The Cycling Mechanism

Below the card, an arrow-pair control: `← 1 / 12 →`.

- Clicking right: current card slides out left + fades; next card slides in from right + fades. Spring eased. 480ms total.
- Optionally auto-advance every 8 seconds (toggleable client-side, off by default — autorotating heroes are universally disliked).
- Keyboard arrows work.
- Touch swipe works on mobile.

Each card is rendered server-side as part of the initial HTML, hidden offscreen, ready to slide in without a network round-trip.

## 8. CTAs

**Primary** — `Browse all musicians`:
```
bg: #2D2D33
text: #F7F6F2
height: 52px, px: 28px
radius: 12px
font: Söhne 600, 15px
hover: bg #F5A88B, text #141418 (the dark-to-peach swap is the brand moment)
transition: 200ms cubic-bezier(0.32, 0.72, 0, 1)
```

**Secondary** — `Post a gig`:
```
bg: transparent
border: 1px rgba(20,20,24,0.12)
text: #141418
hover: border #2D2D33
```

## 9. The Card's Inner Anatomy

The card is rendered with the exact same components as `/musicians/[id]` so that the landing card is *literally* the production card pulled into a centered frame. Implementation efficiency: one component, two contexts.

Pieces:
- Top mono row: `MUSICIAN · UT AUSTIN` + OPEN status dot
- Big serif-grotesque name
- 2-line bio
- Chip row (instruments + genres)
- A subtle `mailto →` link styled like the contact CTA on the detail page

## 10. The Lower Section

Below the hero card and CTAs, a single horizontal row of **three real gigs** in compact rectangles, no cards around them — just rows separated by 1px `border.faint` lines. Each row links to `/gigs/[id]`. The visual contrast: one big detailed listing above, three sparse listings below. Variety in density tells the user the directory has both.

## 11. What This Version Refuses to Do

- No background graphics
- No multiple accent colors
- No 3D effects beyond the soft shadow
- No icon system (mono labels do the work)
- No carousel with 5+ items visible at once
- No autoplay sound (obviously)

## 12. Implementation Notes

- Total motion JS: ~3KB for the cycling logic + reduced-motion gating.
- Listings cycle through the same `MusicianProfile[]` returned by `/musicians` ordered by `updatedAt DESC`. Cap to 12.
- The card uses `will-change: transform` only during animation. Cleaned up between cycles.
- The breathing animation is pure CSS keyframes.

## 13. Accessibility

- `prefers-reduced-motion: reduce` → breathing stops, OPEN dot stops pulsing, cycle becomes an instant swap with no slide.
- Cycle controls have explicit `aria-label`s.
- Card is tab-focusable as a single link to that musician's page.

## 14. The Test

Watch the hero for 30 seconds without scrolling. The card should feel like a *being* — present, calm, alive. Not aggressive. Not boring. If it feels still, increase the scale amplitude by 0.002. If it feels jittery, decrease the pulse frequency to 6s. Tune to *almost imperceptible*.
