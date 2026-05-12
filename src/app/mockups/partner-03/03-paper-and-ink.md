# Landing Design 03 — **Paper & Ink**

> I'm a senior product designer. My past work lives in editorial product design — long-form magazines, university-press websites, the kind of typography that makes you want to read more. GigForge sits on a college campus. Half its users grew up reading their school's literary journal. This version trades the studio darkness for something that feels printed, considered, and deeply human. A campus broadsheet, online.

---

## 1. The Concept

A warm off-white "paper" page with one bold serif headline, one ink-black accent, and a single playful interaction: the headline word *"musician"* swaps every few seconds through the actual instruments currently represented in the directory (`guitarist`, `violinist`, `producer`, `vocalist`, `cellist`, …). Reading the page tells you who's actually on it.

## 2. Why This Direction

Most directory landing pages compete on darkness and density. Paper & Ink does the opposite — it borrows the visual language students already trust: course catalogues, alumni magazines, indie record store posters. It implicitly promises *curated*, not *algorithmic*. That's exactly what GigForge is.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#F5F1E8` | Warm paper white (NOT pure white — pure white feels like a SaaS dashboard) |
| `bg.surface` | `#FFFFFF` | Cards (the "inset on paper" feel) |
| `border.rule` | `#1A1A1A` | 1px and 2px editorial rules |
| `ink.primary` | `#0E0E10` | Body, headlines |
| `ink.secondary` | `#4A4A4F` | Subheads, captions |
| `ink.muted` | `#8A8682` | Metadata |
| `accent.red` | `#C2452F` | One color, used on links, the rotating headline word, and the OPEN dot |
| `accent.red.wash` | `#F4DDD6` | Underline highlight behind active filter pills |

That's it. Paper + ink + one editorial red. Zero gradients.

## 4. Typography

- **Display:** GT Sectra or Tiempos Headline, **regular weight (not bold)**. Hero headline at `clamp(56px, 7vw, 104px)`, leading `0.98`, tracking `-0.015em`. The size does the work — weight stays elegant.
- **Body:** Inter or Söhne, 17px, leading `1.55`. Body text in `ink.primary`.
- **Eyebrow / metadata:** small caps Inter 12px, tracking `+0.12em`, in `ink.muted`.

The headline uses a **real italic** for the rotating word — not faux-italic. That single italic word is the page's personality.

## 5. Layout

```
┌─────────────────────────────────────────────────────────────┐
│  GIGFORGE                                  Sign in / Post →  │   thin nav
│  ───────────────────────────────────────────────────────     │   2px rule across full width
├─────────────────────────────────────────────────────────────┤
│                                                               │
│      ISSUE №24 · WEEK OF MAY 11                              │   eyebrow (small caps)
│                                                               │
│      Find the right                                           │
│      student *guitarist*  ← rotating italic word              │
│      for your next project.                                   │
│                                                               │
│      A directory of student musicians at universities         │
│      across the country. No feed. No DMs. Just contact.       │
│                                                               │
│      [ Browse the directory ]   Post a gig →                  │
│                                                               │
│  ───────────────────────────────────────────────────────     │   1px rule
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  THIS WEEK ON GIGFORGE                                        │
│                                                                │
│  Three featured cards from the live directory, in a column   │
│  grid (1/3/3 responsive). Each card has a thin top rule, a   │
│  small-caps category, a serif headline, and a one-line       │
│  description. Like newspaper articles.                        │
│                                                                │
│  ───────────────────────────────────────────────────────     │
│                                                                │
│  HOW IT WORKS · in three short paragraphs of body copy,      │
│  not a feature grid. Each paragraph leads with a drop cap.   │
│                                                                │
└─────────────────────────────────────────────────────────────┘
```

Max width 1080px. Generous margins. Optical centering of the hero, not mathematical.

## 6. The Signature Interaction: The Rotating Word

The italic word in the headline rotates through real data every 2.8 seconds:

```
Find the right student [guitarist] for your next project.
                       [violinist]
                       [producer]
                       [vocalist]
                       [cellist]
                       [drummer]
                       [composer]
```

- Source: top 8 instruments by musician count in the live DB (server-rendered into the page as a JSON island).
- Transition: the outgoing word fades out + drops 4px while the incoming word fades in + rises 4px. 360ms each, overlapping by 120ms. Cubic-bezier `(0.32, 0.72, 0, 1)`.
- The italic + red accent + motion together are the entire "wow" of the page.
- `prefers-reduced-motion`: rotation stops; the word becomes a static `<span>` that crossfades on click instead.

## 7. 3D / Depth Treatment

There is no 3D. The depth illusion comes from print-design tricks:

- Cards: pure `#FFFFFF` on warm `#F5F1E8` page — the contrast itself gives lift.
- A single 1px hairline border in `border.rule` at 12% opacity around each card.
- Hover: card translates up 1px and the border darkens to 40% opacity. That's all. The restraint *is* the depth.

## 8. CTAs

**Primary** — `Browse the directory`:
```
bg: #0E0E10
text: #F5F1E8
height: 52px, px: 28px
radius: 2px   ← almost square. Editorial. NOT a SaaS pill.
font: Inter 500, 15px
hover: bg #C2452F (the ink-to-red swap is the brand moment)
transition: 240ms
```

**Secondary** — `Post a gig →`:
```
No button shape. Just text in #C2452F with a 1px underline,
500 weight, the arrow advances 4px on hover.
```

## 9. The Three Featured Cards

Real entries pulled server-side from the directory. Each one is rendered like a magazine clipping:

```
─────────────────────
GIG · FILM
Composer for a 10-minute thesis short
Searching for a composer fluent in synth + strings.
UT Austin · Paid · Deadline Jun 12
                                                  →
```

Top rule in `accent.red`. Category in small-caps. Headline in 22px serif. Body in 14px Inter. Arrow on hover advances + line under the headline appears. Clicking goes to `/gigs/[id]`.

## 10. Mobile

Stacks cleanly. The rotating word still works but capped at 4 rotations to save battery. Headline drops to 44px. Margins compress to 20px.

## 11. What This Version Refuses to Do

- No dark mode toggle (the warmth is the point)
- No emoji
- No animated background
- No "trusted by" row
- No icons in the how-it-works

## 12. Implementation Notes

- The rotating word: 30 lines of vanilla JS, an array of strings, and a `setInterval` you can disable from a context provider.
- Serve a self-hosted variable font for Sectra/Tiempos with `font-display: swap` and preload the woff2.
- Test on iPad Safari — the warm off-white can shift cool on uncalibrated displays; if it does, push `bg.page` to `#F6F2EA`.

## 13. The Test

Print the landing page on a sheet of A4. If it looks like a real magazine cover, you nailed it. If it looks like a SaaS screenshot in monochrome, the serif weight is wrong or the body is too dense — fix before shipping.
