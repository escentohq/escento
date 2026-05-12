# Landing Design 07 — **Finder Console**

> I build command-line tools for creative teams. Every terminal I've designed starts from the same principle: speed is respect. The Finder Console is for deadline-driven students who don't want to be charmed — they want to find the right person and send the email in under two minutes. The Three.js piece is a holographic command terminal floating above a dark surface: commands appear as glowing 3D text planes stacked in Z-space, each line physically present in the scene. Framer Motion handles the typing simulation and the result stream. The page runs like the tool it describes.

---

## 1. The Concept

Near-black page. A Three.js holographic terminal floats in the hero — not a flat mockup, but an actual 3D command interface where each line of output is a glowing text plane suspended at a different Z-depth, slightly tilted, as if the commands are physically materializing in space. The green text of a running query streams across the bottom of the scene in real time. Over the left column: a focused product pitch and green CTA. Below: a three-column feature grid in the same technical grammar. The page doesn't perform speed — it IS speed.

## 2. Why This Direction

Creators who post gigs often have a technical background: film students, game developers, podcast producers. They recognize and respect command-line aesthetics. The terminal metaphor communicates precision and directness — the exact values GigForge delivers. The 3D holographic terminal is the design detail that separates this from "dark terminal-themed SaaS": the commands float in physical space, each one a tangible object. You're not reading a screenshot. You're at the console.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#07090F` | Near-void dark |
| `bg.surface` | `#0D1117` | Cards, panel surfaces |
| `bg.panel` | `#0A0E16` | Console panel background |
| `holo.green` | `#00FF88` | Primary terminal text — electric green |
| `holo.green.dim` | `#00CC6A` | Secondary terminal text |
| `holo.green.glow` | `rgba(0,255,136,0.12)` | Text glow halo |
| `holo.amber` | `#FFB340` | Warning / deadline highlight |
| `holo.blue` | `#60A5FA` | Comment lines in terminal |
| `holo.surface` | `rgba(0,255,136,0.04)` | Terminal panel background tint |
| `prompt.symbol` | `#00FF88` | `$` and `>` prompt characters |
| `ink.primary` | `#E8F0F8` | Page text — not pure white, slight blue |
| `ink.secondary` | `#6B7A90` | Subheads, body |
| `ink.muted` | `#3A4455` | Metadata, borders |
| `accent.green` | `#00FF88` | Status pill, primary CTA |
| `accent.green.dark` | `#00CC6A` | CTA hover |
| `border.subtle` | `#131C2C` | Panel edges |
| `status.live` | `#00FF88` | Live indicator |

One color: electric green on near-black. Everything else is a gray scale.

## 4. Typography

- **Display:** Inter 700, `clamp(36px, 5vw, 64px)`, tracking `-0.02em`, `ink.primary`.
- **Status pill:** Inter 600 11px uppercase tracking `+0.16em`, `holo.green`: `* live campus listings`.
- **Terminal mono:** `JetBrains Mono` 13px — every terminal line. Non-negotiable.
- **Body:** Inter 400 16/27, `ink.secondary`.
- **Feature labels:** `font-mono` 12px uppercase `ink.muted`.

```bash
npm install @fontsource/jetbrains-mono framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│  GIGFORGE                       [* live campus listings]    │  ← nav, green pill pulses
├─────────────────────────┬──────────────────────────────────┤
│                         │                                    │
│  A command center       │  [THREE.JS HOLOGRAPHIC TERMINAL]   │
│  for creative           │                                    │
│  collaboration.         │  $ find vocalist genre:r&b         │  ← 3D text planes
│                         │  > searching 142 musicians...      │    floating in Z-space
│  Deadline-driven.       │  ✓ 8 results · email ready        │
│  Fast. Direct.          │                                    │
│                         │  $ post gig project:podcast        │
│  [ Open gigs + ]        │  > posting brief...               │
│  [ Musicians ]          │  ✓ gig #247 live                  │
│                         │                                    │
│                         │  $ browse cello remote:true        │
│                         │  > filtering...                   │
│                         │  _  ← cursor blink                │
└─────────────────────────┴──────────────────────────────────┘
  
  [── Anonymous browsing ──│── Structured profiles ──│── Email handoff ──]
```

## 6. The Signature: Three.js Holographic Terminal

**Scene:**
- Near-black background (`bg.page` as `<color>`).
- `PerspectiveCamera` at `[0, 0, 8]` looking at `[0, 0, 0]`, `fov: 45`.

**Command planes:**
- Each line of terminal output is a `PlaneGeometry(4.5, 0.32)` mesh.
- Material: `MeshBasicMaterial`, `transparent: true`, with a canvas-drawn texture containing the command text in JetBrains Mono 13px `holo.green`.
- Lines stack from top to bottom: positions `y = [1.4, 0.98, 0.56, 0.14, -0.28, -0.7, -1.12]`.
- Each plane sits at a slightly different Z: `z = [0.2, 0.1, 0, -0.15, -0.3, -0.5, -0.7]` — a slight Z-stack that gives physical depth.
- Each plane has a slight X-rotation: `rotation.x = -0.04` — they tilt back as they recede, like a stack of cards seen from slightly above.

**Glow effect:**
- Behind each text plane: a duplicate `PlaneGeometry(4.7, 0.5)` with `MeshBasicMaterial` `holo.green.glow`, at `z - 0.01` — the text glows through the plane behind it.
- `ambientLight` 0.1 (near-zero ambient — the glows are the only light sources).
- Per-line: a tiny `PointLight` at the plane center, `holo.green`, intensity `0.8`, decay `3` — physically illuminates nearby planes.

**Typing simulation (Framer + Three.js):**
- On mount, lines "type in" over time. Each line's canvas texture updates character by character via `setInterval(60ms)`. The texture is `needsUpdate = true` after each character — the line appears to type itself.
- After a line completes: `✓` result line fades in (opacity `0 → 1` in Three.js via material opacity over 300ms).
- After all lines complete: cursor plane blinks (`opacity: 1 → 0.2` every 530ms).
- Cycle: after 8 seconds, all lines clear and a new command begins.

**Cursor tilt:**
- `useFrame` + `pointer` from `useThree`: `group.rotation.y += (pointer.x * 0.2 - group.rotation.y) * 0.04`, `group.rotation.x += (-pointer.y * 0.12 - group.rotation.x) * 0.04`.
- The entire terminal tilts toward the cursor — a physical holographic display swiveling.

`prefers-reduced-motion`: terminal static (last frame of typing), no tilt, cursor doesn't blink.

## 7. Status Pill — Framer Motion

The `* live campus listings` pill in the nav:
```tsx
// Green dot pulses:
animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
```

Pill itself breathes:
```tsx
animate={{ boxShadow: ["0 0 0px rgba(0,255,136,0)", "0 0 12px rgba(0,255,136,0.3)", "0 0 0px rgba(0,255,136,0)"] }}
transition={{ repeat: Infinity, duration: 3 }}
```

## 8. Feature Row — Terminal Blocks

Three feature blocks in a horizontal grid, each in a dark bordered panel:

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ > anonymous_browse  │  │ > structured_profile │  │ > email_handoff     │
│ ───────────────────  │  │ ──────────────────── │  │ ──────────────────── │
│ No account. Browse  │  │ Instruments, campus, │  │ Their email is on   │
│ the full directory. │  │ portfolio, avail.    │  │ every profile. Done. │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

Command line in `holo.green` `font-mono`. Divider `holo.green.dim` at 30% opacity. Body `ink.secondary`.

Framer entrance: `initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}` → `whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}`. Stagger 0.1s. The blur-in matches the holographic materialization of the terminal.

## 9. CTAs

**Primary** — `Open gigs +`:
```
bg: #00FF88
text: #07090F
height: 50px, px: 28px
radius: 4px
font: Inter 600, 15px
hover: bg #00CC6A, shadow 0 0 24px rgba(0,255,136,0.35)
transition: spring stiffness 300 damping 22
```

The green CTA is the brightest element on the page — eyes find it immediately after the terminal.

**Secondary** — `Musicians`:
```
bg: transparent
border: 1px rgba(0,255,136,0.3)
text: #00FF88
hover: border rgba(0,255,136,0.8), bg rgba(0,255,136,0.06)
```

## 10. Stats

```
142 musicians      24 open gigs      12 universities
```

JetBrains Mono 700 56px `holo.green`. Labels `font-mono` 11px `ink.muted`. Framer count-up on `useInView`, 1.4s. The green numbers counting up on black look like a diagnostic scan completing.

## 11. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei @fontsource/jetbrains-mono
```

## 12. Implementation Notes

- `HoloTerminal.tsx` — Three.js, `dynamic(..., { ssr: false })`. Canvas fills the right hero column.
- Canvas texture per line: `800 × 64px` canvas. `ctx.font = "13px 'JetBrains Mono', monospace"`. Font must be loaded (via `@fontsource/jetbrains-mono` imported in parent) before canvas draw.
- Typing interval: store each line's current char count in a `useRef` array. `setInterval(55, ...)` increments the target line's char count and calls `texture.needsUpdate = true`. Stop interval when all chars are shown.
- `PointLight` per line: parent each to the corresponding plane `<group>` so they move with the tilt.
- Feature block blur-in: only use `filter: "blur()"` in Framer on elements outside the Three.js canvas — CSS filters on canvas-containing elements cause GPU compositing issues.
- `prefers-reduced-motion`: show final state of all terminal lines statically.

## 13. The Test

Time how long it takes you to read the three command-result pairs in the terminal. If you can read all three in under 8 seconds, the typing speed is correct. If you're waiting for it, increase the character rate from 55ms to 35ms. Then minimize the terminal. The page should still communicate the product value via the headline and CTAs alone — the terminal enhances, it doesn't carry the load.
