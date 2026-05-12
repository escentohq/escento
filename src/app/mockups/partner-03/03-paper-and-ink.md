# Landing Design 03 — **Paper & Ink**

> I'm an editorial product designer who spent five years at a music magazine and three at a university press. The best campus tools feel like publications — considered, curated, printed with intention. This version makes the page feel like a living broadsheet: warm paper, editorial serif, and one trick that no competitor will copy — a Three.js ink-particle system that makes the background feel physically textured, like the paper has grain. Framer Motion handles everything that moves in the DOM. Together they make a landing page that feels hand-made at scale.

---

## 1. The Concept

Warm off-white "paper" page. A Three.js ink-particle field drifts slowly across the hero — not tech-particles, but tiny ink droplets suspended in paper fiber, organic and still. Over it: one massive editorial serif headline where a single word rotates through every instrument currently in the directory. The word swap uses a Framer Motion 3D flip — the word tumbles on the Y axis like a page turning. The page feels printed and alive simultaneously.

## 2. Why This Direction

Most landing pages compete on technical novelty. Paper & Ink competes on warmth. But warmth without craft is just beige. The ink-particle field gives the page physical texture — something you don't see on any SaaS or music platform. The rotating 3D-flip word is the moment of delight. Together they say: *this directory was made by people who care about craft, for people who care about craft.* That's the GigForge promise.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#F5F1E8` | Warm paper white — FM radio on a summer afternoon |
| `bg.surface` | `#FFFFFF` | Cards (inset on paper) |
| `border.rule` | `#1A1A1A` | 1px and 2px editorial rules |
| `ink.primary` | `#0E0E10` | Body, headlines |
| `ink.secondary` | `#4A4A4F` | Subheads, captions |
| `ink.muted` | `#8A8682` | Metadata |
| `particle.ink` | `#2C2826` | Ink droplets — warm dark brown, not cold black |
| `particle.fade` | `rgba(44,40,38,0.06)` | Particle at-rest opacity |
| `accent.red` | `#C2452F` | Rotating word, links, OPEN dot, the ONE color |
| `accent.red.wash` | `#F4DDD6` | Filter pill background (active) |

Paper + ink + one editorial red. Every other page on the internet has more colors.

## 4. Typography

- **Display:** Playfair Display 700 Italic, `clamp(56px, 7.5vw, 108px)`, leading `0.96`, tracking `-0.015em`. Loaded via Google Fonts or `@fontsource/playfair-display`.
- **Rotating word:** Same Playfair, Italic 700, in `accent.red`. This word is the headline's personality — it must render in the true italic, never faux-oblique.
- **Body:** Inter 400, 17/1.58. `ink.primary`.
- **Eyebrow:** Inter 500 12px small-caps, tracking `+0.12em`, `ink.muted`: `ISSUE №24 · WEEK OF MAY 11`.

```bash
npm install @fontsource/playfair-display framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```
┌─────────────────────────────────────────────────────────────┐
│  GIGFORGE                                  Sign in / Post →  │  ← thin nav
│  ──────────────────────────────────────────────────────────  │  ← 2px rule
│                                                               │
│  [[[[ ink particles drift slowly — Three.js, full-width ]]]] │  ← subtle, behind
│                                                               │
│      ISSUE №24 · WEEK OF MAY 11                              │  ← eyebrow small-caps
│                                                               │
│      Find the right                                           │
│      student [guitarist] ← 3D flip on Y-axis, red, italic   │
│      for your next project.                                   │
│                                                               │
│      A directory of student musicians across 12 universities. │
│      No feed. No DMs. Email them directly.                    │
│                                                               │
│      [ Browse the directory ]   Post a gig →                  │
│                                                               │
│  ──────────────────────────────────────────────────────────  │  ← 1px rule
│                                                               │
│  THIS WEEK ON GIGFORGE                                        │  ← section header
│                                                               │
│  [ card ]  [ card ]  [ card ]                                 │  ← 3 editorial cards
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

Max width 1080px. Generous left margin on desktop (8% optical inset). Vertically generous — the whitespace is load-bearing.

## 6. The Signature: Three.js Ink Particle Field

**NOT a tech particle system.** Each particle is an irregular ink droplet shape — not a perfect sphere. Implementation:

- 300 particles via `THREE.InstancedMesh` using a `THREE.CircleGeometry(1, 6)` — hexagonal, slightly organic
- Scale varies: `0.6px to 2.2px` randomized per instance, seeded deterministically
- Opacity: `0.04 to 0.14` — the field should read as texture, not objects
- Color: `#2C2826` — warm brown-black ink. NOT gray.
- Motion: each droplet drifts on a slow Lissajous path. Per-particle `(ax, ay, phaseX, phaseY, speed)` seeds. Speed: `0.008 to 0.022` cycles/sec — imperceptible if you stare at one, beautiful when you glance
- Camera: orthographic, fixed. Particles feel 2D — like they're ON the paper, not floating in front

**Mouse influence:** On `pointermove`, a soft repulsion field pushes nearby particles away from the cursor — as if your hand is disturbing the paper surface. Influence radius: `80px`, force: `0.0008` per frame. Particles return to their Lissajous paths when the cursor leaves.

**Canvas styling:**
```
position: absolute
inset: 0
pointer-events: none
z-index: 0
mix-blend-mode: multiply
```

`mix-blend-mode: multiply` makes the particles blend INTO the warm paper — they darken the paper color rather than floating on top of it. This is what makes it feel physical.

`prefers-reduced-motion`: all particles frozen. Mouse repulsion off.

## 7. The Rotating Word — Framer Motion 3D Flip

The key interaction: the italic red word in the headline rotates through instrument names every 2.8 seconds.

**Instruments rotate through real DB data:** top 8 by musician count, server-rendered as a JSON `<script>` island.

**The flip animation:**
```tsx
// Exit: current word flips back on Y axis, shrinks
exit={{ rotateY: -90, opacity: 0, scale: 0.9 }}

// Enter: new word flips in from +90
initial={{ rotateY: 90, opacity: 0, scale: 0.9 }}
animate={{ rotateY: 0, opacity: 1, scale: 1 }}

// transition: spring stiffness 200, damping 18
// transformPerspective: 800px on parent
```

The word tumbles like a page being turned. The red + italic + spring physics = the personality of the page in one moment.

`prefers-reduced-motion`: word crossfades (opacity only), no rotation.

## 8. The Three Featured Cards

Real entries from the directory, rendered like magazine clippings:

```
──────────────────────────────────
GIG · FILM
Composer for a 10-minute thesis short
Searching for a composer fluent in synth + strings.
UT Austin · Paid · Deadline Jun 12
                                                 →
```

- Top rule: 2px `accent.red`
- Category label: Inter 500 11px small-caps `ink.muted`
- Headline: Playfair Display 600 22px `ink.primary`
- Body: Inter 400 14px `ink.secondary`

**Framer scroll entrance:**
```tsx
const cardVariants = {
  hidden: { opacity: 0, y: 28, rotate: -0.8 },
  visible: { opacity: 1, y: 0, rotate: 0 },
};
// staggerChildren: 0.1
// transition: { type: "spring", stiffness: 160, damping: 20 }
```

Cards enter from below with a tiny rotation — like they were just laid on the table. Hover: `translateY(-2px)`, border darkens to 40% `border.rule`. The hover is editorial, not SaaS.

## 9. CTAs

**Primary** — `Browse the directory`:
```
bg: #0E0E10
text: #F5F1E8
height: 52px, px: 28px
radius: 2px  ← almost square. Editorial NOT a SaaS pill.
font: Inter 500, 15px
hover: bg #C2452F (ink-to-red swap — the brand moment)
transition: 240ms
```

**Secondary** — `Post a gig →`:
```
No button. Text in #C2452F, 1px underline.
Arrow advances 4px on hover via Framer whileHover.
```

## 10. How It Works — Three Editorial Paragraphs

No icons. No numbered feature grid. Three paragraphs with drop-cap initials in `accent.red`:

```
B  rowse the directory. No account required. The full list of student musicians 
   is public — filter by instrument, campus, availability.

F  ind who you need. Their email is right there on their profile. No platform
   messaging. No connection requests. Direct contact.

H  ire them, or don't. That's the whole product. A directory. Simple by design.
```

Drop caps: `float: left`, Playfair Display 700, 52px, `accent.red`. This section is the most readable text on the page.

## 11. Stats — Ink-Stamp Numbers

```
142 musicians      24 open gigs      12 universities
```

Numbers in Playfair Display 700 64px `ink.primary`. Labels in Inter 12px uppercase `ink.muted`. Framer `animate()` counts up on `useInView`, 1.2s `ease: "easeOut"`. These feel like print statistics — authoritative, not animated-for-engagement.

## 12. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei @fontsource/playfair-display
```

## 13. Implementation Notes

- `InkField.tsx` — separate Three.js component, always `dynamic(..., { ssr: false })`. Canvas positioned absolute behind hero content.
- `RotatingWord.tsx` — client component. Reads instrument array from a `data-instruments` attribute on the parent div (server-rendered). Uses `AnimatePresence mode="wait"` for the flip.
- `mix-blend-mode: multiply` on the canvas requires `background: transparent` on the canvas element and `gl={{ alpha: true }}` on `<Canvas>`.
- The ink particle field should be invisible when the page loads — opacity animates from 0 over 1.5s to avoid a flash of particles.
- On mobile: particle count drops to 120 via `window.devicePixelRatio > 1` check. Rotating word becomes a slower 4s interval.

## 14. The Test

Print the landing page on A4 paper (Cmd+P → Save as PDF → print). If it looks like a real magazine cover, you nailed it. If the serif feels too heavy or the red too harsh, increase letter-spacing on the headline by 0.005em and push `accent.red` to `#B83D28`. The ink particles should not be visible in the printout — if they are, opacity is too high.
