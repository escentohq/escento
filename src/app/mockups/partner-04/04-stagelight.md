# Landing Design 04 — **Stagelight**

> I've built rebrand sites for two indie record labels and a national touring orchestra. Music landing pages always reach for flame and neon. Real stages don't. Real stages are 90% darkness and 10% intention. Stagelight puts that intention on screen: one Three.js volumetric light cone descending from a physical ceiling rig, with the headline living inside the beam. The spotlight follows your cursor. This is the one design here that makes you feel like you're actually at a venue.

---

## 1. The Concept

A near-black stage. A Three.js `SpotLight` descends from a visible ceiling rig — you can see the cone of light in the air, the dust motes drifting through it, the pool of warmth on the stage floor. Move your cursor left or right — the light arm swings on a physical pivot, following you with the lag of real theatrical hardware. The headline lives inside the beam. The rest of the page waits in shadow until the cursor reveals it. This is stagecraft, not decoration.

## 2. Why This Direction

GigForge helps people *find performers*. A spotlight is the most direct possible metaphor that doesn't read as cliché — because it's realized in actual 3D space with real physics, not CSS trickery. The Three.js scene has a ceiling, a floor, dust particles, and a mechanically-pivoting arm. It feels like standing in a venue during load-in. The musicians on this platform belong on stages. The landing page is the first stage they appear on.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.stage` | `#0A0A0C` | Page (deep theater black) |
| `bg.floor` | `#0E0E11` | Below-hero band (backstage strip) |
| `light.warm` | `#FFC880` | SpotLight color + CSS gradient fallback |
| `light.ambient` | `#1A1520` | Ambient scene light |
| `text.lit` | `#FFF8EE` | Text inside the beam |
| `text.unlit` | `#52525B` | Text in shadow |
| `text.ghost` | `#1E1E26` | Far-shadow text — barely visible |
| `border.subtle` | `#1A1A1F` | Card edges |
| `accent.cool` | `#5E8FFF` | Primary CTA — the only non-warm element |
| `dust.color` | `rgba(255,200,128,0.6)` | Mote particle color inside beam |

One warm light source. One cool counterpoint. Everything else is shadow.

## 4. Typography

- **Display:** Inter Display 700, `clamp(48px, 7vw, 96px)`, tracking `-0.025em`, leading `1.0`. The headline is large enough to be partially obscured by shadow, with the lit portion commanding attention.
- **Stage direction mono:** `font-mono` 12px uppercase, `text.unlit`: `THE STAGE · ROW B · SEAT 14`
- **Body:** Inter 400, 16/26, `text.lit`.

## 5. Layout

```
┌────────────────────────────────────────────────────────┐
│   [logo]                              [signin]          │
├────────────────────────────────────────────────────────┤
│                                                          │
│   ══╦══ ══╦══ ══╦══    ← Three.js ceiling rig (pipes)  │
│      ║       ║                                           │
│     [●]     [●]        ← light housing (PAR cans)       │
│      ║                                                   │
│      ╲                                                   │
│       ╲ ← cone visible in 3D space (volumetric beam)    │
│        ╲                                                 │
│                                                          │
│                  THE STAGE · ROW B                      │  ← mono, unlit
│                                                          │
│              Find the musician                          │  ← inside beam → lit
│              your project needs.                        │
│                                                          │
│         A directory for student creators.               │
│                                                          │
│          [ Browse musicians ]  [ Post a gig ]           │
│                                                          │
│  ──────────────────────────────────────────────────    │  ← floor line
├────────────────────────────────────────────────────────┤
│  [Musician card]           [Gig card]                   │  ← bg.floor, below stage
└────────────────────────────────────────────────────────┘
```

## 6. The Signature: Three.js Volumetric Stage

```bash
npm install three @react-three/fiber @react-three/drei framer-motion
```

**Scene objects:**

*Ceiling rig:* Three `BoxGeometry(0.08, 0.08, 4)` horizontal pipes in `#1A1A22` crossing overhead. Two `CylinderGeometry(0.06, 0.06, 0.14)` PAR-can housings suspended from the center pipe. Physical, recognizable.

*SpotLight:* `THREE.SpotLight` — `color: #FFC880`, `intensity: 80`, `angle: Math.PI / 6`, `penumbra: 0.4`, `decay: 2`. Positioned at `[0, 4.5, 2]`. Casts shadows onto a `PlaneGeometry(20, 20)` floor.

*Volumetric cone:* A `ConeGeometry(1.2, 5, 32, 1, true)` with `THREE.MeshStandardMaterial` on `BackSide`, `color: #FFC880`, `transparent: true`, `opacity: 0.06`. The visible beam in the air between the fixture and the floor.

*Dust motes:* 120 `THREE.Points` inside the cone volume. Each mote drifts on a slow Lissajous path within the cone bounds. `PointsMaterial` color `rgba(255,200,128,0.6)`, size 0.015. On cursor move, nearby motes scatter slightly (repulsion radius 0.4 units).

**Cursor follow — spotlight pivot:**
- Mouse X (normalized -1 to 1) → `spotLight.position.x` target: `mouseX * 2.5`
- Lerp: `current += (target - current) * 0.055` per frame — the arm swings with the inertia of real theatrical rigging
- `spotLight.target.position.x` tracks proportionally so the beam stays pointing down
- The PAR-can housing meshes also rotate to follow — the whole rig moves

**Touch devices:** spotlight oscillates `sin(t * 0.4) * 1.8` on a slow sine — the venue feels live.

`prefers-reduced-motion`: spotlight locked at `[0, 4.5, 2]`, motes frozen.

## 7. Framer Motion — Reveal Entrance

On page load, all hero text starts as `opacity: 0`. Framer staggered reveal:

```tsx
const stageVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.6 } },
};
const lineVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
```

The delay of 0.6s lets the Three.js scene load and the first frame render before the text appears — feels like the lights coming on before the performer steps out.

**CTA entrance:**
```tsx
whileHover={{ scale: 1.02 }}
transition={{ type: "spring", stiffness: 300, damping: 20 }}
```

## 8. CTAs

**Primary** — `Browse musicians`:
```
bg: #5E8FFF  ← the cool counterpoint to the warm stage
text: #0A0A0C
height: 50px, px: 24px
radius: 100px (pill)
hover: bg #7BA3FF, scale 1.02, shadow 0 12px 32px rgba(94,143,255,0.3)
```

**Secondary** — `Post a gig`:
```
bg: transparent
border: 1px rgba(255,200,128,0.4)
text: #FFF8EE
hover: border rgba(255,200,128,0.8)
```

## 9. Below the Stage: Two Sample Cards

Band with `bg.floor`. Two cards side-by-side. NOT inside the spotlight scene — these are the backstage strip. One musician card, one gig card. Each has `border: 1px border.subtle`, `border-radius: 8px`, `bg: #101015`.

**Framer entrance from below:**
```tsx
initial={{ opacity: 0, y: 32 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 1.2, type: "spring", stiffness: 160, damping: 22 }}
```

## 10. How It Works

Three-row vertical list:

```
[01]  Browse the directory          A no-account page. Just look.
[02]  Find a student you like        Email is right there.
[03]  Hire them, or not              That's it. That's the product.
```

Numbers in `light.warm` (`#FFC880`), headline in `text.lit`, body in `text.unlit`. Framer stagger on scroll.

## 11. Stage-Direction Footer

Theater language throughout the footer: `EXIT · STAGE LEFT` for the back-to-top link, `INTERMISSION` for the privacy section, `PROGRAMME` for About. The one place the metaphor gets cheeky. Stays legible. Never tries too hard.

## 12. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 13. Implementation Notes

- `StageScene.tsx` — the entire Three.js scene. Always `dynamic(..., { ssr: false })`.
- Scene canvas: `position: absolute, inset: 0, pointer-events: none`. Hero section: `position: relative, min-height: 100vh, overflow: hidden`.
- `shadows` must be enabled on `<Canvas>`: `<Canvas shadows>`. `DirectionalLight` and `SpotLight` both set `castShadow`. Floor plane sets `receiveShadow`.
- Mote positions: `useMemo` with deterministic seeds so the scatter looks consistent on reload.
- The volumetric cone `ConeGeometry` must be `openEnded: true` to avoid a base cap closing the beam.
- Test spotlight pivot latency: if the light feels "sticky" increase lerp factor to 0.075. If it feels "nervous" decrease to 0.035.

## 14. The Test

Dim your monitor to 40% brightness. Sit two feet back. Move your cursor slowly left to right across the hero. If the spotlight pivot feels like a real follow-spot — deliberate, weighty, just slightly behind your hand — the lerp factor is correct. If it feels like a CSS hover effect, the Three.js scene isn't landing. Check that the volumetric cone opacity is ≥0.06 (lower and it disappears on bright monitors).
