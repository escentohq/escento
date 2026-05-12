# Landing Design 06 — **Open to Work**

> I'm a senior product designer who's shipped onboarding flows for two professional networks and a job board. The best landing pages for directory products show the visitor they're already in the right place in the first five seconds. This version borrows LinkedIn's most trusted signal — the "Open to Work" frame — and makes it the entire visual language of the hero.

---

## 1. The Concept

A clean, white, professionally structured page centered on one idea: the musicians here are open, available, and ready to collaborate. The hero is split: left side is a two-line headline and CTAs; right side is a tall profile card with an "Open to Work" banner across the top — a real musician, real availability, real email. The design communicates "professional network" without a single word of marketing copy explaining what it is.

## 2. Why This Direction

LinkedIn's "Open to Work" frame is one of the most recognized professional trust signals that exists. Students know it. Employers know it. By borrowing it (adapted for music), GigForge immediately reads as a legitimate professional network for this niche — not another side-project directory.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#FFFFFF` | Pure white page |
| `bg.section` | `#F3F2EF` | Alternating section background |
| `bg.card` | `#FFFFFF` | Profile cards |
| `bg.otw` | `#057642` | "Open to Work" banner — LinkedIn's exact green |
| `bg.pill` | `#EEF3FB` | Skill tag background |
| `border.card` | `rgba(0,0,0,0.08)` | Card shadows/edges |
| `border.divider` | `rgba(0,0,0,0.12)` | Hairline section rules |
| `ink.primary` | `#191919` | All primary text |
| `ink.secondary` | `#555555` | Body, subheads |
| `ink.muted` | `#888888` | Metadata |
| `accent.blue` | `#0A66C2` | CTAs, links, skill tag text |

## 4. Typography

- **Display:** Inter 700, `clamp(40px, 5.5vw, 72px)`, tracking `-0.025em`, leading `1.05`.
- **Body:** Inter 400, 16/26.
- **Label:** Inter 500 12px uppercase tracking `+0.08em` in `ink.muted`.
- **Card name:** Inter 700, 24px.
- **Banner text:** Inter 700, 13px, white, uppercase tracking `+0.06em`.

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│  GIGFORGE                                      Sign in →    │
│  ──────────────────────────────────────────────────────    │  ← 1px divider
├───────────────────────────┬────────────────────────────────┤
│                           │                                  │
│  The professional         │  ┌──────────────────────────┐  │
│  network for              │  │ ▓▓ OPEN TO COLLABORATE ▓▓ │  │  ← green OTW banner
│  student musicians.       │  │                            │  │
│                           │  │  Maya Chen                │  │
│  Find a guitarist for     │  │  Guitar · Vocals           │  │
│  your film. Post a gig    │  │  UT Austin · Music '25    │  │
│  for a film composer.     │  │                            │  │
│  Direct email contact.    │  │  "Indie, folk, and        │  │
│                           │  │   film scoring.            │  │
│  [ Browse musicians ]     │  │   Evenings free."         │  │
│  [ Post a gig ]           │  │                            │  │
│                           │  │  [guitar] [vocals] [folk] │  │
│                           │  │  ──────────────────────── │  │
│                           │  │  hello@maya.example    →  │  │
│                           │  └──────────────────────────┘  │
│                           │                                  │
│                           │  142 musicians currently open   │  ← live count
└───────────────────────────┴────────────────────────────────┘
```

Desktop: 50/50 split. Mobile: stacked, card above CTAs.

## 6. The Signature: Open to Collaborate Banner

The banner across the top of the profile card is a direct riff on LinkedIn's "Open to Work" ring and banner. Here it reads `OPEN TO COLLABORATE` in white Inter 700 on the `bg.otw` green.

The card below it renders identically to the production musician detail page. No special landing-only components — it's the same card component used everywhere in the app, pulled into this context. Implementation efficiency and visual consistency.

The live count below the card (`142 musicians currently open`) pulls from a real DB query and updates on each page load. This is the trust signal that makes the banner credible.

## 7. The "Recently Active" Strip

Directly below the hero fold, a horizontal strip on `bg.section`:

```
RECENTLY ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Jordan L.  ·  Cello · Classical         joined 2 days ago   →
Sam P.     ·  Piano · Producer          updated profile     →
Priya K.   ·  Violin · Orchestral       posted availability →
```

Each row is a real musician. "Joined 2 days ago" etc. are derived from `createdAt`/`updatedAt`. Rows separated by 1px `border.divider`. On hover: row background shifts to `bg.pill`, arrow nudges right.

This is LinkedIn's "People you may know" adapted for GigForge.

## 8. CTAs

**Primary** — `Browse musicians`:
```
bg: #0A66C2
text: #FFFFFF
height: 48px, px: 24px
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

## 9. How It Works

Three short items on `bg.section`:

```
01  Browse the directory     No account required. It's open.
02  Email directly           No DMs. No platform. Just email.
03  That's the product.      Simple by design, not by accident.
```

Numbers in `accent.blue` 600 weight. The third line is deadpan on purpose — it communicates confidence.

## 10. Open Gigs Strip

Below How It Works, three gig cards side by side on white:

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ COMPOSER         │  │ GUITARIST        │  │ VOCALIST         │
│ Thesis Short     │  │ Indie EP         │  │ Podcast Intro    │
│ UT Austin · PAID │  │ Remote · UNPAID  │  │ Remote · NEGOTIA │
│ Deadline: Jun 1  │  │ Flexible         │  │ ASAP             │
│ Apply via email→ │  │ Apply via email→ │  │ Apply via email→ │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

Cards: white, `border-radius: 8px`, `border.card` shadow. Type badge at top (COMPOSER, GUITARIST, etc.) in `accent.blue` on `bg.pill`. All real data.

## 11. What This Version Refuses to Do

- No dark backgrounds
- No abstract illustrations
- No music-cliché iconography (treble clefs, vinyl records, headphones)
- No multiple accent colors
- No dense copy blocks

The "Open to Collaborate" banner is the only metaphor. One signal, used once, credibly.

## 12. Required Libraries

```bash
npm install framer-motion
```

## 13. Implementation Notes

- Hero card is the same server-rendered `MusicianCard` component used on `/musicians/[id]`. Zero new components.
- The green `bg.otw` banner wraps as a `motion.div` above the card with `border-radius: 8px 8px 0 0`.
- **Scroll reveals:** Use Framer Motion `useInView` + `motion.div` with `initial={{ opacity: 0, y: 20 }}` and `animate={{ opacity: 1, y: 0 }}` on the "Recently Active" strip and gig cards as they enter the viewport.
- **Row hover:** `motion.div` with `whileHover={{ x: 4, backgroundColor: "var(--bg-pill)" }}` on each recently active row — the arrow nudge comes free.
- **Hero card entrance:** `motion.div` with `initial={{ opacity: 0, scale: 0.97 }}` + `animate={{ opacity: 1, scale: 1 }}` on page mount, `transition={{ duration: 0.4, ease: "easeOut" }}`.
- Recently active strip uses `musicians ORDER BY updatedAt DESC LIMIT 3`.
- `prefers-reduced-motion`: Framer Motion respects this automatically via `useReducedMotion()` — wrap the entrance animation in a check.

## 13. The Test

Show this to someone who uses LinkedIn daily. Within 10 seconds, ask them what the site does. If they say "it's a professional directory for musicians," you nailed it. If they need to read the headline to understand, the card isn't prominent enough — enlarge it.
