# Landing Design 03 — **Studio Ledger**

> I've shipped financial dashboards, research tools, and studio-management software. The most trusted interfaces all share one quality: they look like they were built by someone who takes the work seriously. Studio Ledger translates that into a GigForge landing — the main Three.js piece isn't a particle field or a waveform, it's a floating 3D data terminal: a Bloomberg-style panel hovering in space, its rows updating in real time, panels tilting slightly as you move your cursor. The page looks like professional infrastructure. It IS professional infrastructure.

---

## 1. The Concept

Cool light gray page — the color of a hardware rack panel. A Three.js floating terminal panel dominates the right half of the hero: a dark, precisely bordered 3D rectangle with live-updating row data, physically tilting toward the cursor like a monitor swiveling on an arm. Left side: a focused headline and two CTAs. Below: the GigForge pitch in a three-column feature grid that looks like it was typeset in a studio manual. This page is for the student who has a deadline next week and does not have time to be charmed.

## 2. Why This Direction

Every music directory looks like a music app. Studio Ledger looks like a professional tool — because it is one. The floating 3D terminal is not decoration: it shows the actual product (profiles, gigs, status) in a format that communicates trust and precision. Students working against real creative deadlines respond to tools that look competent. This page says "we built this with the same rigor you bring to your sessions."

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#EEF0F4` | Cool light gray — rack panel neutral |
| `bg.terminal` | `#0F1118` | 3D terminal panel background |
| `bg.terminal.row` | `#151A24` | Alternating data row |
| `bg.surface` | `#FFFFFF` | Secondary panels, cards |
| `terminal.border` | `#1E2A3A` | Terminal panel edge hairline |
| `terminal.header` | `#1A2232` | Terminal header band |
| `terminal.text` | `#B8C8DC` | Terminal data text — blue-gray |
| `terminal.value` | `#E8F0FA` | Highlighted values |
| `terminal.green` | `#4ADE80` | Status OPEN — bright green on dark |
| `terminal.amber` | `#FBBF24` | Deadline warnings |
| `ink.primary` | `#0F1420` | Page headlines, body |
| `ink.secondary` | `#4A5568` | Subheads, metadata |
| `ink.muted` | `#8896A8` | Labels, captions |
| `accent.blue` | `#2563EB` | Primary CTA, active states |
| `accent.blue.light` | `#EFF6FF` | CTA hover background on light surface |
| `border.panel` | `rgba(15,20,40,0.1)` | Page-level panel borders |

Dark terminal precision on a cool neutral page. Blue CTA is the only chromatic accent on the light surface.

## 4. Typography

- **Display:** Inter 700, `clamp(36px, 5vw, 64px)`, tracking `-0.025em`, leading `1.05`.
- **Kicker:** Inter 500 11px uppercase tracking `+0.18em`, `ink.muted`: `BUILT FOR STUDENT PROJECTS · SPRING SEMESTER`.
- **Body:** Inter 400, 16/27, `ink.secondary`.
- **Terminal mono:** `JetBrains Mono` 12px, `terminal.text` — all terminal content.
- **Feature numbers:** `font-mono` 13px `ink.muted`.

```bash
npm install @fontsource/jetbrains-mono framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```
┌────────────────────────────────────────────────────────────┐
│  GigForge                                     [ Sign in ]  │  ← nav, border-b
├──────────────────────────────┬─────────────────────────────┤
│                              │                               │
│  BUILT FOR STUDENT PROJECTS  │  ┌─────────────────────────┐ │  ← 3D terminal (Three.js)
│                              │  │ ▸ GigForge Terminal      │ │    tilts with cursor
│  A calmer way to find        │  │ ────────────────────────  │ │
│  collaborators before        │  │ Project    Short film     │ │
│  the deadline.               │  │ Needs      Cello, synth  │ │
│                              │  │ Deadline   Apr 18         │ │
│  Structured profiles.        │  │ Status     OPEN           │ │
│  Direct email contact.       │  │ ────────────────────────  │ │
│  No chaos.                   │  │ + 23 more open           │ │
│                              │  └─────────────────────────┘ │
│  [ Browse gigs ]             │                               │
│  [ Create profile ]          │                               │
│                              │                               │
└──────────────────────────────┴─────────────────────────────┘

│── 01 Filter people ──│── 02 Post briefs ──│── 03 Contact ──│
```

The 3D terminal on the right is the product preview. It is the hero.

## 6. The Signature: Three.js Floating Data Terminal

**The panel:**
- `BoxGeometry(3.8, 2.8, 0.08)` — the monitor casing. `MeshStandardMaterial` `terminal.header` color, `roughness: 0.4`, `metalness: 0.6` — brushed aluminum.
- Screen face: `PlaneGeometry(3.4, 2.4)` positioned 0.042 in Z in front of the box. Material: `MeshBasicMaterial` `terminal.bg` — the dark screen.
- `<Html>` overlay on the screen face: the actual data rows rendered in DOM, styled with `JetBrains Mono`. Content updates every 4 seconds — new rows slide in, old ones slide out via Framer `AnimatePresence` inside the overlay.
- Bezel: the 0.2-unit gap between screen and casing edge, subtly darker — achieved by the geometry offset.
- Corner: `1px` border on the `<Html>` content — `terminal.border`.

**Physical tilt:**
- `useMotionValue` on the parent group — maps cursor position to `rotateY` (`-8deg` → `+8deg`) and `rotateX` (`+5deg` → `-5deg`).
- Lerp in `useFrame`: `group.rotation.y += (targetY - group.rotation.y) * 0.06`. No spring — linear damping feels like a real monitor arm, not a bouncy toy.
- `perspective` on the canvas container: `1400px` — gives the tilt depth.

**Row data cycling:**
```
Row 1: Project / Short film score / Status: OPEN
Row 2: Needs   / Cello, ambient synth / Matches: 3
Row 3: Deadline/ April 18 / Contact: Direct email
Row 4: Campus  / UT Austin / Verified profile
```

Every 4s: `AnimatePresence` swaps in a new project (pulls from a static array of 5 fake projects). New row `initial={{ x: 24, opacity: 0 }}` → `animate={{ x: 0, opacity: 1 }}`. Old row `exit={{ x: -24, opacity: 0 }}`.

**Lighting:**
- `ambientLight` 0.4, cool white
- `directionalLight` from `[2, 5, 4]` intensity 0.7 — the monitor face catches a hot spot
- `pointLight` inside the bezel at intensity 0.3 color `#2563EB` — a subtle blue screen-glow on the surrounding surface

`prefers-reduced-motion`: terminal static, no tilt, no row cycling.

## 7. Live Status Ticker (Framer Motion)

Above the fold, a thin bar in `bg.terminal` spanning full width, 36px tall:

```
● 24 gigs open  ·  142 musicians active  ·  3 new profiles today  ·  ● 24 gigs open  ·  …
```

Framer Motion scroll marquee, speed 25s. `●` pulses every 2s via `animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}`.

## 8. Feature Grid — Studio Manual Style

Three columns separated by 1px `border.panel` vertical rules:

```
01  Filter people
    Search by instrument, campus,
    genre, and availability.
    No account needed to browse.

02  Post briefs
    Describe your project clearly.
    Set a deadline. List what you need.
    Profiles find you.

03  Contact directly
    Email is on every profile.
    No platform DM. No matching fee.
    Your inbox, their inbox.
```

Framer entrance per column: `initial={{ opacity: 0, y: 24 }}`, stagger `0.12s`. On scroll.

## 9. Stats

```
142 musicians      24 open gigs      12 universities
```

Numbers in Inter 700 64px `ink.primary`. Framer `animate()` count-up on `useInView`, 1.4s. Below each: a `terminal.green` status pill — `● LIVE`.

## 10. CTAs

**Primary** — `Browse gigs`:
```
bg: #2563EB
text: #FFFFFF
height: 50px, px: 24px
radius: 6px
font: Inter 600, 15px
hover: bg #1D4ED8, shadow 0 4px 20px rgba(37,99,235,0.35)
transition: spring stiffness 280 damping 20
```

**Secondary** — `Create profile`:
```
bg: #FFFFFF
border: 1.5px rgba(15,20,40,0.15)
text: #0F1420
radius: 6px
hover: border #2563EB, bg #EFF6FF
```

## 11. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei @fontsource/jetbrains-mono
```

## 12. Implementation Notes

- `DataTerminal.tsx` — Three.js, `dynamic(..., { ssr: false })`. Canvas height fills the right hero column.
- The `<Html>` inside Three.js needs `transform={false}` and `occlude={false}` for correct 2D overlay rendering on the screen face.
- Row cycling: store 5 project objects in a `useState` array. `setInterval(4000)` → `setCurrentIdx((i) => (i + 1) % projects.length)`. `AnimatePresence mode="wait"` on the row container.
- Terminal tilt: use `useRef<THREE.Group>` and mutate `rotation` in `useFrame` for smooth 60fps response — not a React state update.
- The `BoxGeometry` bezel tilt means the `<Html>` screen overlay must also tilt. This happens automatically since `<Html>` inherits the group's world matrix.
- Status ticker: duplicate content 4× to guarantee no gap visible at any viewport width.

## 13. The Test

Show to a student with a final project due in two weeks. Open the page. If they lean forward and try to read the terminal data within 8 seconds, the design is working. If they look at the headline first and the terminal second, the terminal needs to be 20% larger or the contrast between the dark panel and the light page needs to increase. The terminal should be the first thing the eye finds — not the headline.
