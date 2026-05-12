# Landing Design 07 — **Campus Network**

> I'm a senior product designer who's built identity systems for university tools and two professional networks. Campus-targeted products fail when they try to look like consumer apps. This version takes the opposite path: clean LinkedIn-grade professionalism applied to the campus context — structured, trusted, light. The kind of page a music department would proudly link to.

---

## 1. The Concept

A wide, clean white page in the professional-network register. Left half: the pitch. Right half: a 2-column mini-directory showing real profiles. The design looks like a cross between a university department site and LinkedIn's "people" section — because that's exactly what GigForge is. No hero illustration. The directory IS the hero.

## 2. Why This Direction

Student tools succeed when they feel institutional and trustworthy, not when they ape consumer social. Quiet Campus Professional communicates: *this is a real network, run with care, built for the campus context*. Professors who discover it will link to it. Department chairs will share it. That's how student tools spread.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#FFFFFF` | Pure white base |
| `bg.section` | `#F3F2EF` | Alternating section background |
| `bg.card` | `#FFFFFF` | Profile cards |
| `bg.pill` | `#EEF3FB` | Skill tag backgrounds |
| `border.heavy` | `#1F1B16` | Nav bottom rule (1px) — the only dark structural line |
| `border.card` | `rgba(0,0,0,0.08)` | Card edges |
| `border.divider` | `rgba(0,0,0,0.10)` | Section separators |
| `ink.primary` | `#191919` | All primary text |
| `ink.secondary` | `#555555` | Subheads, card meta |
| `ink.muted` | `#888888` | Timestamps, availability |
| `accent.blue` | `#0A66C2` | CTA, links, active tags |
| `accent.gold` | `#B8860B` | Wordmark underline accent only — one use |

A 12-token palette: white and blue as the working duo, gold used once.

## 4. Typography

- **Display:** Inter 700, `clamp(48px, 6.5vw, 88px)`, tracking `-0.025em`, leading `1.0`.
- **Subhead:** Inter 400, `clamp(16px, 1.5vw, 20px)`, leading `1.6`, `ink.secondary`.
- **Body:** Inter 400, 16/26.
- **Label:** Inter 500, 12px uppercase tracking `+0.1em`, `ink.muted`.
- **Card name:** Inter 600, 18px.

The headline is large because it has room. The whitespace around it is doing as much work as the type.

## 5. Layout

```
┌────────────────────────────────────────────────────────────────┐
│   GIGFORGE  ──  (gold underline, 24px wide)   Sign in  →       │
│   ──────────────────────────────────────────────────────────   │  ← 1px border.heavy
├────────────────────────────┬───────────────────────────────────┤
│                            │                                     │
│   CAMPUS LABEL · SPRING '26│  ┌────────────┐  ┌────────────┐  │  ← mono eyebrow
│                            │  │ ● Maya C.   │  │ ● Jordan L. │  │
│   Find the right           │  │  Guitar     │  │  Cello      │  │
│   student musician         │  │  UT Austin  │  │  USC        │  │
│   for your next            │  │  →          │  │  →          │  │
│   project.                 │  └────────────┘  └────────────┘  │
│                            │  ┌────────────┐  ┌────────────┐  │
│   The campus directory     │  │ ● Sam P.    │  │ ● Priya K.  │  │
│   for student creators.    │  │  Piano      │  │  Violin     │  │
│   No feed. Direct email.   │  │  Berklee    │  │  UCLA       │  │
│                            │  │  →          │  │  →          │  │
│   [ Browse musicians ]     │  └────────────┘  └────────────┘  │
│   Post a gig               │                                     │
│                            │  + 138 more musicians →            │  ← directory link
│                            │                                     │
└────────────────────────────┴───────────────────────────────────┘
```

Left/right split, 45/55. Mini-directory on the right is 2 columns × 2 rows = 4 real profiles. All links to `/musicians/[id]`.

## 6. The Mini-Directory

Each profile card in the right column:

```
┌────────────────────┐
│  ● AVAILABLE        │  ← availability dot + label (muted mono)
│  Maya Chen         │  ← Inter 600 18px
│  Guitar · Vocals   │  ← Inter 400 14px ink.secondary
│  UT Austin         │  ← Inter 400 13px ink.muted
│  ─────────────────  │  ← 1px border.divider
│  →                 │  ← link to profile
└────────────────────┘
```

Cards: white, `border-radius: 8px`, `box-shadow: 0 2px 8px rgba(0,0,0,0.08)`.

On hover: border-left 3px `accent.blue` appears, arrow nudges right 4px. Simple, professional.

## 7. The Stat Row

Below the hero fold, a full-width section on `bg.section`:

```
─────────────────────────────────────────────────────────────

   142          24 open         12
   musicians    gigs            universities

─────────────────────────────────────────────────────────────
```

Numbers in Inter 700 56px `ink.primary`. Labels in Inter 400 14px uppercase `ink.muted`. Stats pulled from DB in real time. The bar above and below uses `border.divider`.

## 8. CTAs

**Primary** — `Browse musicians`:
```
bg: #0A66C2
text: #FFFFFF
height: 52px, px: 28px
radius: 4px   ← slight rounding, institutional not pill
font: Inter 600, 15px
hover: bg #004182
focus ring: 3px rgba(10,102,194,0.25)
```

**Secondary** — `Post a gig`:
```
bg: none
border: none
text: #0A66C2
underline: 1px, offset 3px
hover: underline color deepens to #004182
```

## 9. The "This Week" Section

Three real listings (mix of musicians and gigs) in a 3-column grid on white. Each entry is minimal:

```
MUSICIAN · UT AUSTIN                  ← mono label, ink.muted
Maya Chen                              ← Inter 700 24px
Guitar, vocals. Indie, folk.           ← Inter 400 body
                                  →
──────────────────────────────────────  ← border.divider bottom
```

No card around them. Architectural, not boxy. Very LinkedIn "People you may know" energy.

## 10. Wordmark Treatment

`GIGFORGE` in Inter 700 20px, tracking `+0.04em`. Below it, a 20px gold line (`accent.gold`) as wide as the "GIG" portion only — a subtle brand flourish. Used only in the nav. Never repeated.

## 11. What This Version Refuses to Do

- No dark backgrounds
- No decorative illustrations
- No animated gradients
- No music-cliché graphics
- No multiple accent colors
- No emoji
- No motion beyond the card hover border-left

## 12. Required Libraries

```bash
npm install framer-motion
```

No Three.js needed. The single 3D card uses CSS `perspective` + `transform-style: preserve-3d` driven by Framer Motion.

## 13. Implementation Notes

- The right-side mini-directory renders server-side from `musicians ORDER BY updatedAt DESC LIMIT 4`.
- **Profile card 3D tilt:** Use `framer-motion` `useMotionValue` + `useTransform` to track cursor position within each card. Map `mouseX/Y` → `rotateY/X` in the range `[-5deg, 5deg]`. Apply as `motion.div` `style={{ rotateX, rotateY, transformPerspective: 1200 }}`. This replaces the `pointerover` JS approach from the original spec.
- **Breathing float animation:** `motion.div` with `animate={{ y: [0, -6, 0] }}` + `transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}` on the featured card — subtle lift cycle.
- **Stat numbers:** Use Framer Motion's `useInView` to trigger a count-up animation (`motion.span` driving a number interpolation) when the stat row enters the viewport.
- **Card hover border-left:** `motion.div` with `whileHover={{ borderLeftWidth: "3px", borderLeftColor: "#0A66C2", x: 2 }}`.
- Stats: server-side DB counts inlined into HTML. Client-side only handles the count-up animation.
- `prefers-reduced-motion`: guard all `animate` props with `useReducedMotion()` from framer-motion — freeze tilt, float, and count-up.

## 13. Accessibility Notes

- Body contrast: `#191919` on `#FFFFFF` = 18.9:1.
- Blue CTA: `#FFFFFF` on `#0A66C2` = 4.6:1.
- All cards are tab-focusable links with descriptive `aria-label`.
- `prefers-reduced-motion`: nothing to turn off — no motion exists.

## 14. The Test

Show this page to a university music department administrator. If they say "this looks like something we'd link to from our site," the design is doing its job. If they say "looks like a startup," the headline serif weight is probably wrong — increase whitespace and reduce any decorative touches.
