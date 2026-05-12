# Landing Design 07 — **Quiet Campus**

> I'm a senior product designer who's worked on identity systems for two universities and a music conservatory. Campus-targeted products almost always over-design themselves into looking like consumer apps. This version takes the opposite path: it borrows the architectural minimalism of a well-designed university website — Princeton, MIT Media Lab, Bauhaus-Archiv — and trusts the typography and the grid to do the work.

---

## 1. The Concept

A wide, generous, mostly-empty page in warm parchment tones. One enormous serif headline anchored to a strict 12-column grid. A single subtle 3D element — a paper-thin floating card that catches light from a fixed angle — sits in the negative space, gently suggesting the directory cards. No more, no less.

## 2. Why This Direction

GigForge lives on university campuses. The students using it will spend half their day on a university website. Match that visual register. Quiet Campus communicates *legitimate*, *institutional*, *not-a-startup-trying-too-hard*. That's actually what makes student tools spread on campuses.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#FBF7EF` | Warm parchment |
| `bg.surface` | `#FFFFFF` | The floating card, secondary surfaces |
| `border.divider` | `#1F1B16` | Heavy 1px rules between sections |
| `border.faint` | `rgba(31,27,22,0.12)` | Subtle dividers |
| `ink.primary` | `#1F1B16` | Body, headlines (warm near-black, never pure) |
| `ink.secondary` | `#5A554C` | Subheads, metadata |
| `ink.muted` | `#8E8678` | Captions |
| `accent.navy` | `#1A3A5F` | One color, used on the primary CTA and active links — a deep, institutional navy that reads as "trust" without screaming for attention |
| `accent.gold` | `#A88B3C` | A single use, on the underline of the wordmark and the directory-count pill. Sparingly applied. |

A 9-token palette anchored in warm whites and one navy. This is what a well-designed humanities department's website looks like.

## 4. Typography

- **Display:** GT Sectra Display (or Tiempos Headline) **Regular**, `clamp(56px, 8vw, 128px)`, leading `0.95`, tracking `-0.02em`.
- **Subhead:** Söhne 400, `clamp(18px, 1.6vw, 22px)`, leading `1.5`, in `ink.secondary`.
- **Body:** Söhne 400, 16/26.
- **Mono:** GT America Mono 12px in `ink.muted`, uppercase, `+0.12em` tracking.

The headline is large because it has *room* to be large. The page's confidence comes from the size of the empty space around the type, not from the size of the type itself.

## 5. Layout

```
┌────────────────────────────────────────────────────────────────┐
│   GIGFORGE                                                       │
│   ──                                ← gold underline accent      │
│   Directory of student musicians       Sign in          [→]    │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │ ← heavy 1px rule full bleed
│                                                                   │
│                                                                   │
│   Est. 2024                                                       │ ← mono eyebrow
│                                                                   │
│   Find the right                                                  │
│   student musician                                                │
│   for your next                                                   │
│   project.                                                        │   ← serif headline, 4 lines
│                                                                   │
│   GigForge is a campus directory connecting student musicians    │
│   with student creators — film, podcast, game, event. No feeds. │
│   No DMs. Direct email contact.                                  │
│                                                                   │
│   [ Browse musicians  →  ]    Post a gig                         │
│                                                                   │
│                                                ┌──────────────┐  │
│                                                │              │  │
│                                                │   floating   │  │ ← the single 3D piece
│                                                │   card       │  │
│                                                │              │  │
│                                                └──────────────┘  │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                   │
│   142 musicians       24 open gigs       12 universities         │  ← stat row
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                   │
│   THIS WEEK            ...featured gigs/musicians in 3-up        │
│                                                                   │
└────────────────────────────────────────────────────────────────┘
```

12-column grid, 1280px max-width. Margins 80px desktop / 24px mobile. Page feels institutional — that's intentional.

## 6. The Single 3D Piece: The Floating Card

A single white rectangular card, ~280×360px, positioned in the right half of the hero. It has:

- Subtle ambient occlusion shadow beneath it (`box-shadow: 0 30px 60px -20px rgba(31,27,22,0.18)`).
- A second tighter shadow for contact: `0 2px 4px rgba(31,27,22,0.08)`.
- A `transform: perspective(2000px) rotateY(-4deg) rotateX(2deg)` — barely tilted. Reads as 3D only if you really look.
- A slow ambient `transform` animation: rotateY oscillates between `-4deg` and `-5deg` over 8s. Almost imperceptible. The card *breathes*.
- Inside the card: a sample musician's name (Inter 600 18px), instrument chip, a 2-line bio. Real data, queried server-side. **This is a real preview card.**

On hover (desktop), the card tilts a few more degrees toward the cursor (`pointerover` driven, eased) and the shadow deepens slightly. On click → `/musicians/[id]`.

This is the *only* 3D element on the entire page. Its rarity is what gives it presence.

## 7. The Stat Row

Three big stats on a horizontal rule:

```
142 musicians       24 open gigs       12 universities
```

Numbers in serif 64px display, labels below in mono 12px. Each number is a real DB count. As more campuses join, the page grows up with the product.

## 8. CTAs

**Primary** — `Browse musicians`:
```
bg: #1A3A5F
text: #FBF7EF
height: 52px, px: 28px
radius: 4px   ← minimal radius. Institutional, not consumer-pill.
font: Söhne 500, 15px
hover: bg #224C7A
focus ring: 3px rgba(26,58,95,0.25)
```

**Secondary** — `Post a gig`:
```
bg: none
border: none
text: #1A3A5F
underline: 1px, offset 4px
font: Söhne 500, 15px
hover: underline becomes 2px, in accent.gold
```

## 9. The "This Week" Section

Three real entries (mix of musicians and gigs) in a 1/3-column grid. Each entry:

```
MUSICIAN · UT AUSTIN              ← mono eyebrow
Maya Chen                          ← serif 28px
Guitar, vocals. Indie, folk.       ← Inter body
                                →
```

No card around them. Each entry is separated by a 1px `border.faint` line below. Architectural, not boxy.

## 10. Wordmark Treatment

`GIGFORGE` is set in the display serif at 22px, weight 500, tracking `+0.06em`. Below it, a 24px gold rule (`accent.gold`) about as wide as the "GIG" portion only — like a name highlighted in a printed program. This becomes the brand's signature gesture.

## 11. What This Version Refuses to Do

- No icons anywhere (the architecture is the language)
- No multiple bright colors
- No animated gradients
- No hero illustrations beyond the floating card
- No emoji
- No motion outside the card's slow breath

## 12. Implementation Notes

- The floating card uses CSS `perspective` + `transform-3d` — no library. Total motion JS: ~1KB for the pointer-tilt handler.
- All text is rendered server-side. Page is fast on slow campus Wi-Fi.
- Sectra/Tiempos serif must be preloaded with `font-display: swap` and woff2 subset — if you let it FOIT, the entire design dies.

## 13. Accessibility Notes

- Body contrast: `#1F1B16` on `#FBF7EF` = 13.7:1. Strong.
- Navy CTA: `#FBF7EF` on `#1A3A5F` = 9.8:1.
- Focus rings are highly visible.
- `prefers-reduced-motion`: the floating card freezes (still tilted, no breathing).

## 14. The Test

Show this page to someone who works in university admissions. If they say "this looks like one of our pages," you nailed the register. If they say "looks like a startup," your headline serif is wrong weight or your accent navy is too saturated.
