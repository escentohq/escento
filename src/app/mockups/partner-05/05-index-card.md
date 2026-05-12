# Landing Design 05 — **Index Card**

> I'm a senior product designer trained on Swiss typography and the Vignelli school. The cleverest landing pages for directories don't try to dazzle — they just *are* the directory, with a thin frame around them. This version is a single library-catalogue card the size of the viewport, and it works because it's honest about what GigForge is.

---

## 1. The Concept

The landing page is rendered as one giant index card on a quiet table. Headline at the top, real directory rows below it, a single decisive primary action in the bottom-right. No hero illustration. No three-up grid. The page *is* the product preview.

## 2. Why This Direction

GigForge's MVP is intentionally not-a-feed. Treating the landing page as a directory specimen — like the front of a music school's bulletin board — communicates that more honestly than any tagline. Users scroll three lines and already understand the product.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.table` | `#EFEAE0` | Page background — the "wooden table" warmth |
| `bg.card` | `#FAF6EC` | The big index card |
| `border.card` | `#1A1A1A` | Card edge, 1px |
| `border.rule` | `#1A1A1A` | Horizontal rules at 100% opacity, 1px |
| `border.faint` | `rgba(26,26,26,0.16)` | Row separators inside the card |
| `ink.primary` | `#0F0F11` | All body text |
| `ink.secondary` | `#5C5C60` | Metadata |
| `accent.stamp` | `#B83A2A` | Used only on a single rubber-stamp graphic (the "OPEN" stamp) and the primary CTA |

That's a 7-color palette. Period.

## 4. Typography

- **Headline:** Söhne Breit (a wide grotesk) at `clamp(40px, 5.5vw, 72px)`, 600 weight, tracking `-0.01em`.
- **Body:** Söhne or Inter, 400 at 15px, leading 1.5.
- **Mono:** GT America Mono 12px in `ink.secondary` — used for the metadata rail at the top of the card (`CARD №24 · UPDATED MAY 11 · 142 MUSICIANS · 24 GIGS`).

The page reads like a card on a library cabinet.

## 5. Layout

```
┌──────────────────────────────────────────────────────────────┐
│                                                                │
│   [logo]                                       [signin]         │
│                                                                │
│   ┌──────────────────────────────────────────────────────┐    │
│   │                                                        │    │
│   │  CARD №24 · UPDATED MAY 11 · 142 MUSICIANS · 24 GIGS  │    │ ← mono eyebrow
│   │                                                        │    │
│   │  Student musicians.                                   │    │
│   │  Student creators.                                    │    │
│   │  One directory.                                       │    │ ← display headline, 3 lines
│   │                                                        │    │
│   │  ────────────────────────────────────────────────    │    │ ← 1px rule
│   │                                                        │    │
│   │  MUSICIANS                                            │    │ ← section label
│   │  ────────────────────────────────────────────────    │    │
│   │  Maya Chen · Guitar, Vocals · UT Austin · Indie   →  │    │
│   │  Jordan Lee · Cello · USC · Classical · Film       →  │    │
│   │  Sam Park · Piano, Producer · Berklee · Jazz       →  │    │
│   │                                                        │    │
│   │  ────────────────────────────────────────────────    │    │
│   │  GIGS                                                 │    │
│   │  ────────────────────────────────────────────────    │    │
│   │  FILM · Composer for thesis short · UT Austin · PAID │    │
│   │  PODCAST · Theme music · Remote · NEGOTIABLE          │    │
│   │  GAME · Loop composer · Berkeley · UNPAID             │    │
│   │                                                        │    │
│   │  ────────────────────────────────────────────────    │    │
│   │                                                        │    │
│   │  How it works.                                        │    │
│   │  Browse → email → done. No account needed to look.   │    │
│   │                                                        │    │
│   │                                  [ Browse directory ]  │    │
│   │                                                        │    │
│   └──────────────────────────────────────────────────────┘    │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

The whole thing is one card. Max card width 1040px, padding 56px on desktop, 24px on mobile.

## 6. The Signature: The Live Directory Rows

Those rows aren't decorative — they're rendered from real DB queries server-side. Top 3 musicians by `updatedAt`, top 3 OPEN gigs. Each row links to the actual detail page.

This means the landing page **is** an SEO-friendly preview of inventory. Crawlers love it. Users orient instantly.

### Row hover behavior

On hover, a row:
- Background shifts to `rgba(184, 58, 42, 0.06)` (very faint warm wash)
- The `→` arrow advances 6px
- Subtle 1px underline appears under the name

That's the entire interaction model. Zero pop-ups, zero modals.

## 7. The Stamp

A single decorative element: a rubber-stamp-style `OPEN` graphic in `accent.stamp` rotated -7°, positioned in the top-right corner of the card. SVG, hand-roughened edges, slight color bleed. Static, no animation. It's a print artifact — confidence at zero cost.

Below it in mono: `STAMPED · MAY 11, 2026`. Updates daily.

## 8. CTAs

**Primary** — `Browse directory`:
```
bg: #0F0F11
text: #FAF6EC
height: 48px, px: 24px
radius: 0px   ← rectangle. NO rounding. Library-card discipline.
border: none
font: Söhne 500, 14px, tracking +0.04em, uppercase
hover: bg #B83A2A (ink → stamp red)
```

There is **only one primary CTA** above the fold. The signin link in the nav is the only other action. Decisive.

## 9. The "Filter Strip" Tease

Just below the directory rows, a small mono line:
```
FILTER · INSTRUMENT [ ] GENRE [ ] PROJECT TYPE [ ] →  see all
```
Each `[ ]` is a clickable empty checkbox that deep-links to the relevant `/musicians` or `/gigs` query. This previews the filter system without showing the full UI.

## 10. Mobile

The card becomes 95% viewport width. Rows wrap onto two lines. The stamp moves to top-center. Headline drops to 36px. Padding compresses to 20px. Visually still one card.

## 11. What This Version Refuses to Do

- No hero illustration
- No animated gradients
- No icons
- No 3D
- No motion outside the row-hover wash
- No testimonials
- No newsletter

This version's marketing strategy is: **show, don't promise**.

## 12. Implementation Notes

- Pure server-rendered HTML — no client JS required for the landing.
- Total payload < 30KB including font.
- Pages indexed weekly will give Google a fresh, link-rich preview of inventory — measurable SEO benefit.

## 13. The Test

Disable JavaScript in your browser. Reload. The page should be **identical**. If anything looks broken with JS off, you've drifted from the concept — pull it back.
