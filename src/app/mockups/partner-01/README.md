# Landing Design 01 — **Pulse**

> I'm a creative technologist who's shipped generative-art installations for two music festivals and a dozen album campaigns. Most music directories look like they were designed in a spreadsheet. Pulse looks like it was designed in a signal processing lab. The Three.js network graph IS the product — every node is a musician, every edge is a connection. You can see the platform working before you read a word.

---

## 1. The Concept

Pitch-black page. A live Three.js particle network fills the entire hero — hundreds of glowing nodes drifting slowly, edges lighting up as "connections" form between them. Each node is a student musician. The graph pulses with activity. Over it: a minimal terminal-style headline and a single emerald CTA. This is not a metaphor. It's the product visualized.

## 2. Why This Direction

GigForge is fundamentally about connections — student musicians finding collaborators and clients. The particle network makes that literal and beautiful. It answers "is anyone here?" before the visitor asks. The terminal aesthetic layers on technical credibility without feeling cold — it's the language of builders. Musicians who code will feel at home. Musicians who don't will find it aspirational.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#030305` | Near-void black — deeper than zinc-950 |
| `particle.core` | `#00FF88` | Node core — electric emerald |
| `particle.glow` | `rgba(0,255,136,0.15)` | Node radial glow via Three.js PointsMaterial |
| `edge.active` | `rgba(0,255,136,0.6)` | Edges that just "connected" |
| `edge.idle` | `rgba(0,255,136,0.08)` | Resting edge color |
| `ink.primary` | `#E8FFE8` | Headlines — near-white with a green tint |
| `ink.secondary` | `#4A7A5A` | Subheads, body |
| `ink.muted` | `#2A4A36` | Metadata, labels |
| `accent.emerald` | `#00FF88` | CTA, active states, cursor ring |
| `accent.emerald.dark` | `#00B860` | CTA hover |
| `border.subtle` | `#0A1A0F` | Card edges — barely visible |
| `terminal.prompt` | `#00FF88` | `$` prefix in headline |

One color. Green on black. The network does the rest.

## 4. Typography

- **Display headline:** `JetBrains Mono` 700, `clamp(32px, 4.5vw, 64px)`, tracking `0`. The headline is in monospace — it reads like a command executing.
- **Eyebrow:** Same mono, 12px uppercase, `ink.muted`: `// 142 musicians · 12 universities · RIGHT NOW`
- **Body:** Inter 400, 16/27, `ink.secondary`.
- **CTA label:** Inter 600, 15px.

```bash
npm install @fontsource/jetbrains-mono
```

No serif. No display grotesque. Just mono and one clean sans.

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│  GIGFORGE                              [STATUS: LIVE ●]     │  ← nav, emerald dot pulses
│                                                              │
│  ████████████████  THREE.JS PARTICLE NETWORK  ████████████  │
│  ██  nodes drift and connect, full-bleed hero, 70vh  ████  │
│  ████████████████████████████████████████████████████████  │
│                                                              │
│  // 142 musicians · 12 universities · RIGHT NOW              │  ← mono eyebrow
│                                                              │
│  $ find_musician                                            │
│    --campus=any                                              │  ← terminal headline
│    --available=now                                          │
│                                                              │
│  The directory for student musicians.                        │
│  Real people. Direct email. No feed.                        │
│                                                              │
│  [ Browse musicians ]    Post a gig →                        │
│                                                              │
├──────────── ACTIVITY LOG ────────────────────────────────  │  ← scrolling Framer marquee
│  Maya joined · guitar  ●  Composer gig posted · paid ●  …  │
└────────────────────────────────────────────────────────────┘
```

No max-width on the Three.js layer — it bleeds edge to edge. Content column is `max-w-4xl` centered.

## 6. The Signature: Three.js Particle Network

```bash
npm install three @react-three/fiber @react-three/drei
```

**Node system:**
- 200 particles via `THREE.BufferGeometry` with `THREE.PointsMaterial`
- Each node: position randomized in a `[-8, 8]³` bounding box, slow drift via `sin/cos` with unique phase seeds
- Core: `#00FF88` at 4px point size; outer glow via a second pass at 12px, 10% opacity
- On load: nodes spawn with `opacity: 0 → 1` via a Framer Motion wrapper on the canvas

**Edge system:**
- `THREE.LineSegments` connecting nodes within distance threshold (2.5 units)
- Edge opacity scales with `1 - (dist / 2.5)` — close nodes glow brighter
- Every 3.2 seconds: one random edge "activates" — flashes to `rgba(0,255,136,0.6)`, pulses twice, fades — the "connection forming" moment
- Active edge pulse animated via `uniforms.uActivePulse` + GLSL mix

**Mouse interaction:**
- `raycaster` detects the nearest node to the cursor
- That node swells to 2× size, edges from it light to 80% opacity — you can "hover" a musician
- Cursor position also pushes nearby nodes slightly away (soft magnetic repulsion), `intensity: 0.3`

**Camera:**
- `PerspectiveCamera` at `[0, 0, 12]`, `fov: 55`
- Slow auto-rotation: `camera.position.x = sin(t * 0.04) * 12`, `camera.position.z = cos(t * 0.04) * 12` — the network rotates around the viewer
- Mouse parallax: camera rolls subtly with cursor position

**`prefers-reduced-motion`:** static frame, no drift, no pulse, no camera rotation.

## 7. The Activity Marquee (Framer Motion)

```bash
npm install framer-motion
```

Full-bleed band below the hero, `bg: #050F08`, 80px tall. Single-line scrolling log in `JetBrains Mono` 13px `accent.emerald`:

```
Maya Chen joined · guitar  ●  Composer gig posted · $300  ●  Sam Park updated availability  ●  …
```

```tsx
<motion.div
  animate={{ x: ["0%", "-50%"] }}
  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
>
  {/* two copies, seamless loop */}
</motion.div>
```

`●` separators in `ink.muted`. Log items are server-rendered (last 20 events). No client fetch.

## 8. Profile Cards (Framer Motion Scroll-In)

Three musician cards below the marquee on `bg.page`. Cards are dark (`#080D0A`), border `border.subtle`, with an emerald left-accent (`border-left: 3px solid #00FF88`).

**Entrance:**
```tsx
const variants = {
  hidden: { opacity: 0, x: -24, filter: "blur(4px)" },
  visible: { opacity: 1, x: 0, filter: "blur(0px)" },
};
// staggerChildren: 0.1
// transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
```

Cards blur-in from the left — like terminal output loading.

**Hover:**
```tsx
whileHover={{ borderLeftColor: "#00FF88", x: 4, backgroundColor: "#0A1A0F" }}
```

## 9. CTAs

**Primary** — `Browse musicians`:
```
bg: #00FF88
text: #030305
height: 50px, px: 28px
radius: 4px
font: Inter 600, 15px
hover: bg #00B860, scale 1.02
shadow: 0 0 32px rgba(0,255,136,0.25)
hover shadow: 0 0 48px rgba(0,255,136,0.4)
transition: spring stiffness 300 damping 22
```

The emerald CTA is the brightest thing on the page. Eyes go there after the network.

**Secondary** — `Post a gig →`:
```
bg: transparent
border: 1px rgba(0,255,136,0.3)
text: #00FF88
hover: border rgba(0,255,136,0.8), bg rgba(0,255,136,0.06)
```

## 10. Stats — Animated Counters

```
142 musicians      24 open gigs      12 universities
```

Numbers in `JetBrains Mono` 700, 56px, `accent.emerald`. On `useInView`, Framer `animate()` counts from 0 over 1.6s with `ease: "easeOut"`. Labels in Inter 12px uppercase `ink.muted`. The green numbers counting up on a black background look like a stock ticker — financial credibility meets music platform.

## 11. How It Works

Three terminal-style blocks:

```
> browse_directory()
  // No account needed. Just look.

> find_match()
  // Filter by instrument, campus, availability.

> email_directly()
  // No DMs. No platform. Their email is right there.
```

Command lines in `accent.emerald` mono. Comments in `ink.secondary`. Block entrance staggered via Framer on scroll.

## 12. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei @fontsource/jetbrains-mono
```

## 13. Implementation Notes

- Three.js canvas: `position: absolute, inset: 0, pointer-events: none, z-index: 0`. Hero section is `position: relative, overflow: hidden`.
- Always `dynamic(() => import('./NetworkScene'), { ssr: false })` — Three.js never SSR.
- Node positions seeded deterministically from musician IDs so the graph looks identical on each load.
- Edge computation runs once on mount, cached in `useMemo`. Only active-pulse state changes per frame.
- Target: ≤1.5ms GPU frame time. Test with Chrome DevTools CPU 4× throttle.
- `prefers-reduced-motion`: `useReducedMotion()` from Framer — freeze graph, skip all entrance animations, show static marquee.

## 14. The Test

Open at night in a dark room. The particle network should feel like looking at a real social graph — not a screensaver. Move your cursor into the nodes. If hovering a node feels like hovering a person — a slight catch, a glow, a sense of selection — the mouse interaction is right. If it feels like hovering a ball, reduce the glow radius and increase the selection radius.
