# Landing Design 11 — **Black Box**

> I've designed for two black box theaters and one international touring production. The black box is the most powerful performance space ever invented — no fixed seating, no fixed stage, infinite configuration, total focus on the work. Black Box takes that as literal design brief. The Three.js piece is a three-dimensional concert hall interior: rows of seats receding into darkness, a single pool of stage light at the vanishing point, and one performer silhouette appearing when the page loads. Framer Motion handles the curtain-rise text reveal. The page is a venue. GigForge is the company that fills it.

---

## 1. The Concept

Pure black page. The entire hero is a Three.js concert hall interior — rows of seats rendered in perspective, receding into depth, a single warm spotlight on a stage at the far end. The stage is the focal point of the page. Framer Motion brings the headline in like a curtain rising: text emerges from below the viewport fold, letter by letter, word by word. A single acid-green CTA is the only color on an otherwise monochrome page. Below the hall: three process rows that read like a stage program. The page earns its restraint through the Three.js scene's sheer spatial presence.

## 2. Why This Direction

The black box theater is where student musicians perform their first serious work — senior recitals, thesis shows, composition showcases. It carries weight. Making the landing page a black box says: "the musicians on this platform take their work seriously enough to perform it on a stage." The 3D concert hall is not decoration — it is architecture that frames the promise. GigForge puts the right musician on the right stage. This page IS that stage.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#000000` | Pure black |
| `bg.panel` | `#050508` | Slightly lighter for panels |
| `hall.seat.near` | `#1A1A22` | Nearest seat row — visible detail |
| `hall.seat.mid` | `#111118` | Mid-distance rows |
| `hall.seat.far` | `#080810` | Farthest rows — near-invisible |
| `hall.floor` | `#0A0A0F` | Aisle floor |
| `hall.wall` | `#0D0D15` | Side walls |
| `stage.floor` | `#0F0D08` | Stage floor — subtly warmer |
| `spotlight.warm` | `#FFF0C8` | Spotlight core — warm white |
| `spotlight.mid` | `rgba(255,220,120,0.3)` | Spotlight mid |
| `spotlight.outer` | `rgba(255,200,80,0.06)` | Spotlight outer falloff |
| `performer.silhouette` | `#FFF8E8` | Performer shape — lit from behind |
| `dust.mote` | `rgba(255,220,120,0.5)` | Dust particle in spotlight beam |
| `ink.primary` | `#F8F8F8` | Headlines |
| `ink.secondary` | `#666677` | Subheads, body |
| `ink.muted` | `#333344` | Metadata |
| `accent.green` | `#B4FF5A` | Primary CTA — acid green, the ONLY color |
| `accent.green.dark` | `#8ECC46` | CTA hover |
| `border.subtle` | `#151520` | Panel edges |

Black + near-black + one warm spotlight + one acid green. Five shades of nothing, then two colors that own the room.

## 4. Typography

- **Display:** Inter 700, `clamp(52px, 7.5vw, 108px)`, tracking `-0.025em`, leading `0.98`, white.
- **Curtain-rise reveal:** characters animate in individually via Framer — no other page does this at this scale.
- **Subhead:** Inter 400, `clamp(16px, 1.8vw, 22px)`, `ink.secondary`, leading `1.6`.
- **Program numbers:** `font-mono` 13px `ink.muted`.
- **Brand label:** Inter 700 20px uppercase, `accent.green`, very tight tracking.
- **Process label:** Playfair Display 400 Italic 18px `ink.secondary` — program copy should feel like liner notes.

```bash
npm install @fontsource/playfair-display framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│  GIGFORGE                               ACID GREEN CTA       │  ← nav, green label + CTA
│  ══════════════════════════════════════════════════════     │
│                                                              │
│  ████████████████████████████████████████████████████████  │
│  ██                                                      ██  │  ← Three.js concert hall
│  ██   [seat rows receding in perspective]               ██  │    full viewport height
│  ██            [spotlight on stage]                     ██  │    performer silhouette
│  ██████████████████████████████████████████████████████████  │
│                                                              │
│  Put the right              ← curtain-rise text reveal      │
│  musician in the room.      ← letter-by-letter, upward      │
│                                                              │
│  A directory for student creators.                           │
│  Browse free. Email directly. No agents.                     │
│                                                              │
│  [ Find musicians → ]    [ Post a gig ]                      │
│                                                              │
├════════════════════════════════════════════════════════════╡
│  * Open gig           * Matched profile    * Direct email   │  ← process rows
└────────────────────────────────────────────────────────────┘
```

The Three.js hall fills the first viewport. The text and CTAs live below it, revealed as the user scrolls — or appear in an overlay on top of the hall if the headline is placed inside the scene.

## 6. The Signature: Three.js Concert Hall Interior

**Architecture:**
- `PerspectiveCamera` at `[0, 2.5, 10]` looking at `[0, 1.5, 0]`, `fov: 50`. The vanishing point is the stage.
- Stage floor: `PlaneGeometry(8, 4)` at `z = -10` to `z = -6`. `MeshStandardMaterial` `stage.floor`, `roughness: 0.9`.
- Hall floor (aisle): `PlaneGeometry(12, 20)` rotated `-π/2` extending from `z = -6` to `z = 10`. `hall.floor`.
- Side walls: two `PlaneGeometry(20, 8)` planes. `hall.wall`, `roughness: 1.0`.
- Ceiling: `PlaneGeometry(12, 20)` at `y = 5`. `hall.wall`.

**Seat rows:**
- 12 rows of seats, each a collection of `BoxGeometry(0.4, 0.5, 0.4)` seat backs.
- Per row: 16 seats across. Row spacing in Z: rows closer to camera are wider apart (correct perspective).
- Seats get progressively darker by row: rows 1–4 use `hall.seat.near`, rows 5–8 use `hall.seat.mid`, rows 9–12 use `hall.seat.far` — they literally fade into the darkness.
- Use `InstancedMesh` for the 192 total seat objects — critical for performance.

**Stage spotlight:**
- `THREE.SpotLight` at `[0, 8, -4]`, targeting `[0, 0, -8]`. `color: #FFF0C8`, `intensity: 60`, `angle: Math.PI / 7`, `penumbra: 0.5`, `decay: 1.5`.
- Volumetric cone: `ConeGeometry(1.4, 6, 32, 1, true)` at the light position, `BackSide` material, `spotlight.outer` color, `opacity: 0.05` — the visible beam in the air.
- Stage floor pool: a `CircleGeometry(2.8, 32)` at stage level, lit material blending the spotlight color. Or: just let the SpotLight illuminate the stage floor naturally via `receiveShadow`.

**Performer silhouette:**
- A simple human silhouette: `Shape` geometry drawn with bezier curves for a standing performer. `ShapeGeometry` extruded 0.1 units. `MeshBasicMaterial` `performer.silhouette`.
- Positioned center-stage at `[0, 0.9, -7.8]`.
- Framer Motion entrance: the silhouette fades in via a `<Html>` overlay positioned at its screen coordinates (or via Three.js material opacity lerp over 2s, 1.5s after page load).

**Dust motes in spotlight:**
- 60 `Points` geometrically constrained within the spotlight cone volume.
- Each mote drifts slowly upward and slightly sideways. `PointsMaterial` `dust.mote`, size `0.012`.
- Upward drift: `position.y += 0.0003` per frame. Reset when exiting cone bounds.

**Camera movement:**
- Slow automated dolly: `camera.position.z` decreases by `0.0004` per frame — you're imperceptibly moving toward the stage.
- Cursor: `camera.rotation.y += (pointer.x * 0.08 - camera.rotation.y) * 0.025` — slight pan with cursor.
- After 30 seconds: camera has moved from `z = 10` to `z = 8.8` — barely perceptible but creates a real sense of approaching the stage.

`prefers-reduced-motion`: camera fixed, no dolly, no dust mote drift, performer appears immediately.

## 7. Curtain-Rise Text Reveal — Framer Motion

The headline `"Put the right musician in the room."` enters character by character on scroll (or after 1s delay):

```tsx
// Split text into character spans
const characters = "Put the right musician in the room.".split("");

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
};
const charVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};
// transition: { type: "spring", stiffness: 140, damping: 16 }
```

Characters rise and sharpen into view. At this font size (108px on desktop), individual characters arriving is cinematic. The effect takes ~1.2 seconds total — not a ticker, a reveal.

**On mobile:** word-level stagger (not character-level) — `"Put the"`, `"right musician"`, `"in the room."` — 3 spans instead of 36. Spring stiffness `200`, stagger `0.15`.

## 8. Process Rows — Stage Program

Below the fold, three rows on `bg.panel`, formatted like a program insert:

```
* 01  OPEN GIG
      Browse anonymously. See who needs what.
      No account required.

* 02  MATCHED PROFILE
      Find the right student by instrument,
      campus, and availability.

* 03  DIRECT EMAIL
      One email. Their inbox. Done.
      No platform. No fee.
```

`*` in `accent.green` `font-mono`. Numbers `font-mono` `ink.muted`. Headline Playfair Display Italic 18px `ink.secondary`. Body Inter 400 15px `ink.muted`.

Framer entrance from below: `initial={{ opacity: 0, y: 32 }}`, stagger `0.2s`.

## 9. CTAs

**Primary** — `Find musicians →`:
```
bg: #B4FF5A
text: #000000
height: 52px, px: 32px
radius: 4px
font: Inter 700, 15px
hover: bg #8ECC46, shadow 0 0 40px rgba(180,255,90,0.3)
transition: spring stiffness 300 damping 22
```

The acid green is the ONLY color on the page that isn't black or white. It owns the viewport.

**Secondary** — `Post a gig`:
```
bg: transparent
border: 1px rgba(248,248,248,0.15)
text: #F8F8F8
hover: border rgba(248,248,248,0.4), bg rgba(248,248,248,0.04)
```

## 10. Stats — Stage Dimensions

```
142 musicians      24 open gigs      12 universities
```

Numbers in Inter 700 72px white. Below each: `font-mono` 11px `ink.muted`. Framer count-up on `useInView`, 1.6s. Between each stat: a 1px vertical `border.subtle` rule. The stat row looks like stage dimensions printed on a theater blueprint.

## 11. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei @fontsource/playfair-display
```

## 12. Implementation Notes

- `ConcertHall.tsx` — Three.js, `dynamic(..., { ssr: false })`. Canvas: full viewport height.
- Seat `InstancedMesh`: 192 instances. Pre-compute all seat positions as `Float32Array` of `Matrix4` values via `dummy.position.set(x, y, z); dummy.updateMatrix(); instancedMesh.setMatrixAt(i, dummy.matrix)`. Call `instanceMatrix.needsUpdate = true` once after setup (not per frame — seats don't move).
- `SpotLight` shadows: `<Canvas shadows>`, `spotLight.castShadow = true`, `spotLight.shadow.mapSize.set(1024, 1024)`. Stage floor and seat backs `receiveShadow = true`.
- Performer silhouette shape: define a `THREE.Shape` with 20 bezier points approximating a standing human from the front. `ShapeGeometry` → `ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false })`.
- Character-split headline: use a `useMemo` to split the string. Each character needs a stable `key` — use index (acceptable since the string never changes).
- The `filter: "blur()"` Framer animation on characters: only run this on desktop (>768px). On mobile, skip blur for performance — just animate opacity + y.
- Camera dolly: imperceptible but cumulative. If testing for >30 seconds and the camera feels like it's moving, the speed is too high — reduce from `0.0004` to `0.0002`.

## 13. The Test

Open the page in a fully dark room with screen brightness at 60%. The concert hall should feel physically present — not like a screenshot of a concert hall, but like a space you're inside. If it looks flat, reduce ambient light intensity from `0.15` to `0.05` (more darkness = more depth). Then press play on the curtain-rise headline. The characters rising in sequence at 108px should feel cinematic, not gimmicky. If it feels gimmicky, slow the stagger from `0.03` to `0.05` and reduce spring stiffness from `140` to `100` — slower and heavier reads as theatrical, not toy-like.
