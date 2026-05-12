# Landing Design 02 — **Studio Console**

> I'm a senior product designer with a decade of work on tools for creative communities — record labels, music software, agency portals. The brief was clear: GigForge is a directory, not a feed. Every pixel here defends that. The landing has to feel like a piece of professional studio gear someone in a music school would actually trust with their reputation. Cool, quiet, exact. Nothing chirpy.

---

## 1. The Concept in One Sentence

A pitch-dark studio console: precise typography, a single warm accent, and one ambient motion piece — a slow waveform breathing across the hero — so the page feels alive without ever shouting.

## 2. Why This Direction

GigForge's job-to-be-done is *"find the right person and email them."* That's a focused, almost professional act. The current code already commits to a dark `zinc-950` surface with violet accents (Appendix A). Studio Console keeps that DNA but raises the craft: tighter type scale, real grid discipline, one signature motion piece. This is the version you ship if you only ship one.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#08080B` | Page background (a hair darker than zinc-950 for richer contrast) |
| `bg.surface` | `#101015` | Cards, console panels |
| `bg.surface.elev` | `#16161D` | Hovered card |
| `border.hairline` | `#1F1F27` | 1px dividers |
| `border.focus` | `#7C5CFF` | Input focus ring, active filter pill |
| `text.primary` | `#F4F4F7` | Headlines, body |
| `text.secondary` | `#A1A1AA` | Subheads, metadata |
| `text.tertiary` | `#52525B` | Captions, helper text |
| `accent.violet` | `#8B6FFF` | Primary CTA, link hovers |
| `accent.warm` | `#E8C275` | One single warm signal — used **only** on the live waveform and the "open gigs" pulse dot. Restraint is the point. |
| `status.open` | `#5EE2A0` | OPEN gig badge |
| `status.closed` | `#D1A05B` | CLOSED gig badge |

No gradient backgrounds. No glow halos. The whole palette is grayscale plus two accents, full stop.

## 4. Typography

- **Display:** Söhne or Inter Display, weight 600, tracking `-0.02em`. Hero headline at `clamp(44px, 6vw, 88px)`, leading `1.02`.
- **Body:** Inter, 400/500. Body at 16px, leading `1.55`.
- **Mono:** JetBrains Mono 13px — used for the small console-style metadata (e.g., `OPEN · 24 GIGS · UPDATED 2 MIN AGO`) above the hero headline. This single mono line is what sells the "studio gear" feeling.

## 5. Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [logo]                                       [signin] [→]    │  ← thin nav, 64px
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  OPEN · 24 GIGS · UPDATED 2 MIN AGO         ← mono eyebrow    │
│                                                                │
│  Find the right student musician.                              │
│  Email them directly.                          ← display H1   │
│                                                                │
│  A directory, not a feed. Built for student creators           │
│  who need a composer, a guitarist, a vocalist — now.           │
│                                                                │
│  [ Browse musicians → ]   [ Post a gig ]                       │
│                                                                │
│  ──────────────────────────────────────────────────────────    │
│  ╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲  ← ambient waveform, full bleed       │
│                                                                │
├──────────────────────────────────────────────────────────────┤
│  [ Sample musician card ]    [ Sample gig card ]               │
│  Two real cards from the live directory, anonymized.           │
├──────────────────────────────────────────────────────────────┤
│  How it works · 3 short steps in a single horizontal row.      │
└──────────────────────────────────────────────────────────────┘
```

Max width 1152px (`max-w-6xl`), gutters 24px mobile / 48px desktop.

## 6. The Signature Motion: Ambient Waveform

A single SVG `<path>` rendered full-bleed below the hero copy. Built from 256 points, animated with `requestAnimationFrame` using a sum of three sine waves at incommensurate frequencies (so it never visibly loops):

```
y(x, t) = A1·sin(k1·x + ω1·t) + A2·sin(k2·x + ω2·t) + A3·sin(k3·x + ω3·t)
```

- Stroke: 1.5px, `accent.warm` at 35% opacity.
- Below the line: same path filled with a vertical gradient `accent.warm 8% → transparent`, 40px tall.
- Slowed to ~0.15 cycles/sec — it has to feel like ambient sound, not a busy chart.
- `prefers-reduced-motion: reduce` → freezes to a single still frame.

This is the **only** moving piece on the page. Its restraint is the design.

## 7. 3D / Depth Treatment

No three.js, no WebGL. Depth comes from:

- 1px hairline borders on every surface
- A single sub-pixel inner highlight on cards: `box-shadow: inset 0 1px 0 rgba(255,255,255,0.04)` — gives every card the look of brushed-anodized aluminum catching a top light
- Cards lift on hover via `translateY(-2px)` + border step from `#1F1F27` → `#2C2C36`. 180ms `cubic-bezier(0.4, 0, 0.2, 1)`.

## 8. CTAs

**Primary** — `Browse musicians`:
```
bg: #8B6FFF
text: #08080B (yes, dark text on violet — readable, premium)
height: 48px, px: 20px
radius: 12px
font: Inter 600, 15px, tracking -0.005em
hover: bg #9D85FF, translateY(-1px), shadow 0 8px 24px rgba(139,111,255,0.25)
```

**Secondary** — `Post a gig`:
```
bg: transparent
border: 1px #2C2C36
text: #F4F4F7
hover: border #7C5CFF, bg rgba(124,92,255,0.05)
```

## 9. The Two Sample Cards (Right Side of Hero on Desktop, Below on Mobile)

These are *real-looking* cards, not illustrations — pulled from the directory but hand-curated:

- **Musician card:** Avatar circle (initials, monogrammed), `Maya Chen`, `Guitar · Vocals`, `UT Austin`, two genre chips, a 2-line bio clamp.
- **Gig card:** Project type badge (`FILM`), `Composer for 10-min thesis short`, comp badge, deadline, 2-line description.

The hero literally shows you what the product produces. No mockup illustrations.

## 10. Section: How It Works

Horizontal 3-up with mono numerals (`01` / `02` / `03`) at 32px in `text.tertiary`, headline below in `text.primary`, one-sentence subhead in `text.secondary`. No icons. No cards around them. Numbers and dividers do the work.

## 11. Empty / Edge States

When the live "OPEN · N GIGS" counter would say `0`, the eyebrow softens to `QUIET RIGHT NOW · CHECK BACK SOON` and the warm accent on the waveform drops to 18% — the page literally dims itself when there's nothing happening. Honest, and beautiful.

## 12. What This Version Refuses to Do

- No testimonials (it's a campus tool, social proof is the directory itself)
- No "trusted by" logos
- No feature grid with icons
- No newsletter signup
- No floating chatbot

## 13. Implementation Notes

- Hero waveform: single `<canvas>` 1px-DPR-aware, ~3KB JS, no library.
- All other content is server-rendered.
- No layout shift — eyebrow counter is fetched server-side, not client-hydrated.

## 14. The Test

Open the page in a quiet room. The only thing that moves is the waveform. You should want to keep watching it. If you don't, the amplitudes are wrong — tune them down further until you do.
