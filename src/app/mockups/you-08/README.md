# Landing Design 08 — **Soft Campus**

> I've designed onboarding flows for three student-facing tools, and the consistent finding is this: the first contact moment is the most important one. Students won't reach out unless they feel psychologically safe. Soft Campus is the page that makes first contact feel easy. But "warm and approachable" doesn't mean dull — the Three.js piece is a soft-body physics simulation: glowing orbs representing students gently collide and cluster, each one labeled with a name and instrument. It looks like a social graph with gravity. Framer Motion handles the conversation-card flow. The page is kind AND technically sophisticated.

---

## 1. The Concept

Pale blue-gray page — the color of a clear sky on campus. A Three.js soft-body sphere simulation fills the left half of the hero: 20–30 glowing soft orbs drifting and colliding with gentle physics. Each orb has a label: `Maya · guitar`, `Jordan · cello`. They cluster, separate, and reform — the network is alive and social but not aggressive. Right side: three conversation-style cards showing a creator, a musician, and GigForge completing a connection. Below: warm how-it-works section and a rounded CTA. The physics simulation IS the social proof.

## 2. Why This Direction

Most professional networks feel transactional. Soft Campus feels relational — the right register for students doing their first professional reach-out. The orb physics simulation is not decorative: each sphere is a person in the network, moving with the natural dynamics of social systems — clustering with similar types, occasionally bouncing away, returning. It's scientifically accurate to how social networks actually work, expressed as gentle 3D physics. Framer Motion's spring animations reinforce the physical, non-jarring quality throughout.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#EEF2F8` | Pale blue-gray — clear sky |
| `bg.card` | `#FFFFFF` | Conversation cards |
| `bg.card.creator` | `#EBF3FF` | Creator card tint — soft blue |
| `bg.card.musician` | `#E8F5EE` | Musician card tint — soft green |
| `bg.card.gigforge` | `#FFFFFF` | GigForge resolution card |
| `orb.creator` | `#93C5FD` | Creator orbs — sky blue |
| `orb.musician` | `#86EFAC` | Musician orbs — soft green |
| `orb.gig` | `#FCA5A5` | Gig orbs — soft pink/red |
| `orb.glow.blue` | `rgba(147,197,253,0.3)` | Blue orb glow |
| `orb.glow.green` | `rgba(134,239,172,0.3)` | Green orb glow |
| `border.card` | `rgba(0,0,0,0.06)` | Card edge |
| `border.label` | `rgba(0,0,0,0.10)` | Pill label border |
| `ink.primary` | `#1E293B` | Headlines, card text |
| `ink.secondary` | `#475569` | Body text |
| `ink.muted` | `#94A3B8` | Metadata, timestamps |
| `accent.green` | `#16A34A` | Primary CTA, available dot |
| `accent.blue` | `#2563EB` | Links, secondary highlight |
| `label.creator` | `#1D4ED8` | Creator label text |
| `label.musician` | `#15803D` | Musician label text |

Three soft pastels for the orb types. Professional blue + green for actions. Nothing harsh.

## 4. Typography

- **Display:** Inter 700, `clamp(36px, 5.5vw, 68px)`, tracking `-0.02em`, leading `1.06`.
- **Pill label:** Inter 600 12px, `+0.04em` tracking, with a border `border.label` and rounded 100px radius.
- **Body:** Inter 400, 17/1.65, `ink.secondary`.
- **Card tag:** Inter 600 11px uppercase tracking `+0.1em`.
- **Card text:** Inter 400 15px `ink.primary`.

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│  GigForge                                      Sign in →    │
│  ──────────────────────────────────────────────────────    │
├──────────────────────────┬─────────────────────────────────┤
│                          │                                   │
│  [Three.js orb physics   │  ┌─────────────────────────┐   │
│   — 25 glowing spheres   │  │ + Creator                │   │
│   — drifting, colliding  │  │ "I need a warm piano     │   │
│   — labeled with names]  │  │  theme for my doc."      │   │
│                          │  └─────────────────────────┘   │
│                          │  ┌─────────────────────────┐   │
│                          │  │ + Musician               │   │
│  [+ Built for students   │  │ "I play keys, score      │   │
│   helping students]      │  │  shorts, meet Thursdays" │   │
│                          │  └─────────────────────────┘   │
│  Make campus             │  ┌─────────────────────────┐   │
│  collaboration feel      │  │ + GigForge               │   │
│  less awkward.           │  │  Portfolio found.        │   │
│                          │  │  Email contact ready.    │   │
│  [ Get started ]         │  └─────────────────────────┘   │
│  Browse first →          │                                   │
│                          │                                   │
└──────────────────────────┴─────────────────────────────────┘
```

## 6. The Signature: Three.js Soft-Body Physics Orbs

**Orb system:**
- 25 spheres via `THREE.InstancedMesh` with `SphereGeometry(1, 16, 16)`.
- Radius varies per orb: `0.18 → 0.42` (random, seeded). Larger orbs are musicians. Smaller ones are creators.
- Colors: 12 creator orbs (`orb.creator`), 10 musician orbs (`orb.musician`), 3 gig orbs (`orb.gig`). Assigned by index.
- Material: `MeshStandardMaterial`, `transparent: true`, `opacity: 0.85`, `roughness: 0.15`, `metalness: 0`. The slight transparency lets orbs overlap without hard edges.

**Physics (manual, no engine):**
- Each orb has `velocity: Vector3`, `position: Vector3`.
- Per frame: 
  1. Apply center gravity: `velocity.add(toCenter.multiplyScalar(0.0004))` — orbs drift toward scene center.
  2. Apply orb-orb repulsion: for each pair within distance `radiusI + radiusJ + 0.1`, apply `velocity.add(awayFromNeighbor.multiplyScalar(0.002 / dist))`.
  3. Damp velocity: `velocity.multiplyScalar(0.98)` — low damping, orbs glide.
  4. Update position.
- The result: orbs cluster gently in the center, occasionally touching and bouncing, never escaping.

**Glow:**
- Each orb has a sibling `SphereGeometry` at 1.4× radius, `MeshBasicMaterial` with matching glow color, `transparent: true`, `opacity: 0.18`, `side: THREE.BackSide`. This inner glow reads as the orb having volume and light.

**Labels:**
- `<Html>` overlay on each orb: `font-mono` 9px `ink.muted` showing `Name · instrument`. `pointerEvents: none`. Positioned at `orb.position` via R3F.
- Labels fade: `opacity` of label div = `0.3 + 0.7 * (1 - clamp(velocity.length * 20, 0, 1))` — labels appear when orbs are still, fade when moving fast.

**Mouse interaction:**
- `raycaster` detects cursor near orbs. Cursor creates a gentle push force on nearby orbs: `velocity.add(toOrb.multiplyScalar(-0.006))` — like moving your hand through a cloud of bubbles.

`prefers-reduced-motion`: orbs frozen in a balanced arrangement, no physics update, no cursor interaction.

## 7. Conversation Cards — Framer Motion

Three stacked cards on the right, with distinct colored tops. They enter sequentially on page load with a "conversation building" effect:

```tsx
const cardVariants = {
  hidden: { opacity: 0, x: 32, scale: 0.97 },
  visible: { opacity: 1, x: 0, scale: 1 },
};
// staggerChildren: 0.3  ← slow stagger — each card "arrives" in the conversation
// transition: { type: "spring", stiffness: 160, damping: 22 }
```

Each card has a colored left border: Creator `accent.blue`, Musician `accent.green`, GigForge `ink.muted`.

**Card hover:**
```tsx
whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
transition={{ type: "spring", stiffness: 300, damping: 25 }}
```

**The GigForge resolution card** has a subtle `checkmark ✓` animation on mount:
```tsx
// SVG path strokeDasharray/strokeDashoffset animation
// Goes from hidden (offset = full length) to drawn (offset = 0)
// transition: { duration: 0.5, delay: 1.2, ease: "easeOut" }
```

## 8. CTAs

**Primary** — `Get started`:
```
bg: #16A34A
text: #FFFFFF
height: 52px, px: 32px
radius: 100px (pill — soft, approachable)
font: Inter 600, 16px
hover: bg #15803D, shadow 0 4px 24px rgba(22,163,74,0.3)
transition: spring stiffness 280 damping 22
```

**Secondary** — `Browse first →`:
```
No button. Inter 500 #2563EB, underline 1px.
Arrow advances 6px on Framer whileHover, spring stiffness 400.
```

## 9. Stats

```
142 musicians      24 open gigs      12 universities
```

Numbers in Inter 700 56px `ink.primary`. Framer count-up on `useInView`, 1.4s. Below each: a rounded pill label in pastel — `orb.creator` bg for musicians, `orb.musician` bg for gigs, `orb.gig` bg for universities. The orb colors carry into the stat section.

## 10. How It Works

```
01  Browse the directory     No account needed. Private by design.
02  Find someone you like    Their profile is clear and honest.
03  Send one email           That's the whole reach-out. Simple.
```

Framer entrance stagger. Inter 600 headlines. The "one email" line is important — the whole page is designed to make that moment feel low-stakes.

## 11. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 12. Implementation Notes

- `OrbSimulation.tsx` — Three.js, `dynamic(..., { ssr: false })`. Canvas fills the left hero column.
- `InstancedMesh`: use `tempMatrix = new THREE.Matrix4()` and `mesh.setMatrixAt(i, tempMatrix)` each frame after physics update. `mesh.instanceMatrix.needsUpdate = true` per frame.
- Per-orb data in `useRef` arrays (not React state) — physics runs 60fps, setState would re-render too often.
- Glow spheres: a second `InstancedMesh` with BackSide material at 1.4× radii. Update both in the same `useFrame`.
- `<Html>` for labels: since orbs move, pass `position` as a prop to `<Html>` with `position={[orb.x, orb.y, orb.z]}`. R3F handles world-to-screen conversion.
- Physics on mobile: reduce to 15 orbs, cap velocity at `0.015` (lower velocity = calmer on small screens).
- `prefers-reduced-motion`: render a static final arrangement (pre-computed stable positions), skip `useFrame` physics entirely.

## 13. The Test

Show to a student who's never posted a gig before. Ask: "Does this feel like a place where you'd send a cold email to a stranger?" If they say yes (or "maybe"), the soft physics and conversation cards are landing correctly. If they say "it feels corporate," the orb colors are too saturated — reduce opacity to 0.7 and push the page background to a warmer tone (`#EFF3F8`). The goal is "cozy professional," not "startup friendly."
