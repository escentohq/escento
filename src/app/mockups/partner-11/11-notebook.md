# Landing Design 11 — **Profile Portfolio**

> I'm a senior product designer who's built onboarding experiences for professional networks and two creator-economy tools. Students trust things that feel personal and considered — but "personal" doesn't mean scrappy. This version treats GigForge's landing like a well-designed professional portfolio: clean white pages, structured layout, real people front and center. LinkedIn's clarity meets a music student's sensibility.

---

## 1. The Concept

A clean white page that feels like a curated professional portfolio. The hero introduces GigForge with a confident two-column layout: left is the pitch, right is a real musician's profile card elevated as a featured showcase. Below: a grid of profile cards in light blue-tinted panels — the kind you'd see in a LinkedIn "recommended connections" section. The page is professional, welcoming, and immediately legible as a network for creative collaboration.

## 2. Why This Direction

Students respond to products that reflect how they see themselves: serious about their craft, professional in their ambitions, but not corporate. Profile Portfolio threads the needle — it has the structural confidence of LinkedIn with the warmth of something built for creators, not executives. It makes a music student feel seen without talking down to them.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#FFFFFF` | Clean white base |
| `bg.section` | `#F3F2EF` | Alternating section background |
| `bg.card` | `#FFFFFF` | Profile cards |
| `bg.featured` | `#EEF3FB` | Featured card background — subtle blue tint |
| `bg.pill` | `#EEF3FB` | Skill tag background |
| `border.card` | `rgba(0,0,0,0.08)` | Card edges |
| `border.divider` | `rgba(0,0,0,0.12)` | Section separators |
| `border.featured` | `rgba(10,102,194,0.20)` | Featured card border accent |
| `ink.primary` | `#191919` | All primary text |
| `ink.secondary` | `#555555` | Subheads, card metadata |
| `ink.muted` | `#888888` | Timestamps, labels |
| `accent.blue` | `#0A66C2` | CTA, links, tags, featured badge |
| `accent.green` | `#057642` | Availability dot only |

A 13-token palette anchored in white and professional blue.

## 4. Typography

- **Display headline:** Inter 700, `clamp(40px, 5.5vw, 72px)`, tracking `-0.025em`, leading `1.05`.
- **Body:** Inter 400, 16/26.
- **Label:** Inter 500, 12px uppercase tracking `+0.1em`, `ink.muted`.
- **Featured card name:** Inter 700, 26px.
- **Grid card name:** Inter 600, 18px.

Clean Inter throughout. Professional, readable, no decorative mixing.

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│  GIGFORGE                                      Sign in →    │
│  ──────────────────────────────────────────────────────    │  ← 1px border.divider
├──────────────────────────┬─────────────────────────────────┤
│                          │  ┌──────────────────────────┐   │
│  The professional        │  │ FEATURED MUSICIAN        │   │  ← accent.blue label
│  network for             │  │                            │   │
│  student musicians.      │  │  Maya Chen               │   │
│                          │  │  Guitar · Vocals           │   │
│  Browse profiles.        │  │  UT Austin · Music '25    │   │
│  Post a gig.             │  │  ● Open to collaborate    │   │
│  Email directly.         │  │                            │   │
│  No middleman.           │  │  "Indie, folk, film.      │   │
│                          │  │   Evenings free."         │   │
│  [ Browse musicians ]    │  │                            │   │
│  [ Post a gig ]          │  │  [guitar] [vocals] [indie]│   │
│                          │  │  hello@maya.example →     │   │
│  142 musicians           │  └──────────────────────────┘   │
│  24 open gigs            │                                   │
└──────────────────────────┴─────────────────────────────────┘
```

Left/right split, 45/55. Featured card on `bg.featured` with `border.featured`.

## 6. The Featured Card

The right-side featured card is the production `MusicianCard` component in a slightly elevated context:

- Background `bg.featured`, border `border.featured`, `border-radius: 12px`.
- `FEATURED MUSICIAN` label in `accent.blue` Inter 600 11px uppercase at top.
- Availability dot in `accent.green` with a CSS pulse animation (2s ease infinite, `box-shadow` ring expanding + fading). Stops on `prefers-reduced-motion`.
- Skill chips in `bg.pill` / `accent.blue` text — identical to the detail page.
- `mailto:` link styled as a secondary CTA: `border 1.5px accent.blue`, `border-radius: 24px`, `padding: 8px 20px`.

The card updates on each page load to the most recently active available musician.

## 7. The Profile Grid

Below the hero on `bg.section`, a grid of 6 profile cards (3 columns × 2 rows on desktop, 1 column on mobile):

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  ● Jordan L. │  │  ● Sam P.    │  │  ● Priya K.  │
│  Cello · USC │  │  Piano · Berk│  │  Violin · UCLA│
│  Classical   │  │  Jazz, Prod. │  │  Orchestral  │
│  →           │  │  →           │  │  →           │
└──────────────┘  └──────────────┘  └──────────────┘
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  + 136 more musicians in the directory     →       │
└──────────────────────────────────────────────────┘
```

Cards: white, `border-radius: 8px`, `border.card` shadow. On hover: `border-left: 3px solid accent.blue`, card lifts slightly (`translateY(-2px)`), shadow deepens. 200ms ease.

Last cell spans full width: "Join 142 musicians on GigForge →" in Inter 500 `accent.blue`.

## 8. Open Gigs Strip

Below the grid, a full-width `bg.page` section:

```
OPEN GIGS  ←  mono label + 1px border.divider

┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  COMPOSER            │  │  GUITARIST            │  │  VOCALIST            │
│  Thesis Short Film   │  │  Indie EP Recording   │  │  Podcast Intro Theme │
│  UT Austin · PAID    │  │  Remote · UNPAID      │  │  Remote · NEGOTIABLE │
│  Deadline: Jun 1     │  │  Flexible             │  │  ASAP                │
│  Apply via email →   │  │  Apply via email →    │  │  Apply via email →   │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

White cards, `border-radius: 8px`, `border.card` shadow. Role type in Inter 600 `accent.blue`. Real data.

## 9. CTAs

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

## 10. How It Works

Three rows on `bg.section`:

```
01  Browse the directory.         No account. Fully open to anyone.
02  Find who you need.            Filter by instrument, genre, or school.
03  Email them directly.          No DMs. No platform. Their email is right there.
```

`accent.blue` numbers. Inter 400 body. 1px `border.divider` rows.

## 11. Footer

Minimal: wordmark left, `About · Privacy · Post a gig` right. 1px `border.divider` top. `ink.muted` text.

## 12. What This Version Refuses to Do

- No dark backgrounds
- No hand-drawn or decorative elements
- No animated gradients
- No multiple accent colors
- No hero illustrations
- No emoji
- No motion beyond availability dot pulse and card hover lift

## 13. Required Libraries

```bash
npm install framer-motion
```

No Three.js — the design's warmth comes from layout and color, not 3D effects.

## 14. Implementation Notes

- Featured card: same `MusicianCard` component as `/musicians/[id]`. No landing-specific markup.
- Grid cards: same lighter `MusicianCardCompact` component used in search results.
- **Grid entrance stagger:** Wrap the 6-card grid in a Framer Motion `motion.div` container with `variants={{ visible: { transition: { staggerChildren: 0.07 } } }}`. Each card is a `motion.div` with `variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}`. Triggered by `useInView` when the grid enters the viewport.
- **Card hover lift:** `motion.div` with `whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}` + `transition={{ type: "spring", stiffness: 300, damping: 20 }}`. The spring physics give the card a professional, weighty lift.
- **Featured card left border reveal:** `motion.div` with `initial={{ scaleX: 0 }}` → `animate={{ scaleX: 1 }}` on `useInView`, `transformOrigin: "left"` — the blue accent border draws in as the card enters view.
- **Hero headline entrance:** `motion.h1` with `initial={{ opacity: 0, y: 12 }}` → `animate={{ opacity: 1, y: 0 }}` + `transition={{ delay: 0.1, duration: 0.5 }}`.
- **Availability pulse:** Pure CSS `@keyframes` box-shadow ring — Framer not needed; CSS handles it lighter.
- Profile grid: server-side rendered from `musicians ORDER BY updatedAt DESC LIMIT 5`.
- `prefers-reduced-motion`: `useReducedMotion()` from framer-motion — all `initial` states jump to final state, stagger collapsed to 0.

## 14. Accessibility

- All profile cards are tab-focusable links with `aria-label="View Maya Chen's profile"`.
- Availability pulse stops on `prefers-reduced-motion: reduce`.
- All contrast ratios WCAG AA or better.
- Featured card email link has `aria-label="Email Maya Chen"`.

## 15. The Test

Show this page to a music student and a film student simultaneously. The music student should immediately want to check if their profile looks this good. The film student should immediately want to contact someone. If both reactions happen within the first 10 seconds, the design is working. If either has to read to understand what the page is — the featured card isn't prominent enough.
