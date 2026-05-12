# Landing Design 04 — **Poster Wall**

> I've art-directed physical installations for campus music festivals and DIY show spaces. Every good show starts with a good flyer. Poster Wall makes the landing page feel like a real corkboard — not as a metaphor, but as a Three.js scene: an actual 3D cork surface with real depth and texture, gig cards physically pinned to it with push-pin meshes, casting soft shadows. Framer Motion handles the card flutter and entrance. The page is kinetic, chaotic in a controlled way, and completely original. Nobody else is doing this.

---

## 1. The Concept

Warm parchment page. A Three.js corkboard fills the hero — a textured brown cork plane with real 3D depth, edge frame in dark wood, and six gig cards pinned to it at slightly different angles. Each card is a physical mesh with a push-pin at the top and a realistic drop shadow on the cork. The whole board tilts slightly with cursor parallax. Click a card — it animates off the board and expands into a readable gig detail overlay. Below the board: a bold poster-style headline, color-block CTAs, and a three-column pitch section. The page is a venue. The cards are the programming.

## 2. Why This Direction

Every campus music discovery happens on physical boards — the music department hallway, the student union, the practice room door. Poster Wall is that experience, made interactive and legible. The Three.js corkboard is not illustrative — it's functional. It shows real gig listings. The push-pins are real geometry with real shadows. When a card flutters on hover, it has the weight of paper. GigForge is not abstract. It lives on campuses, in hallways, on real boards. This page makes that literal and beautiful.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#F6F0E2` | Warm parchment |
| `cork.surface` | `#C8914A` | Cork board base color |
| `cork.grain` | `#B87D3C` | Cork grain texture (via vertex noise) |
| `cork.frame` | `#3D2810` | Dark wood frame bordering the board |
| `pin.red` | `#D63B2F` | Classic red push-pin dome |
| `pin.shaft` | `#8A7060` | Metal pin shaft |
| `card.white` | `#FEFCF5` | Lined white card |
| `card.green` | `#D4EDD0` | Light green card variant |
| `card.yellow` | `#FEF3B4` | Yellow card variant |
| `card.blue` | `#D0E8F0` | Blue card variant |
| `shadow.cork` | `rgba(40,20,5,0.25)` | Card shadow on cork |
| `ink.primary` | `#1A1410` | All text |
| `ink.secondary` | `#5A4A38` | Card body text |
| `ink.muted` | `#8A7A68` | Card labels |
| `accent.orange` | `#E85C20` | Primary CTA fill — gig energy |
| `accent.blue` | `#1A6CB8` | Secondary CTA — cool contrast |
| `border.card` | `#1A1410` | Hard card edges (thick) |

Cork + paper + pushpin hardware palette. Nothing digital about it.

## 4. Typography

- **Display:** Inter 900, `clamp(52px, 7.5vw, 112px)`, tracking `-0.03em`, all-caps. Below it one italic line Inter 700 Italic at 55% scale.
- **Kicker:** Inter 700 11px `font-mono` uppercase tracking `+0.2em` in `ink.muted`: `GIGFORGE CAMPUS BOARD · SPRING '26`.
- **Card headline:** Inter 800 16px uppercase `ink.primary`.
- **Card label:** `font-mono` 10px uppercase `ink.muted`: `OPEN GIG 01`.
- **Body:** Inter 400 16/27 `ink.secondary`.
- **CTA:** Inter 800 15px uppercase.

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│  GIGFORGE                              Sign in              │  ← nav
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ████████████ CORK BOARD — Three.js ████████████████  │  │
│  │  ██  6 gig cards pinned, real shadows, push-pins  ██  │  │
│  │  ████████████████████████████████████████████████████  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  PROJECTS NEED SOUND.                                        │  ← 112px Inter 900
│  STUDENTS NEED GIGS.                                         │
│                                                              │
│  [ POST THE GIG ]    [ FIND TALENT ]                         │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

The corkboard is the primary hero element — it runs above the text headline. Mobile: board drops to 60vw centered, headline full-width below.

## 6. The Signature: Three.js 3D Corkboard

**Cork surface:**
- `PlaneGeometry(14, 8, 32, 18)` — the board. High vertex count for vertex-displacement noise.
- Vertex shader: apply `cnoise(position.xy * 2.2) * 0.04` to Z — subtle surface bump that catches light.
- Material: `MeshStandardMaterial` `cork.surface`, `roughness: 0.95`, `metalness: 0.0`. No texture map needed — the vertex noise + roughness reads as cork.
- Frame: four `BoxGeometry(14.6, 0.4, 0.2)` top/bottom + `BoxGeometry(0.4, 8.8, 0.2)` left/right planks. Material `cork.frame`, `roughness: 0.7`, `metalness: 0.2`.

**Gig cards (6):**
- Each card: `BoxGeometry(2.2, 2.8, 0.04)` extruded card. Positioned at `[x, y, 0.12]` (floating just above the cork surface).
- `MeshStandardMaterial` with alternating colors: white, green, yellow, blue, white, green.
- Slight rotations per card: `[-0.08, 0.05, -0.12, 0.07, -0.04, 0.09]` — all slightly askew.
- `castShadow: true` — cards cast soft shadows on the cork below.
- `<Html>` overlay on each card face: the gig content (label + title + campus + pay status).

**Push-pins:**
- Above each card: `SphereGeometry(0.1, 8, 6)` dome (the pin head), `pin.red`. Positioned at `[card.x, card.y + card.height/2 - 0.1, 0.2]`.
- `CylinderGeometry(0.015, 0.015, 0.18)` shaft below the dome into the cork. Material `pin.shaft`.
- Pins cast tiny shadows too — the detail sells the physicality.

**Cursor parallax:**
- The entire board `<group>` tilts in response to cursor: `rotateY` ±5deg, `rotateX` ±3deg, lerped at `0.05`.
- Camera stays fixed — the board itself turns, like a canvas on an easel.

**Card hover (Three.js + Framer):**
- On `pointerover` a card: the card `position.z` lerps from `0.12` → `0.22` (lifts off board) and `rotation` lerps toward 0 (straightens). The push-pin drops back as if the card was unpinned.
- Framer Motion `AnimatePresence` handles the expanded detail overlay that appears when a card is clicked.

**Expanded card overlay:**
```tsx
// motion.div with layoutId matching the card id
// initial: { opacity: 0, scale: 0.9 }
// animate: { opacity: 1, scale: 1 }
// exit: { opacity: 0, scale: 0.9 }
// transition: { type: "spring", stiffness: 260, damping: 22 }
```

`prefers-reduced-motion`: board static, no parallax, no card lift, no expansion animation.

## 7. CTAs

**Primary** — `Post the gig`:
```
bg: #E85C20
text: #F6F0E2
height: 60px, px: 36px
radius: 0px (poster button — rectangular)
font: Inter 800, 16px uppercase tracking +0.04em
border: 3px solid #1A1410
shadow: 5px 5px 0px #1A1410 (hard offset — poster aesthetic)
hover: shadow 3px 3px 0px #1A1410, translateX(2px) translateY(2px)
transition: 120ms
```

The shadow "presses in" on hover — the button is a physical stamp.

**Secondary** — `Find talent`:
```
bg: #1A6CB8
text: #F6F0E2
same treatment — different color block
hover: shadow 3px 3px 0px #1A1410
```

## 8. Pitch Section

Three columns with thick 4px top borders in `accent.orange`, `accent.blue`, `ink.primary`:

```
01 / For creators           02 / For musicians         03 / For the scene
Post a brief. List what    Build a profile. List       Every campus music
you need, by when, what    your instruments, your      department deserves
you'll pay. Profiles       availability, your          a real board. This
reach out.                 portfolio link.             is it.
```

Framer entrance stagger: `initial={{ opacity: 0, y: 28, rotate: -0.5 }}` → `visible: { rotate: 0 }`.

## 9. Stats

```
142 musicians      24 open gigs      12 universities
```

Numbers in Inter 900 72px `ink.primary`. Framer count-up on `useInView`, 1.2s. Below each: one of the card colors as a background swatch behind the number — cork board energy.

## 10. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 11. Implementation Notes

- `CorkBoard.tsx` — Three.js, `dynamic(..., { ssr: false })`. Canvas height: `55vh` min `400px`.
- The cork vertex noise requires a GLSL simplex noise function in the vertex shader. Use `glsl-noise` npm package or inline a 60-line simplex implementation.
- Card shadows: Three.js `PCFSoftShadowMap` renderer. `<Canvas shadows="soft">` shorthand.
- `<Html>` card content uses `transform={false}` — it stays flat on the screen even as the board tilts. This is correct behavior: the card geometry tilts, but the text renders pixel-perfect.
- Expanded overlay: `position: fixed, inset: 0` backdrop `rgba(26,20,16,0.6)` behind the expanded card `motion.div`. The `layoutId` shared-element transition handles the card morphing from board to overlay.
- Mobile: canvas height 60vw, board `scaleFactor: 0.65`, push-pin radius reduced to `0.07`.

## 12. The Test

Hover over a pinned card slowly. The card should lift off the cork and straighten, as if you're reaching toward it. If it stutters or pops instead of flowing, the lerp factor needs to go from `0.05` to `0.08`. Then click the card. The expansion should feel like pulling a card off a board — not like a modal opening. If it feels modal-like, reduce the `scale` in the initial state from `0.9` to `0.97` and increase spring stiffness to `320`.
