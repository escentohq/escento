# Landing Design 02 — **Studio Console**

> I spent four years designing interfaces for professional audio software — DAWs, spectrum analyzers, mixing consoles. Every one of those tools has the same visual grammar: dark surfaces, fine hairline grids, a single frequency readout that tells you everything. Studio Console applies that grammar to a musician directory. It looks like gear a real studio would rack-mount. The Three.js oscilloscope IS the heartbeat of the page.

---

## 1. The Concept

A pitch-dark studio console aesthetic. The hero centers on a Three.js real-time oscilloscope ring — not a flat waveform plane, but a circular frequency display like a spectrum analyzer in polar coordinates. Mouse position modulates the waveform in real time. Below it: precision typography, a violet CTA, and musician cards that enter like audio channel strips sliding into a mixer rack. The page sounds like it sounds.

## 2. Why This Direction

GigForge is a tool for audio professionals-in-training. The landing should feel like something from a studio, not an app store. A polar oscilloscope does what no flat waveform can — it fills the hero with geometric, living complexity that still reads as disciplined and technical. Framer Motion handles the rack-slide entrances. Three.js handles the oscilloscope. Together they communicate: *this platform was built with the same care you put into your music.*

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#08080B` | Page (a hair darker than zinc-950) |
| `bg.surface` | `#101015` | Cards, console panels |
| `bg.surface.hover` | `#16161D` | Hovered card |
| `border.hairline` | `#1F1F27` | 1px dividers |
| `osc.ring` | `#8B6FFF` | Oscilloscope main ring — violet |
| `osc.glow` | `rgba(139,111,255,0.15)` | Ring outer glow |
| `osc.grid` | `rgba(139,111,255,0.08)` | Polar grid lines |
| `osc.warm` | `#E8C275` | Single warm accent — the "hot signal" indicator |
| `ink.primary` | `#F4F4F7` | Headlines, body |
| `ink.secondary` | `#A1A1AA` | Subheads, metadata |
| `ink.muted` | `#52525B` | Captions |
| `accent.violet` | `#8B6FFF` | Primary CTA, active states |
| `accent.warm` | `#E8C275` | Live pulse dot, open gig count — one warm signal |
| `status.open` | `#5EE2A0` | OPEN gig badge |

Grayscale studio surface + violet signal + one warm alert. Maximum restraint.

## 4. Typography

- **Display:** Inter Display 700, `clamp(44px, 6vw, 88px)`, tracking `-0.02em`, leading `1.02`.
- **Mono eyebrow:** JetBrains Mono 11px uppercase `+0.2em`, `ink.muted`: `OPEN · 24 GIGS · UPDATED 2 MIN AGO`
- **Body:** Inter 400, 16/26.
- **Console readout:** JetBrains Mono 13px — the oscilloscope frequency/amplitude readout below the ring.

```bash
npm install @fontsource/jetbrains-mono
```

## 5. Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [GIGFORGE]                          [OPEN ● 24]  [signin]   │  ← nav; warm dot pulses
├──────────────────────────────────────────────────────────────┤
│                                                                │
│                   ╭─────────────────╮                         │
│                  ╱   OSCILLOSCOPE   ╲                         │  ← Three.js polar ring
│                 │    RING · 360°     │                         │    full-color, animated
│                  ╲                  ╱                         │
│                   ╰─────────────────╯                         │
│               FREQ: 440Hz   AMP: 0.72   ← mono readout       │
│                                                                │
│   OPEN · 24 GIGS · UPDATED 2 MIN AGO                          │  ← mono eyebrow
│                                                                │
│   Find the right student musician.                            │
│   Email them directly.                     ← display H1      │
│                                                                │
│   A directory, not a feed. For student creators               │
│   who need a composer, guitarist, or vocalist — now.          │
│                                                                │
│   [ Browse musicians → ]    [ Post a gig ]                    │
│                                                                │
├──────────────────────────────────────────────────────────────┤
│   ┌──────────────────┐   ┌──────────────────┐                │  ← musician + gig cards
│   │  Channel 01      │   │  Channel 02      │                │     (rack-slide entrance)
└──────────────────────────────────────────────────────────────┘
```

Max width 1152px. The oscilloscope ring is 360px on desktop, 260px on mobile. It sits centered above the headline.

## 6. The Signature: Three.js Polar Oscilloscope

```bash
npm install three @react-three/fiber @react-three/drei
```

A `THREE.Line` drawn in polar coordinates — `r(θ) = R + A(θ, t)` where `A` is the sum of three sine waves with incommensurate frequencies:

```glsl
float r = baseRadius
  + 0.18 * sin(4.0 * theta + uTime * 0.9)
  + 0.11 * sin(9.0 * theta + uTime * 1.4)
  + 0.07 * sin(16.0 * theta - uTime * 0.7);
```

- 512 vertices around the circle for smooth resolution
- Line: `THREE.LineLoop`, material `LineBasicMaterial` color `#8B6FFF`, linewidth 2 (WebGL allows 1 in practice — use a thin tube via `TubeGeometry` for true width control)
- Outer glow: a second identical loop at 110% radius, `#8B6FFF` 12% opacity, 8px blur via post-processing or a scaled duplicate
- Polar grid: 8 thin reference rings at 25%, 50%, 75%, 100% radius, `osc.grid` color
- **Mouse modulation:** `uMouse` uniform (normalized -1 to 1). Mouse X → modulates the `sin(4θ)` frequency by ±1.5; Mouse Y → modulates amplitude of the outermost harmonic. The ring visibly deforms toward the cursor direction.
- **Camera:** orthographic, looking straight down the Z axis — the ring reads as a perfect 2D circle on screen but lives in 3D space
- **Warm accent:** when `amplitude > 0.75` (mouse near edge), the ring color briefly bleeds toward `#E8C275` via `mix()` — a "hot signal" moment

**Readout below ring:**
```
FREQ: 440Hz   AMP: 0.72   PHASE: 180°
```
These numbers are fake but update in sync with `uTime` — the display is theater, but it's precise theater.

`prefers-reduced-motion`: ring frozen at `t=0`, mouse modulation off.

## 7. Card Entrances — Rack Slide (Framer Motion)

Cards enter from the right like audio channel strips sliding into a mixing desk rack:

```tsx
const rackVariants = {
  hidden: { opacity: 0, x: 48, scaleY: 0.96 },
  visible: { opacity: 1, x: 0, scaleY: 1 },
};
// transition: { type: "spring", stiffness: 180, damping: 24 }
// staggerChildren: 0.14
```

Card hover: `border-top` steps from `#1F1F27` → `#8B6FFF` (3px), `translateY(-2px)`. 180ms `cubic-bezier(0.4, 0, 0.2, 1)`. The card activates like a mixer channel being soloed.

Inner highlight: `box-shadow: inset 0 1px 0 rgba(255,255,255,0.04)` — brushed anodized aluminum catching top light.

## 8. CTAs

**Primary** — `Browse musicians`:
```
bg: #8B6FFF
text: #08080B
height: 48px, px: 20px
radius: 12px
font: Inter 600, 15px, tracking -0.005em
hover: bg #9D85FF, translateY(-1px), shadow 0 8px 24px rgba(139,111,255,0.3)
transition: spring stiffness 280 damping 20
```

**Secondary** — `Post a gig`:
```
bg: transparent
border: 1px #2C2C36
text: #F4F4F7
hover: border #7C5CFF, bg rgba(124,92,255,0.05)
```

## 9. Stats — Frequency Counters

Below the cards, three stat blocks:

```
142 musicians      24 open gigs      12 universities
```

Numbers in Inter 700 64px `accent.violet`. Labels in JetBrains Mono 11px uppercase `ink.muted`. Framer `animate()` counts up on `useInView`, 1.4s `ease: "easeOut"`. The violet numbers climbing on black look like a frequency counter. Dopamine on arrival.

## 10. How It Works — Console Input Format

Three steps, formatted like console I/O:

```
IN  →  browse_directory()     No account. Just look.
IN  →  find_match()           Filter instrument, campus, availability.
OUT ←  email_contact          Their inbox. No platform middleman.
```

`IN`/`OUT` labels in `accent.warm` mono, small. Commands in `accent.violet` mono. Descriptions in `ink.secondary`. The format is pure studio console.

## 11. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei @fontsource/jetbrains-mono
```

## 12. Implementation Notes

- Oscilloscope is a separate `OscilloscopeRing.tsx` component, always `dynamic(() => import(...), { ssr: false })`.
- `TubeGeometry` path: compute 512 `Vector3` points via polar → Cartesian, build a `CatmullRomCurve3`, extrude a 2px tube. This gives true linewidth in WebGL.
- `uTime` driven by `useFrame(({ clock }) => { mesh.uniforms.uTime.value = clock.elapsedTime })`.
- Mouse: `onPointerMove` on the canvas container → normalize to [-1, 1] → set `uMouse`.
- Card data is server-rendered. The oscilloscope is the only dynamic import.
- Test: CPU 4× throttle in Chrome DevTools. Ring should hold 60fps. Budget ≤2ms GPU.

## 13. The Test

Play music in the room while the page is open. If the oscilloscope feels like it's reacting to the music (it isn't — it's on a clock), you tuned the harmonics correctly. If it feels like a loading spinner, the frequency ratio between the three sine components is too regular — use `0.9`, `1.4`, `0.7` or any triple that shares no common factor.
