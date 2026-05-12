# Landing Design 04 — **Stagelight**

> I'm a senior product designer who built rebrand sites for two indie record labels and a national orchestra. Music landing pages always lean on flame and neon. They shouldn't. Real stages are dark, with one warm light pointing somewhere intentional. This version puts a single 3D spotlight at the center of the page and lets it do everything.

---

## 1. The Concept

A near-black stage. One soft spotlight beam falls from the top of the hero, illuminating an invisible performer where the headline sits. The headline appears *inside* that light. Move your cursor — the light follows, gently. That's the entire visual.

## 2. Why This Direction

The product helps people *find performers*. A spotlight is the most literal possible visual metaphor that doesn't read as cliché — as long as it's restrained. The 3D here is not a hero animation showing off; it's stagecraft. The page is the stage. The visitor is the audience. The musicians on the directory are the show.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.stage` | `#0A0A0C` | Page (deep theater black, not pure black) |
| `bg.floor` | `#0E0E11` | A 1px-wider band at the bottom of the hero — subliminal "floorline" |
| `light.warm` | `#FFC880` | Spotlight inner |
| `light.warm.mid` | `#E8A45C` | Spotlight middle radius |
| `light.warm.outer` | `rgba(232,164,92,0)` | Spotlight falloff |
| `text.lit` | `#FFF8EE` | Text inside the light |
| `text.unlit` | `#52525B` | Text outside the light — visible but quiet |
| `border.subtle` | `#1A1A1F` | Card edges |
| `accent.cool` | `#5E8FFF` | Single cool accent on the primary CTA. The CTA is the only thing on the page that *isn't* warm. |

## 4. Typography

- **Display:** Inter Display 700, `clamp(48px, 7vw, 96px)`, tracking `-0.025em`.
- **Body:** Inter 400, 16/26.
- **Mono / metadata:** GT America Mono 12px in `text.unlit` — used for stage directions ("THE STAGE · ROW B · SEAT 14") as a decorative subhead.

## 5. Layout

```
┌────────────────────────────────────────────────────────┐
│   [logo]                              [signin]   →     │
├────────────────────────────────────────────────────────┤
│                                                          │
│                      · · ·                              │  ← three dim dots (the rigging)
│                       │                                 │
│                       ▼                                 │  ← beam falls
│                                                          │
│                  THE STAGE · ROW B                      │  ← unlit, mono, tiny
│                                                          │
│              Find the musician                          │  ← lit text
│              your project needs.                        │
│                                                          │
│           A directory for student creators.             │  ← lit, smaller
│                                                          │
│            [ Browse musicians ]  [ Post a gig ]         │  ← CTAs
│                                                          │
│  ──────────────────────────────────────────────────    │  ← faint floor line
└────────────────────────────────────────────────────────┘
                                                          
                  [Two sample cards in a darker band below the stage]
```

## 6. The Signature: The 3D Spotlight

This is the only 3D element. Implementation:

- A **CSS radial-gradient + mix-blend-mode** layer, not WebGL. Three.js is overkill and costs 600KB.
- One full-bleed `<div>` absolutely positioned with `background: radial-gradient(ellipse 600px 800px at var(--mx) var(--my), #FFC880 0%, rgba(232,164,92,0.4) 22%, rgba(232,164,92,0.08) 50%, transparent 70%);` and `mix-blend-mode: screen`.
- `--mx` and `--my` are CSS custom properties updated on `mousemove`, eased by ~0.08 per frame — the light *lags* the cursor like a real follow-spot.
- Default position before any cursor movement: dead-center on the headline.
- On touch devices: the spotlight slowly oscillates side-to-side on a 6s sine — feels alive without needing a cursor.
- `prefers-reduced-motion`: spotlight locks center, no follow.

Inside the lit region, text uses `text.lit` and is fully readable. Outside, text fades to `text.unlit` — visible but ghostly. The cursor literally reveals the page.

## 7. Above the Beam: The Rigging Hint

Three 4px circles in `text.unlit` at the top center, spaced 32px apart. They represent the lighting rig overhead — pure decoration, but they sell the metaphor in 12 pixels. A thin 1px vertical line, 24% opacity, descends from the middle circle into the beam.

## 8. CTAs

**Primary** — `Browse musicians`:
```
bg: #5E8FFF (the cool counterpoint to the warm stage)
text: #0A0A0C
height: 50px, px: 24px
radius: 100px (pill — the only round shape on the page)
hover: bg #7BA3FF, scale 1.02, shadow 0 12px 32px rgba(94,143,255,0.3)
```

The cool blue against the warm stage is the chromatic tension that makes the page *feel*. Don't lose it.

**Secondary** — `Post a gig`:
```
bg: transparent
border: 1px rgba(255,200,128,0.4)   ← borrows the spotlight color, faintly
text: #FFF8EE
hover: border rgba(255,200,128,0.8)
```

## 9. Below the Stage: Two Sample Cards

A separate band with `bg.floor`. Two cards side-by-side, full-color, *not* affected by the spotlight (they live below the stage in a backstage-style strip). One musician, one gig. Each is a real preview of a directory entry.

## 10. How It Works

A 3-row vertical list (not a grid). Each row:

```
[01]  Browse the directory          A no-account page. Just look.
[02]  Find a student you like        Email is right there.
[03]  Hire them, or not              That's it. That's the product.
```

Numbers in `light.warm.mid`, headline in `text.lit`, body in `text.unlit`. Spaced 32px apart.

## 11. Stage-Direction Footer

Footer copy uses theater language: `EXIT · STAGE LEFT` for the back-to-top link, `INTERMISSION` for the privacy policy section header, `PROGRAMME` instead of "About". This is the only place the theater metaphor gets cheeky — and it stays in the footer where power users find it.

## 12. What This Version Refuses to Do

- No actual three.js (avoid bundle bloat)
- No spotlight on the cards section (the spotlight is only on the stage)
- No multiple beams (one spotlight, always)
- No "fog machine" particles (one cliché too many)

## 13. Implementation Notes

- Total JS: < 2KB for the spotlight tracking.
- The radial-gradient approach renders at 60fps on a 5-year-old laptop. WebGL would not.
- Test the cool-blue CTA on color-blind users: under deuteranopia it reads warmer; the contrast against the page is still sufficient (≥4.5:1).

## 14. The Test

Take a screenshot. Crop to just the hero. Hand it to a graphic designer with no context. If they say "theater poster," you got it. If they say "gaming site," your beam falloff is too sharp — soften the outer stop to 75%.
