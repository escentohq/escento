# Landing Design 06 — **Open to Collaborate**

> I've shipped onboarding flows for two professional networks. The strongest trust signal LinkedIn ever built wasn't the profile — it was the "Open to Work" frame. It's a broadcasting mechanism: "I'm here, I'm ready, find me." GigForge is built on the same mechanic. But this version doesn't just borrow the frame — it builds a Three.js social constellation behind it: a live network of musician nodes where your profile card is at the center, with connections reaching out to collaborator nodes in orbit. The page doesn't tell you GigForge connects musicians. It shows you the connections forming in real time.

---

## 1. The Concept

White professional page. A Three.js orbital network scene fills the right column of the hero: one central profile node (the visitor, or a real musician stand-in) at the center, with 8 satellite nodes orbiting it — each satellite is a potential collaborator. Thin edges glow between nodes when they "connect." Over the left column: the GigForge pitch and a hero profile card wearing a green "OPEN TO COLLABORATE" banner. The orbital network makes the social graph visceral. The banner makes the availability signal unmissable.

## 2. Why This Direction

LinkedIn's "Open to Work" frame is the most recognized professional availability signal that exists. Students know it. Hirers know it. By adapting it (green banner: "OPEN TO COLLABORATE"), GigForge borrows that credibility instantly. The Three.js orbital constellation layers on the actual value proposition: when you're on GigForge, you're literally surrounded by potential connections. The network is not abstract — you can see it happening.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#FFFFFF` | Pure white professional base |
| `bg.section` | `#F3F2EF` | Alternating section backgrounds |
| `bg.card` | `#FFFFFF` | Profile cards |
| `bg.otc` | `#057642` | "Open to Collaborate" banner — LinkedIn green, exact |
| `bg.pill` | `#EEF3FB` | Skill tag backgrounds |
| `node.center` | `#0A66C2` | Central profile node in Three.js — professional blue |
| `node.satellite` | `#E8F0FE` | Orbiting collaborator nodes |
| `node.active` | `#057642` | A node that just "connected" — flashes green |
| `edge.idle` | `rgba(10,102,194,0.12)` | Resting connection line |
| `edge.active` | `rgba(10,102,194,0.7)` | Active forming connection |
| `border.card` | `rgba(0,0,0,0.08)` | Card edges |
| `border.divider` | `rgba(0,0,0,0.10)` | Section dividers |
| `ink.primary` | `#191919` | All primary text |
| `ink.secondary` | `#555555` | Body, subheads |
| `ink.muted` | `#888888` | Metadata, timestamps |
| `accent.blue` | `#0A66C2` | CTAs, links, active tags |
| `accent.blue.hover` | `#004182` | Hover on blue |

Professional, trustworthy, alive. No neon. No dark backgrounds.

## 4. Typography

- **Display:** Inter 700, `clamp(40px, 5.5vw, 72px)`, tracking `-0.025em`, leading `1.05`.
- **Body:** Inter 400, 16/26.
- **Banner text:** Inter 700, 13px white uppercase tracking `+0.06em`.
- **Card name:** Inter 700, 24px.
- **Label mono:** `font-mono` 12px uppercase tracking `+0.1em`, `ink.muted`.

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│  GIGFORGE                                      Sign in →    │
│  ──────────────────────────────────────────────────────    │
├─────────────────────────────┬──────────────────────────────┤
│                             │                                │
│  The professional           │  [Three.js orbital network]   │
│  network for                │  — central node at center     │
│  student musicians.         │  — 8 satellites in orbit      │
│                             │  — edges glow on connect      │
│  Find a guitarist for       │                                │
│  your film. Post a gig for  │  ┌──────────────────────────┐ │
│  a film composer.           │  │▓▓▓ OPEN TO COLLABORATE ▓▓│ │  ← green banner
│  Direct email contact.      │  │                            │ │
│                             │  │  Maya Chen               │ │
│  [ Browse musicians ]       │  │  Guitar · Vocals          │ │
│  [ Post a gig ]             │  │  UT Austin · Music '25   │ │
│                             │  │                            │ │
│  142 musicians currently    │  │  [guitar] [vocals] [folk] │ │
│  open to collaborate        │  │  hello@maya.example    →  │ │
│                             │  └──────────────────────────┘ │
└─────────────────────────────┴──────────────────────────────┘
```

Desktop: 50/50 split. Mobile: card above CTAs, orbital network scales to 200px centered above.

## 6. The Signature: Three.js Orbital Network

**Scene:**
- Camera: orthographic, looking down Z. Clean 2D projection.
- Central node: `CircleGeometry(0.5, 32)` + `MeshBasicMaterial` `color: #0A66C2`. Glows: a second `CircleGeometry(0.7, 32)` at 15% opacity behind it.
- 8 satellite nodes: `CircleGeometry(0.28, 32)`, `color: #E8F0FE`, thin `LineLoop` border `#0A66C2` 30% opacity. Each orbits the center at radius `2.2 + (i * 0.1)` with unique angular speed.
- Each satellite has a `<Html>` overlay via `@react-three/drei`: the instrument name in `font-mono` 9px `ink.muted` — `guitar`, `cello`, `piano`, `violin`, `drums`, `vocals`, `bass`, `flute`.

**Edge system:**
- `LineSegments` from center to each satellite: `edge.idle` always visible.
- Every 2.4 seconds: one random satellite "connects." Its edge brightens to `edge.active`, the satellite flashes `node.active` green, holds 0.8s, fades back. This is the "connection forming" moment.
- Active edge uses `THREE.Line` with `uniforms.uPulse` — a wave of brightness travels from center to satellite over 0.6s.

**Mouse interaction:**
- `raycaster` detects hover over satellite nodes.
- Hovered satellite: scales to 1.4×, edge brightens to 60%, label appears in `ink.primary` (was `ink.muted`).
- Cursor presence in canvas area slows all orbital speeds by 30% — the network pauses to be examined.

**Camera:** `OrbitControls` disabled. Fixed orthographic view. The network is a dashboard, not a scene to explore.

`prefers-reduced-motion`: orbits paused, edges at idle opacity, no connection flashes.

## 7. Open to Collaborate Banner — Framer Motion

The banner across the hero card entrance:
```tsx
initial={{ scaleX: 0, transformOrigin: "left" }}
animate={{ scaleX: 1 }}
transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
```

It unfurls from left to right on page load — like a LinkedIn frame appearing on a profile photo. The green is unmistakable.

**Live count below the card:**
```tsx
// Framer animate() count-up on mount
animate(0, 142, { duration: 1.6, ease: "easeOut", onUpdate: setCount })
```

`142 musicians currently open to collaborate` — the number counting up next to the banner makes the signal credible.

## 8. Recently Active Strip (Framer Motion)

Below the hero, `bg.section`:

```
RECENTLY ACTIVE
─────────────────────────────────────────────────────────

Jordan L.  ·  Cello · Classical         joined 2 days ago   →
Sam P.     ·  Piano · Producer          updated profile     →
Priya K.   ·  Violin · Orchestral       posted availability →
```

Each row is a `motion.div`:
```tsx
whileHover={{ x: 6, backgroundColor: "#EEF3FB" }}
transition={{ type: "spring", stiffness: 300, damping: 25 }}
```

Row entrance stagger via Framer `staggerChildren: 0.08` on `useInView`.

## 9. CTAs

**Primary** — `Browse musicians`:
```
bg: #0A66C2
text: #FFFFFF
height: 48px, px: 24px
radius: 24px
font: Inter 600, 15px
hover: bg #004182
shadow: 0 4px 16px rgba(10,102,194,0.2)
```

**Secondary** — `Post a gig`:
```
bg: transparent
border: 1.5px #0A66C2
text: #0A66C2
radius: 24px
hover: bg rgba(10,102,194,0.08)
```

## 10. Open Gigs Strip

Three gig cards on white, below the recently-active strip. Framer scroll entrance:
```tsx
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};
// staggerChildren: 0.1
// transition: { type: "spring", stiffness: 200, damping: 22 }
```

Card hover:
```tsx
whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(10,102,194,0.12)" }}
```

## 11. How It Works

```
01  Browse the directory     No account required. It's open.
02  Email directly           No DMs. No platform. Just email.
03  That's the product.      Simple by design, not by accident.
```

Numbers in `accent.blue` `font-mono` 600 weight. The third line is deadpan on purpose — confidence reads as credibility.

## 12. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 13. Implementation Notes

- `OrbitalNetwork.tsx` — Three.js scene, always `dynamic(..., { ssr: false })`. Canvas fills the right column, `pointer-events: auto` (unlike most other mockups — the orbital network IS interactive).
- Connection flash: `useMemo` a shuffled array of satellite indices, cycle through with `setInterval(2400)`. Update a `flashIndex` ref, use in `useFrame` to modulate the corresponding edge material opacity.
- The `<Html>` instrument labels in Three.js need `transform={false}` to stay pixel-perfect in 2D orthographic projection.
- Banner `scaleX` entrance must use `transformOrigin: "left center"` — without this Framer scales from center and the unfurl looks wrong.
- `prefers-reduced-motion`: wrap all `animate`, `whileHover`, and Three.js orbital logic in `useReducedMotion()` guard.

## 14. The Test

Show to someone who uses LinkedIn daily. Cover the headline with your hand. Point to the green banner. Ask what it means. If they say "this person is available to work with," the signal is working. Then uncover the orbital network. If they say "it's showing me who's connected," the Three.js scene is landing. Both must read without explanation — if either needs one, the visual hierarchy is wrong.
