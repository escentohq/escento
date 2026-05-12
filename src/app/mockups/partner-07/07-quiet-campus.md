# Landing Design 07 — **Campus Network**

> I've built identity systems for four university tools and two professional networks. The insight I keep coming back to: campus products fail when they feel like consumer apps. They succeed when they feel like infrastructure — the kind of thing a department chair links to, not just a student. Campus Network applies that lesson with a twist: behind the professional white grid, a Three.js campus map renders in real time — a topographic wireframe of a generic university quad, glowing dots marking which buildings have active musicians. It's institutional AND alive.

---

## 1. The Concept

Wide, clean, white. Left half: the pitch and CTAs. Right half: a 2-column mini-directory of real musician profiles with Framer Motion 3D tilt. But the REAL signature is below: a Three.js topographic campus wireframe — imagine a Google Maps elevation view of a university campus, rendered in indigo lines on white, with glowing blue dots pulsing at music buildings. This is the network made spatial. You can see which campuses are active.

## 2. Why This Direction

LinkedIn's network map concept but made physical and geographic. GigForge IS a campus product — it lives in specific places (UT Austin, Berklee, NYU). Showing a stylized campus topology makes the product feel grounded in real academic geography. The wireframe aesthetic is technical enough to feel credible to music tech students, warm enough to feel accessible to performance majors. The glowing campus dots are the activity feed made cartographic.

## 3. Color System

| Token | Hex | Use |
|---|---|---|
| `bg.page` | `#FFFFFF` | Pure white professional base |
| `bg.section` | `#F8F9FF` | Alternating section — faint indigo tint |
| `bg.card` | `#FFFFFF` | Profile cards |
| `bg.pill` | `#EEF3FB` | Skill tag backgrounds |
| `topo.line` | `rgba(45,63,219,0.12)` | Campus wireframe contour lines |
| `topo.active` | `#2D3FDB` | Active campus marker dots |
| `topo.pulse` | `rgba(45,63,219,0.08)` | Pulse ring expanding from active dot |
| `topo.grid` | `rgba(45,63,219,0.05)` | Background grid behind campus map |
| `border.heavy` | `#1F1B16` | Nav bottom rule — the one dark structural line |
| `border.card` | `rgba(0,0,0,0.08)` | Card edges |
| `border.divider` | `rgba(0,0,0,0.10)` | Section separators |
| `ink.primary` | `#191919` | All primary text |
| `ink.secondary` | `#555555` | Subheads, card meta |
| `ink.muted` | `#888888` | Timestamps, labels |
| `accent.blue` | `#0A66C2` | CTA, links, active card states |
| `accent.indigo` | `#2D3FDB` | Campus map accent — distinct from CTA blue |
| `accent.gold` | `#B8860B` | Wordmark underline only — one use |

Two blues: professional CTA blue + deeper indigo for the campus map. They're related but distinct.

## 4. Typography

- **Display:** Inter 700, `clamp(48px, 6.5vw, 88px)`, tracking `-0.025em`, leading `1.0`. Large because it has space.
- **Subhead:** Inter 400, `clamp(16px, 1.5vw, 20px)`, leading `1.6`, `ink.secondary`.
- **Mono eyebrow:** `font-mono` 12px uppercase tracking `+0.1em`, `ink.muted`: `CAMPUS LABEL · SPRING '26`
- **Body:** Inter 400, 16/26.
- **Card name:** Inter 600, 18px.
- **Map label:** `font-mono` 9px uppercase `topo.active` — campus names on the map.

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 5. Layout

```
┌────────────────────────────────────────────────────────────────┐
│   GIGFORGE ── (gold underline)   Sign in  →                     │
│   ──────────────────────────────────────────────────────────   │
├────────────────────────────┬───────────────────────────────────┤
│                            │                                     │
│   CAMPUS LABEL · SPRING '26│  ┌────────────┐  ┌────────────┐  │
│                            │  │ ● Maya C.   │  │ ● Jordan L. │  │  ← 3D tilt cards
│   Find the right           │  │  Guitar     │  │  Cello      │  │
│   student musician         │  │  UT Austin  │  │  USC        │  │
│   for your next project.   │  └────────────┘  └────────────┘  │
│                            │  ┌────────────┐  ┌────────────┐  │
│   The campus directory     │  │ ● Sam P.    │  │ ● Priya K.  │  │
│   for student creators.    │  │  Piano      │  │  Violin     │  │
│   No feed. Direct email.   │  │  Berklee    │  │  UCLA       │  │
│                            │  └────────────┘  └────────────┘  │
│   [ Browse musicians ]     │                                     │
│   Post a gig               │  + 138 more musicians →            │
│                            │                                     │
└────────────────────────────┴───────────────────────────────────┘

╔══════════════════ THREE.JS CAMPUS MAP (full width) ════════════╗
║  Topographic wireframe of university campus + active dots      ║
╚════════════════════════════════════════════════════════════════╝

[ Stat row ] [ How it works ] [ This week section ]
```

Left/right split is 45/55. Campus map is below the fold — a discovery moment as the user scrolls.

## 6. Mini-Directory Cards — Framer Motion 3D Tilt

Four profile cards in the right column. Each card uses cursor tracking via `useMotionValue`:

```tsx
const mouseX = useMotionValue(0);
const mouseY = useMotionValue(0);
const rotateY = useTransform(mouseX, [-1, 1], [-5, 5]);
const rotateX = useTransform(mouseY, [-1, 1], [4, -4]);

<motion.div
  style={{ rotateX, rotateY, transformPerspective: 1200 }}
  onPointerMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width * 2 - 1);
    mouseY.set((e.clientY - rect.top) / rect.height * 2 - 1);
  }}
  onPointerLeave={() => { mouseX.set(0); mouseY.set(0); }}
  whileHover={{ boxShadow: "0 8px 24px rgba(10,102,194,0.12)" }}
>
```

On hover: `border-left: 3px solid #0A66C2` appears and arrow nudges right 4px:
```tsx
whileHover={{ borderLeftWidth: "3px", x: 2 }}
transition={{ type: "spring", stiffness: 300, damping: 25 }}
```

**Grid entrance stagger:**
```tsx
const containerVariants = { visible: { transition: { staggerChildren: 0.09 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
};
```

## 7. The Signature: Three.js Campus Topology Map

**Scene setup:**
- `OrthographicCamera` looking down Z. The map is purely 2D — flat on the screen, but rendered in 3D space.
- Background: tight `GridHelper`-style grid at `topo.grid` — `0.5px` lines at 0.3 unit spacing, spanning the full canvas width.

**Topographic contours:**
- 8 concentric `THREE.CatmullRomCurve3` closed curves representing elevation contours of a stylized campus quad
- Curves are handcrafted `Vector3` arrays — organic but recognizable as a map
- `THREE.Line` material `topo.line` (indigo 12% opacity), 1px
- The innermost contour (highest elevation) is `indigo 25% opacity` — the center of campus

**Active campus dots:**
- 6 `CircleGeometry(0.15, 16)` markers at specific map coordinates — each represents a university (UT Austin, Berklee, NYU, USC, UCLA, Juilliard)
- Material: `MeshBasicMaterial` `topo.active` (`#2D3FDB`)
- Campus name label via `<Html>` overlay: `font-mono` 9px uppercase, nudged 14px above the dot
- Each dot has a pulse ring: `RingGeometry` expanding outward, `opacity` interpolated `1 → 0` via `uPulse` uniform over 2s, then resets. Staggered start times so not all campuses pulse simultaneously.
- Pulse rings: `topo.pulse` (`rgba(45,63,219,0.08)`) — subtle, not alarm-like

**Hover interaction:**
- `raycaster` detects hover over campus dots
- Hovered dot: scales to 2×, label becomes `ink.primary` (was `ink.muted`), tooltip appears via `<Html>`: `"14 musicians active"`
- Hovered dot's contour ring brightens to 40% opacity

**Map entrance (Framer Motion on scroll):**
```tsx
initial={{ opacity: 0, scale: 0.96 }}
whileInView={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
viewport={{ once: true, margin: "-100px" }}
```

The whole map section fades and scales in on scroll — feels like a map loading.

`prefers-reduced-motion`: no pulse rings, no entrance animation, no dot hover scale. Static map.

## 8. Stats — Animated Counters

```
142          24 open         12
musicians    gigs            universities
```

Numbers in Inter 700 56px `ink.primary`. Framer `animate()` count-up on `useInView`, 1.4s `ease: "easeOut"`. Below each number: a small link arrow `→` in `accent.blue`.

## 9. CTAs

**Primary** — `Browse musicians`:
```
bg: #0A66C2
text: #FFFFFF
height: 52px, px: 28px
radius: 4px (institutional, not pill)
font: Inter 600, 15px
hover: bg #004182
focus ring: 3px rgba(10,102,194,0.25)
shadow: 0 4px 16px rgba(10,102,194,0.2)
```

**Secondary** — `Post a gig`:
```
bg: none, border: none
text: #0A66C2
underline: 1px offset 3px
hover: underline deepens to #004182, x: +4 via Framer
```

## 10. How It Works

```
01  Browse the directory       No account. Just search.
02  Find someone you like      Their email is right there.
03  Reach out directly         No DMs. No platform. No fee.
```

Framer stagger on scroll. Numbers `accent.blue` `font-mono`. Lines `ink.primary` 600. Body `ink.secondary`.

## 11. Wordmark Treatment

`GIGFORGE` in Inter 700 20px, tracking `+0.04em`. A 20px gold line (`accent.gold`) under the `GIG` portion only — subtle brand flourish. Nav only. Never repeated.

## 12. Required Libraries

```bash
npm install framer-motion three @react-three/fiber @react-three/drei
```

## 13. Implementation Notes

- `CampusMap.tsx` — Three.js scene, always `dynamic(..., { ssr: false })`. Canvas height: `340px desktop / 220px mobile`.
- Contour curves: define 8 `CatmullRomCurve3` objects with `closed: true`. Generate `curve.getPoints(128)` for each. Convert to `Float32Array`, pass to `BufferGeometry.setAttribute('position', ...)`. This is more performant than individual `Line2` objects.
- Pulse rings: each is a `THREE.Mesh` with `RingGeometry(r, r + 0.04, 32)` where `r` grows each frame. Reset when `r > 0.9`. Stagger start: `phaseOffset[i] = i * (2000 / numCampuses)` ms.
- Card tilt: independent `useMotionValue` instances per card — never share motion values between cards or you'll get synchronized tilt.
- `prefers-reduced-motion`: `useReducedMotion()` from Framer — skip tilt, skip pulse rings, skip entrance animation, skip count-up.

## 14. The Test

Show to a university music department administrator. Cover the headline. Point to the campus map. If they say "that looks like campus" (any campus), the topographic contours are working. Point to the active dots. If they say "those must be active users or locations," the pulse animation is legible. Both reads must happen without explanation. If either fails, increase contour line opacity by 0.06 and dot pulse ring opacity by 0.03.
