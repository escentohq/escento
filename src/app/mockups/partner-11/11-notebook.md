# Landing Design 11 — **Notebook**

> I'm a senior product designer who's worked on indie community products — small forums, local-school tools, niche directories. The polished SaaS aesthetic is bad fit for student-to-student tools. Students trust things that look hand-made, considered, and a little personal. This version takes that seriously: GigForge's landing page is rendered like a music student's notebook spread, with hand-drawn ink lines, taped-on cards, and one accent highlighter color.

---

## 1. The Concept

The landing page looks like a sketchbook spread laid open: cream paper, light pencil ruling, hand-drawn black ink frames around real listings, one yellow highlighter accent. The composition feels found, not designed. The product reads as *for students, by students*.

## 2. Why This Direction

Student products usually go one of two directions: corporate-clean (try to look professional and grown-up) or aggressively-young (try to look like TikTok). Notebook does neither. It looks like something a junior at art school would design as a labor of love for their friends. That energy is GigForge's actual brand.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#F4EFE3` | Notebook paper cream |
| `bg.page.alt` | `#EDE7D6` | Slightly darker for the opposite "page" of the spread |
| `ink.line` | `#1A1A1A` | All ink strokes (hand-drawn lines) |
| `ink.primary` | `#1A1A1A` | All body text |
| `ink.secondary` | `#5A5650` | Subheads |
| `ink.pencil` | `rgba(26,26,26,0.18)` | Pencil rule lines |
| `accent.highlighter` | `#F8E66B` | One yellow highlighter color, used behind handwritten notes and on the primary CTA |
| `accent.tape` | `#E8D9A8` | Washi-tape color on the affixed cards |

A 9-token palette built around paper and ink + two warm accents.

## 4. Typography

Two voices: typed and handwritten.

- **Typed headline:** Söhne 700, `clamp(40px, 5.5vw, 72px)`, leading `1.0`, tracking `-0.02em`. This is the "official" voice — for the parts that have to be legible.
- **Handwritten:** A hand-drawn variable font like **Sketchnote Square** or **Caveat 600** (the latter is free on Google Fonts and excellent). Used for marginal notes, the eyebrow ("hello!"), and one piece of crossed-out alternate text.
- **Body:** Söhne 400, 16/26.
- **Captions:** Caveat 500, 18px — informal annotation throughout.

Mixing typeset and handwritten is the entire design language. Don't overdo the handwritten part — restrict it to 4-5 spots on the page.

## 5. Layout

```
┌─────────────────────────────────────────────────────────────┐
│   GIGFORGE                                  Sign in →        │
│  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌      │  ← pencil ruled line
├─────────────────────────────────────────────────────────────┤
│                                                                │
│      hi! ↙ (handwritten arrow pointing down)                  │  ← Caveat eyebrow
│                                                                │
│      Find the right                                            │
│      student musician                                          │  ← Söhne 72px display
│      for your next project.                                    │
│                                                                │
│      (no algorithms. no DMs. no feed.)   ← Caveat caption     │
│                                                                │
│      [ Browse musicians ]   Post a gig ↗                      │
│                                                                │
│                                          ┌──────────────┐    │
│                                          │  ╱╱  TAPE  ╲╲ │    │  ← washi tape strip
│                                          │              │    │  ← affixed listing card,
│                                          │   Maya Chen  │    │     rotated -2deg
│                                          │   guitar +   │    │
│                                          │   vocals     │    │
│                                          │              │    │
│                                          │  → mailto    │    │
│                                          └──────────────┘    │
│                                                                │
│      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │  ← hand-drawn divider
│                                                                │
│      how it works                                              │  ← lowercase + Caveat eyebrow
│                                                                │
│      1. browse the directory                                   │
│      2. email someone you like                                 │
│      3. that's the whole product                              │
│                                                                │
│      ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│      │   sample     │  │   sample     │  │   sample     │   │  ← three real listings,
│      │   gig 1      │  │   gig 2      │  │   gig 3      │   │     each rotated 1-2deg
│      └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                │
└─────────────────────────────────────────────────────────────┘
```

Max width 1120px. The page is intentionally *uneven* — cards rotated by ±2deg, hand-drawn lines never perfectly horizontal.

## 6. The Hand-Drawn Lines

All structural lines are SVG paths with a *roughened* effect — implemented either via:

- **`rough.js`**, the canonical library for this look (~15KB gzip). Worth the bundle cost; the alternative is hand-tuning paths.
- Or **prebaked SVGs** of each line (header rule, section dividers, card borders), drawn once in Figma with a wobble plugin, then exported. Smaller, but inflexible. Default to rough.js.

Lines use `roughness: 1.4`, `strokeWidth: 1.5`, `seed: 42` (constant so the page renders the same every time).

## 7. The Affixed Listing Card

The hero "card" isn't a flat rectangle — it's drawn as if **taped to the page**:

- The card body is `bg.card: #FFFFFF` with a 1.5px rough-drawn `ink.line` border, rotated `-2deg`.
- A small washi-tape strip (`accent.tape`, semi-transparent) crosses the top-left corner at `+12deg`, rotated independently.
- A second strip on the bottom-right corner, rotated `-15deg`.
- Subtle shadow under the card: `0 12px 24px -8px rgba(20,20,20,0.15)`.

The card content is real — a server-rendered musician listing. Click → `/musicians/[id]`.

## 8. The Highlighter Accent

The primary CTA is **not a button**. It's a phrase with a hand-drawn highlighter swipe behind it:

```
[ Browse musicians ]
```

The highlighter is an SVG `<rect>` with a slight skew (`transform: skewX(-3deg)`) in `accent.highlighter`, sitting *behind* the text with a `mix-blend-mode: multiply`. The text itself is `ink.primary`.

On hover: the highlighter widens by 4px and intensifies; text shifts 2px right; the link becomes the strongest visual element on the page for a moment.

The same highlighter accent is also used on one handwritten marginal note ("`← start here!`") to tie the brand color to a personal moment.

## 9. The Crossed-Out Joke

Tucked in the hero subhead, one piece of text is *crossed out* with a hand-drawn line:

```
(no algorithms. no DMs. no ~~feed~~ feed.)
```

The strikethrough is a rough SVG line. The crossed-out word is a tiny gag — visual proof that a human edited this page. Used **once** on the whole page. More than once and it becomes a tic.

## 10. CTAs

**Primary** — `Browse musicians`:
- Highlighter-backed text link as described above.
- No box, no border, no padding-as-button.

**Secondary** — `Post a gig`:
- Plain text link in `ink.primary` with a small `↗` arrow. On hover, an underline drawn with the same rough-style pen.

There are **only two buttons-as-text** on the entire hero. The simplicity is the design.

## 11. The Three Listings at the Bottom

Three real gigs from the directory, each rendered as a slightly-rotated card (rotations: `-1deg`, `+1.5deg`, `-0.5deg`), each with its own pair of washi tape strips. Hovering one: card unrotates to `0deg` with a soft bounce, lifts slightly, and the tape strips de-fade. Like picking the card up off the page.

Click → relevant `/gigs/[id]`.

## 12. Motion Constraints

- No moving handwriting (never animate handwritten strokes drawing themselves — it's the most worn-out cliché in this aesthetic).
- The only motion: card hover unrotate + lift. ~280ms cubic-bezier spring.
- Highlighter swipe on hover: 180ms ease.
- `prefers-reduced-motion`: all motion off; the page remains beautiful at rest.

## 13. What This Version Refuses to Do

- No actual paper texture (no faux paper noise overlay — it always looks cheap; the cream color does the work)
- No animated stroke-drawing
- No multiple handwritten fonts
- No "ripped page" graphics
- No Comic Sans (obviously)
- No more than one highlighter color

## 14. Implementation Notes

- rough.js loaded only on the landing page, not site-wide.
- Caveat font (Google Fonts) preloaded as woff2.
- All rough-drawn elements use a fixed seed for SSR consistency.
- The rotation transforms are CSS, not SVG — keeps text crisp.

## 15. The Test

Show the page to a music student. Ask them what they think the product is. If they say *"it looks like something my friend made,"* you nailed the register. If they say *"it looks like a tech startup,"* you over-polished — rotate the cards more and let the rough lines breathe.
