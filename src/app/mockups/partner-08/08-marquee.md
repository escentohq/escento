# Landing Design 08 — **Signal**

> I'm a senior product designer who spent four years at a music streaming company and two more at a live events platform. Every music-product landing I've seen either goes full neon-dark (try-hard) or bland-white-professional (scared). Signal does neither. It looks like a frequency visualizer printed on warm paper — alive, technical, human. The Three.js background IS the identity.

---

## 1. The Concept

A warm cream page with a live 3D audio-wave mesh rippling behind the hero — rendered in Three.js, reacting to mouse position, the closest thing to "the music is in the room" you can put on a landing page. Over it: a bold headline, a real-time activity marquee in oversized hot-orange type, and two CTAs. Below: profile cards that slide in on scroll like tracks queuing up. The page has energy. It earns it technically.

## 2. Why This Direction

GigForge connects musicians. The landing should *feel* like music — not reference it through clipart or metaphor. A 3D waveform mesh that responds to your mouse is visceral. It communicates: *the people on this platform make things that sound like this*. No copy needed. Then the activity marquee layers on proof: the network is live right now. Together they answer both "what is this?" and "is anyone here?" before the visitor reads a word.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#FFF9F0` | Warm cream — FM radio on a summer afternoon |
| `bg.card` | `#FFFFFF` | Profile and gig cards |
| `bg.marquee` | `#FF5F1F` | Marquee band background — electric orange |
| `mesh.color` | `#FFD6B8` | Three.js waveform mesh color — warm, never harsh |
| `mesh.edge` | `rgba(255,95,31,0.25)` | Mesh wireframe edge color |
| `ink.primary` | `#1A1207` | Deep warm black — not cold neutral |
| `ink.secondary` | `#6B5B3E` | Subheads, body |
| `ink.muted` | `#A89070` | Timestamps, labels |
| `marquee.text` | `#FFF9F0` | Marquee text — cream on orange |
| `accent.orange` | `#FF5F1F` | CTAs, active links, stat callouts |
| `accent.orange.dark` | `#C43D00` | Hover states on orange |
| `accent.green` | `#15803D` | Availability dot only |

A palette that looks like a concert poster from the 1970s — warm, saturated, alive. Not tech-sterile.

## 4. Typography

- **Display headline:** Clash Display 700 (or Syne 700 as fallback), `clamp(52px, 7.5vw, 104px)`, tracking `-0.03em`, leading `0.95`. This font has angles, not just weight.
- **Marquee:** Same display font, Italic, **180px desktop / 96px mobile**. The marquee type is the loudest thing on the page.
- **Body:** Plus Jakarta Sans 400, 16/27.
- **Mono label:** `font-mono` 11px uppercase tracking `+0.18em`, `ink.muted`.
- **Card name:** Plus Jakarta Sans 700, 20px.

```bash
npm install @fontsource/syne @fontsource/plus-jakarta-sans
```

Two fonts. One angular display. One warm sans. Nothing else.

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│  GIGFORGE                                      Sign in →    │  ← bg: bg.page
│  ──────────────────────────────────────────────────────    │
│                                                              │
│  [[[[[  3D WAVEFORM MESH — full-width, 40vh tall  ]]]]]    │  ← Three.js canvas
│                                                              │
│  LIVE · 12 CAMPUSES · RIGHT NOW                            │  ← mono eyebrow
│                                                              │
│  The place where                                            │
│  student musicians                                          │  ← display headline
│  get found.                                                 │
│                                                              │
│  [ Browse musicians ]  [ Post a gig ]                      │
│                                                              │
├────────────────────────────────────────────────────────────┤
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← bg.marquee full-bleed
│  Maya joined · guitar  ★  Composer gig posted · paid ★    │  ← 180px italic display
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │  ← musician cards
│  │  Maya Chen   │  │  Jordan Lee  │  │  Sam Park    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

## 6. The Signature: Three.js Waveform Mesh

This is non-negotiable. It's the reason this page exists.

```bash
npm install three @react-three/fiber @react-three/drei
```

**Implementation:**

A `@react-three/fiber` `<Canvas>` positioned `absolute`, `inset-0`, `z-index: 0`, `pointer-events: none` behind the hero content. The canvas is the full hero height (~50vh).

**The mesh:**
- A `PlaneGeometry(20, 4, 128, 32)` — a high-vertex plane.
- In the vertex shader (via `@react-three/drei`'s `<shaderMaterial>`), each vertex Y position is displaced by:
  ```glsl
  float wave = sin(position.x * 2.0 + uTime * 0.8) * 0.15
             + sin(position.x * 5.0 + uTime * 1.4) * 0.08
             + sin(position.z * 3.0 + uTime * 1.1) * 0.06;
  newPosition.y += wave;
  ```
- `uTime` is driven by `useFrame` clock, smooth.
- **Mouse influence:** `uMouse` uniform — a `Vector2` updated on `pointermove`. Nearby vertices get an additional `0.3 * gaussianFalloff(dist)` displacement — the mesh reacts to your cursor like a real surface.
- **Color:** Wireframe mode OFF. Material is `MeshStandardMaterial` with `color: #FFD6B8`, `metalness: 0.1`, `roughness: 0.8`, `wireframe: false`. A subtle `ambientLight` (0.6) + `directionalLight` from top-left (1.0). Warm, not harsh.
- A second pass renders the wireframe at 20% opacity on top (a separate `<mesh>` with `wireframe: true`, `color: rgba(255,95,31,0.25)`).
- `prefers-reduced-motion`: mesh is static (clock frozen, no mouse influence).

**Camera:** `PerspectiveCamera` at `[0, 2, 6]` looking at `[0, 0, 0]`, `fov: 50`. The mesh fills the canvas naturally.

This must run at 60fps on a 3-year-old laptop. Test on Chrome with CPU 4x throttle. Budget: ≤2ms GPU frame time.

## 7. The Marquee

Full-bleed `bg.marquee` band, 200px tall desktop / 140px mobile.

Content composed server-side: `{musician} joined · {instrument}  ★  {role} gig posted · {pay}  ★  ...`

The `★` separators are `marquee.text` (cream), same size as body text — they recede between the big type.

**Motion via Framer:**
```tsx
<motion.div
  animate={{ x: ["0%", "-50%"] }}
  transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
>
  {/* two copies of the marquee content */}
</motion.div>
```

**Hover pause:**
```tsx
const controls = useAnimation();
// onHoverStart: controls.stop()
// onHoverEnd: controls.start(...)
```

**Framer `AnimatePresence`** handles a "(paused)" pill appearing at the right edge when stopped — fades in/out with `opacity: 0 → 1`.

## 8. Profile Cards — Scroll-In with Framer

Three musician cards below the marquee. Each card:
- White background, `border-radius: 12px`
- Top border: 3px solid `accent.orange` — the one orange touch on an otherwise white card
- Shadow: `0 4px 20px rgba(255,95,31,0.12)` — warm, not cold

**Framer entrance:**
```tsx
const cardVariants = {
  hidden: { opacity: 0, y: 40, rotate: -1 },
  visible: { opacity: 1, y: 0, rotate: 0 },
};
// staggerChildren: 0.12
// transition: { type: "spring", stiffness: 220, damping: 22 }
```

Cards enter with a slight rotation from -1deg → 0 — like they're being slid onto a table.

**Hover:**
```tsx
whileHover={{ y: -6, boxShadow: "0 12px 40px rgba(255,95,31,0.18)" }}
transition={{ type: "spring", stiffness: 300, damping: 20 }}
```

## 9. CTAs

**Primary** — `Browse musicians`:
```
bg: #FF5F1F
text: #FFF9F0
height: 52px, px: 28px
radius: 8px
font: Plus Jakarta Sans 700, 15px
hover: bg #C43D00, scale 1.02
shadow: 0 8px 24px rgba(255,95,31,0.35)
hover shadow: 0 12px 32px rgba(255,95,31,0.45)
transition: spring stiffness 280 damping 20
```

**Secondary** — `Post a gig`:
```
bg: transparent
border: 2px #FF5F1F
text: #FF5F1F
hover: bg rgba(255,95,31,0.08)
radius: 8px
```

## 10. Stats — Animated Counters

Below the cards, three stat blocks on `bg.page`:

```
142 musicians      24 open gigs      12 universities
```

Numbers in Clash Display 800 64px `accent.orange`. Labels in mono `ink.muted`. On `useInView`, Framer Motion `animate()` counts up from 0 with `ease: "easeOut"` over 1.2s. The orange numbers counting up is a 3-second dopamine hit.

## 11. How It Works

Three rows, left-aligned, each preceded by an orange frequency-bar motif (three CSS rectangles, 2px wide, heights 16/24/12px — a tiny EQ graphic):

```
▌▐▌  Browse the directory.      No account. Just look.
▌▐▌  Find who you need.         Filter, skim, email.
▌▐▌  Hire them, or don't.       That's the whole thing.
```

## 12. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei @fontsource/syne @fontsource/plus-jakarta-sans
```

## 13. Implementation Notes

- Three.js canvas: `<Canvas style={{ position: "absolute", inset: 0 }} gl={{ antialias: true, alpha: true }}>`. Background transparent so `bg.page` shows through.
- Shader mouse tracking: `useRef` on the canvas container, `onPointerMove` → normalize coords → set `uMouse` uniform via `meshRef.current.material.uniforms.uMouse.value.set(x, y)`.
- Framer and Three.js coexist fine — the canvas is `pointer-events: none`, Framer handles all DOM interactions.
- Marquee string: server component passes it as a prop to the client marquee component. No fetch on the client.
- `prefers-reduced-motion`: `useReducedMotion()` — freeze Three.js clock, skip all Framer entrance animations, marquee shows 4 static items.

## 14. The Test

Open on a laptop. Move your cursor slowly across the waveform. If the mesh response feels like you're dragging your hand through warm water — not jittery, not laggy — it's right. Then look away and look back. The marquee should be mid-sentence. If you can read a full item on every glance, the speed is correct. If the mesh makes you think "screensaver," slow the base animation and reduce vertex displacement by 30%.
