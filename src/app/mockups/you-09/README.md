# Landing Design 09 — **Tape Deck**

> I've designed product identity for two vinyl-first record labels and a cassette reissue series. Analog media has physical personality that digital products spend millions trying to fake. Tape Deck doesn't fake it — it recreates it. The Three.js centerpiece is a fully geometrically-accurate cassette tape: shell with transparent windows, two reels spinning at the correct variable speed as a "track" plays, magnetic tape visible through the housing. The reels are the progress meter. The tape is the product. Framer Motion handles the mechanical button presses and genre tag spring-ins. The page plays.

---

## 1. The Concept

Dark charcoal page — the inside of a studio tape library. A Three.js cassette tape dominates the right side of the hero. It's geometrically precise: housing with transparent window panels, two spools visible through the windows, tape strand connecting them. The left spool is full (the musicians), the right spool is filling up (the connections being made). Click the play button — the reels begin spinning, the tape strand moves, a Framer Motion genre list scrolls into view. The cassette is not metaphor. It's the directory, playing.

## 2. Why This Direction

Cassette tapes are having a cultural renaissance — precisely because digital platforms feel ephemeral. Students who care about music care about the physical format. A geometrically accurate Three.js cassette tells them: GigForge was built by people who understand what you value. The spinning reels as a live progress indicator (left reel = musicians available, depleting; right reel = connections made, filling) is functional AND beautiful. It's the best motion metaphor in this series.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#1E1A14` | Dark charcoal — old cassette case interior |
| `bg.surface` | `#2A2318` | Slightly lighter surface |
| `bg.label` | `#F5EDD8` | Cassette label area — warm cream |
| `shell.dark` | `#0F0C08` | Cassette housing — near-black |
| `shell.medium` | `#1A1510` | Shell side panels |
| `window.tint` | `rgba(120,100,60,0.3)` | Window cutout — smoky amber |
| `reel.hub` | `#2C2418` | Reel center hub |
| `reel.spoke` | `#3A3028` | Reel spokes |
| `tape.strand` | `#2A1E0F` | Magnetic tape |
| `tape.shine` | `rgba(255,200,80,0.08)` | Tape metallic sheen |
| `label.cream` | `#F5EDD8` | Label base |
| `label.red` | `#C8291C` | Label accent stripe |
| `ink.on.label` | `#1A1008` | Text on cream label |
| `ink.primary` | `#F0E8D8` | Page headline text |
| `ink.secondary` | `#A89070` | Body text |
| `ink.muted` | `#6B5A42` | Metadata |
| `accent.yellow` | `#E8C244` | Primary CTA — saturated golden |
| `accent.yellow.dark` | `#C8A030` | CTA hover |
| `accent.orange` | `#E86C20` | Secondary CTA, play button |
| `genre.pill` | `rgba(232,194,68,0.12)` | Genre tag background |
| `genre.text` | `#E8C244` | Genre tag text |

Dark studio warm + cream label + golden CTA. The cassette lives on a warm stage.

## 4. Typography

- **Display:** Inter 800, `clamp(40px, 6vw, 88px)`, tracking `-0.03em`, leading `0.98`, `ink.primary`.
- **Kicker:** `font-mono` 11px uppercase tracking `+0.22em` `accent.yellow`: `PRESS PLAY ON THE PROJECT`.
- **Body:** Inter 400, 16/27, `ink.secondary`.
- **Label title:** Inter 900, 18px, `ink.on.label`, uppercase.
- **Label subtitle:** `font-mono` 10px, `ink.on.label` 70% opacity.
- **Genre pills:** `font-mono` 12px `genre.text`, border `rgba(232,194,68,0.3)`.
- **CTA:** Inter 700 15px uppercase.

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│  GIGFORGE                                      Sign in →    │
│  ──────────────────────────────────────────────────────    │
├─────────────────────────┬──────────────────────────────────┤
│                         │                                    │
│  PRESS PLAY ON          │  [Three.js cassette tape object]  │
│  THE PROJECT            │  — housing, windows, reels, tape  │
│                         │  — reels spin on play             │
│  Match the brief        │  — left reel: musicians (full)    │
│  to the sound.          │  — right reel: gigs (filling)     │
│                         │                                    │
│  Browse student         │  [▶]  [■]  GIGFORGE MIX 01        │
│  musicians. Post        │                                    │
│  creative gigs.         │  STUDENT MUSICIANS                 │  ← label area
│  Email directly.        │  FOR REAL CREATIVE BRIEFS         │
│                         │                                    │
│  [ ▶ POST GIG ]         │  [score] [session] [voice]        │  ← genre pills spring in
│  [ ⏪ BROWSE ]          │  [strings] [beats] [live set]     │
│                         │                                    │
└─────────────────────────┴──────────────────────────────────┘
```

## 6. The Signature: Three.js Precise Cassette

**Housing:**
- Main body: `BoxGeometry(3.6, 2.2, 0.5)` rounded corners via custom BufferGeometry or `RoundedBoxGeometry` from `three-stdlib`. `shell.dark` material, `roughness: 0.35`, `metalness: 0.2`.
- Two window cutouts (front face): Two `BoxGeometry(1.0, 0.8, 0.6)` volumes subtract from the housing by positioning them to overlap and using `transparent` material at the window position. OR: render two `PlaneGeometry` frames around the windows. Simpler: render the windows as `PlaneGeometry(1.0, 0.8)` with `MeshBasicMaterial` `window.tint` at `z = 0.26` — they sit on the face of the housing and provide the tinted-window look without actual CSG.
- Screws: 4 `CylinderGeometry(0.06, 0.06, 0.02)` in the housing corners. `roughness: 0.3, metalness: 0.8` — they catch specular light.
- Bottom slot: `BoxGeometry(1.2, 0.18, 0.6)` cut into the bottom edge (tape head access slot).

**Reels:**
- Each reel: center hub `CylinderGeometry(0.2, 0.2, 0.46)` `reel.hub`. 5 spokes extending outward: `BoxGeometry(0.04, 0.4, 0.44)` in a star pattern, `reel.spoke`. Outer rim: `RingGeometry(0.58, 0.65, 32)` extruded slightly.
- Left reel starts full: tape wrap `CylinderGeometry(0.56, 0.56, 0.44)` `tape.strand`. Right reel starts smaller (connections being made).
- Reels are positioned inside the housing at `[-0.82, 0.22, 0]` and `[0.82, 0.22, 0]`.

**Tape strand:**
- A `CatmullRomCurve3` path connecting left reel bottom → tape head slot → right reel bottom. Generate via `curve.getPoints(32)` → `BufferGeometry` as `TubeGeometry(curve, 32, 0.012, 8)`. Material `tape.strand`.
- Thin highlight tube at `0.013` radius, `tape.shine` material — the metallic sheen on the tape surface.

**Reels spinning:**
- When "play" is active: `leftReel.rotation.z -= dt * leftSpeed` and `rightReel.rotation.z += dt * rightSpeed`.
- Variable speed: as tape transfers, `leftRadius` decreases and `rightRadius` increases. Angular velocity is inversely proportional to current radius (same linear tape speed). `leftSpeed = linearSpeed / leftRadius`.
- The left reel visually shrinks over time: `leftTapeWrap.scale.x = leftRadius / initialRadius`. Right reel grows.

**Lighting:**
- `ambientLight` 0.3 `#FFF4E0`.
- `directionalLight` from `[3, 5, 4]` intensity 0.9 — catches the metallic shell and window.
- `pointLight` from `[0, 0, 2]` intensity 0.4 color `#FFE8A0` — front fill, warm.

`prefers-reduced-motion`: reels frozen, tape strand static.

## 7. Play Button — Framer Motion Mechanical

The `[▶]` play button below the cassette:

```tsx
// Press animation — like a physical button being depressed
whileTap={{ scale: 0.92, boxShadow: "0 0 0 rgba(232,194,68,0)" }}
// Normal state has raised shadow
style={{ boxShadow: "0 4px 0px #A88020" }}
// On press: shadow collapses (button is "down"), reels start spinning
```

`isPlaying` state toggles the reel spin in Three.js via a shared `useRef` flag.

## 8. Genre Tags — Spring Entrance

Six genre pills enter via Framer when play is pressed (or on `useInView`):

```tsx
const pillVariants = {
  hidden: { opacity: 0, scale: 0.6, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 },
};
// staggerChildren: 0.06
// transition: { type: "spring", stiffness: 400, damping: 24 }
```

They bounce in like they were ejected from the cassette. Each pill:
```tsx
whileHover={{ scale: 1.12, backgroundColor: "rgba(232,194,68,0.2)" }}
transition={{ type: "spring", stiffness: 500, damping: 28 }}
```

## 9. CTAs

**Primary** — `▶ Post gig`:
```
bg: #E8C244
text: #1A1008
height: 56px, px: 36px
radius: 4px
font: Inter 700, 15px uppercase
border: 2px solid #1A1008
hover: bg #C8A030, shadow 0 0 28px rgba(232,194,68,0.4)
transition: spring stiffness 300 damping 22
```

**Secondary** — `⏪ Browse`:
```
bg: transparent
border: 2px solid rgba(240,232,216,0.3)
text: #F0E8D8
hover: border rgba(240,232,216,0.7), bg rgba(240,232,216,0.06)
```

## 10. Stats

```
142 musicians      24 open gigs      12 universities
```

Numbers in Inter 800 64px `accent.yellow`. Below each: a cassette "track count" display — `SIDE A / 142 TRACKS` in `font-mono` 10px `ink.muted`. The stat section looks like a cassette insert.

## 11. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei three-stdlib
```

## 12. Implementation Notes

- `CassetteObject.tsx` — Three.js, `dynamic(..., { ssr: false })`. Canvas: `500px × 380px` on desktop.
- `RoundedBoxGeometry` from `three-stdlib`: `import { RoundedBoxGeometry } from 'three-stdlib'`. Radius parameter: `0.08` for the housing corners.
- Reel rotation: store in `useRef` (not state) and update in `useFrame` for 60fps smoothness. `leftReel.current.rotation.z -= delta * (linearSpeed / leftRadius.current)`.
- Tape strand `CatmullRomCurve3`: define 5 control points: left reel bottom, mid-left, bottom-center (tape head), mid-right, right reel bottom. Regenerate curve in `useFrame` only when `leftRadius` changes significantly (debounce by >0.01 delta to avoid per-frame regeneration).
- Window transparency: `PlaneGeometry` window overlays must render AFTER the housing. Use `renderOrder: 1` on window planes and `renderOrder: 0` on housing.
- Screws: 4 `CylinderGeometry` meshes with `rotation.x = -Math.PI/2` to lie flat on the housing face.

## 13. The Test

Press the play button. Watch the reels for 10 seconds. The left reel should visibly shrink and the right reel visibly grow. If the change is not perceptible in 10 seconds, increase the transfer speed by 3×. The genre pills should spring in within 0.4 seconds of pressing play — if they lag, move the `isPlaying` state update to a `useLayoutEffect` so the Framer animation triggers in the same paint as the button press.
